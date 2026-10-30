import { db, error, json, requireAuth, router } from '@appdeploy/sdk';

const REPORT_REASONS = new Set([
  'Non-consensual or intimate content',
  'Person may be under 18',
  'Copyright or ownership concern',
  'Misleading or harmful listing',
  'Other safety concern',
]);

function reportsTableFor(userId: string) {
  const safeId = userId.replace(/[^A-Za-z0-9]/g, '');
  if (!safeId) throw new Error('Invalid authenticated user ID');
  return `reports_${safeId}`;
}

async function ensureProfile(user: { userId: string; name?: string }) {
  const [existing] = await db.get('profiles', [user.userId], {
    consistent: true,
  });
  if (existing) return existing;

  const [createdId] = await db.tx.add('profiles', [
    {
      id: user.userId,
      display_name: user.name ?? '',
      created_at: new Date().toISOString(),
    },
  ]);

  if (!createdId) {
    const [createdByAnotherRequest] = await db.get('profiles', [user.userId], {
      consistent: true,
    });
    if (createdByAnotherRequest) return createdByAnotherRequest;
    throw new Error('Profile creation did not complete');
  }

  const [created] = await db.get('profiles', [user.userId], {
    consistent: true,
  });
  if (!created) throw new Error('Profile could not be loaded after creation');
  return created;
}

export const handler = router({
  'GET /api/profile': [
    requireAuth(),
    async ctx => {
      try {
        const profile = await ensureProfile(ctx.user!);
        return json({ profile });
      } catch {
        return error('Unable to load profile', 500);
      }
    },
  ],

  'PUT /api/profile': [
    requireAuth(),
    async ctx => {
      const body = ctx.body as { display_name?: unknown } | null;
      const displayName =
        typeof body?.display_name === 'string' ? body.display_name.trim() : '';
      if (!displayName || displayName.length > 80) {
        return error('Display name must be between 1 and 80 characters', 400);
      }

      try {
        await ensureProfile(ctx.user!);
        const [updated] = await db.tx.update(
          'profiles',
          [
            {
              id: ctx.user!.userId,
              record: { display_name: displayName },
            },
          ],
          { patch: true }
        );
        if (!updated) return error('Profile could not be updated', 409);
        const [profile] = await db.get('profiles', [ctx.user!.userId], {
          consistent: true,
        });
        return json({ profile });
      } catch {
        return error('Unable to save profile', 500);
      }
    },
  ],

  'GET /api/reports': [
    requireAuth(),
    async ctx => {
      try {
        const table = reportsTableFor(ctx.user!.userId);
        const result = await db.list(table, { limit: 25 });
        const items = result.items.filter(item => item.kind !== 'table_init');
        return json({ items });
      } catch {
        return error('Unable to load reports', 500);
      }
    },
  ],

  'POST /api/reports': [
    requireAuth(),
    async ctx => {
      const body = ctx.body as {
        video_id?: unknown;
        title?: unknown;
        reason?: unknown;
        details?: unknown;
      } | null;
      const reason = typeof body?.reason === 'string' ? body.reason : '';
      const details =
        typeof body?.details === 'string' ? body.details.trim() : '';
      const title =
        typeof body?.title === 'string'
          ? body.title.trim().slice(0, 160)
          : null;
      const videoId =
        typeof body?.video_id === 'number' && Number.isInteger(body.video_id)
          ? body.video_id
          : null;

      if (!REPORT_REASONS.has(reason))
        return error('Choose a valid report reason', 400);
      if (details.length > 500)
        return error('Report details are too long', 400);

      try {
        const table = reportsTableFor(ctx.user!.userId);
        const [id] = await db.add(table, [
          {
            user_id: ctx.user!.userId,
            video_id: videoId,
            title,
            reason,
            details,
            created_at: new Date().toISOString(),
          },
        ]);
        if (!id) return error('Report could not be saved', 503);
        return json({ id, saved: true }, 201);
      } catch {
        return error('Unable to save report', 500);
      }
    },
  ],
});
