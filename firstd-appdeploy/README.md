# FirstD

FirstD is a fictional, non-explicit discovery prototype with AppDeploy sign-in and persistent account data.

## Accounts and data

- Sign-in is handled by AppDeploy Auth using its redirect flow. The app does not collect passwords or handle tokens directly.
- Profiles are stored in the `profiles` table, keyed by the authenticated user ID.
- Reports are stored in a per-user table derived from the authenticated user ID. Each user can read only their own report history.
- Demo listing content remains static. Uploads and video streaming are not enabled.
- The database stores display names and submitted report reason/details. Do not submit sensitive personal information in report details.

## Install and offline use

The app includes a web manifest and a service worker. Install it from a supported browser over HTTPS. API and authentication requests are excluded from offline caching.

## Safety and policy

The 18+ confirmation remains a browser-side check, not verified age or identity. This prototype still needs real age/consent verification, moderation and takedown workflows before accepting real uploads. The sign-in screen uses placeholder terms and privacy links until app-owned documents are supplied.
