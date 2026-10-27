const videos = [
  { id: 1, title: "Golden hour, slow mornings", creator: "Mila S.", category: "Atmosphere", duration: "12:48", views: 24800, age: "2 days ago", description: "A soft-focus, fictional mood piece with warm light, a quiet room, and a little room to breathe.", initials: "MS" },
  { id: 2, title: "Somewhere by the water", creator: "Blue Hour Studio", category: "Lifestyle", duration: "18:06", views: 19600, age: "1 day ago", description: "A serene coastal escape told through color, movement, and a slow afternoon by the water.", initials: "BH" },
  { id: 3, title: "The little things we notice", creator: "Noa & Co.", category: "Stories", duration: "09:32", views: 17300, age: "4 days ago", description: "A fictional story about shared rituals and the details that make a day.", initials: "NC" },
  { id: 4, title: "After the last train", creator: "Theo R.", category: "Creators", duration: "14:17", views: 15200, age: "5 days ago", description: "City lights, a nearly empty platform, and a cinematic pause before the night begins.", initials: "TR" },
  { id: 5, title: "A room full of color", creator: "Sunday Studio", category: "Lifestyle", duration: "11:24", views: 13800, age: "6 days ago", description: "An expressive portrait study exploring textiles, rich colors, and natural window light.", initials: "SS" },
  { id: 6, title: "Notes from the blue hour", creator: "Mila S.", category: "Stories", duration: "16:50", views: 12100, age: "1 week ago", description: "A dreamlike short visual diary from the in-between hours of evening.", initials: "MS" },
  { id: 7, title: "Make space to unwind", creator: "Wellbeing by Ari", category: "Wellness", duration: "08:41", views: 10400, age: "1 week ago", description: "A calming, fictional wellness session about slowing down and making space for yourself.", initials: "WA" },
  { id: 8, title: "Little sparks, late nights", creator: "Noa & Co.", category: "Atmosphere", duration: "13:09", views: 9600, age: "2 weeks ago", description: "A playful, neon-tinted vignette about spontaneous plans and a city that stays awake.", initials: "NC" }
];

const $ = (selector) => document.querySelector(selector);
const grid = $("#grid");
const search = $("#search");
const videoDialog = $("#video-dialog");
const reportDialog = $("#report-dialog");
let category = "All";
let toastTimer;

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function render() {
  const query = search.value.trim().toLocaleLowerCase();
  let results = videos.filter((video) => {
    const matchesCategory = category === "All" || video.category === category;
    const matchesQuery = !query || `${video.title} ${video.creator} ${video.category} ${video.description}`.toLocaleLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });
  if ($("#sort").value === "newest") results = [...results].reverse();
  if ($("#sort").value === "title") results = [...results].sort((a, b) => a.title.localeCompare(b.title));
  if ($("#sort").value === "popular") results = [...results].sort((a, b) => b.views - a.views);

  grid.replaceChildren(...results.map(createCard));
  $("#result-count").textContent = `Showing ${results.length} ${results.length === 1 ? "video" : "videos"}`;
  $("#empty").hidden = results.length > 0;
  grid.hidden = results.length === 0;
}

function createCard(video) {
  const card = document.createElement("article");
  card.className = "card";
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `View details for ${video.title}`);
  const views = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(video.views);
  card.innerHTML = `<div class="thumbnail"><div class="thumb-art art-${video.id}" aria-hidden="true"><span class="silhouette"></span></div><span class="play" aria-hidden="true">▶</span><span class="duration">${video.duration}</span></div>
    <div class="meta"><span class="creator-avatar av-${video.id}" aria-hidden="true">${video.initials}</span><div class="copy"><h3 class="title">${escapeHtml(video.title)}</h3><p class="creator">${escapeHtml(video.creator)}</p><div class="stats"><span>${views} views</span><span>·</span><span>${video.age}</span></div></div><button class="more" type="button" aria-label="Report ${escapeHtml(video.title)}" title="Report listing">⋯</button></div>`;
  card.addEventListener("click", (event) => {
    if (event.target.closest(".more")) {
      reportDialog.showModal();
    } else openVideo(video);
  });
  card.addEventListener("keydown", (event) => {
    if (event.target === card && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openVideo(video);
    }
  });
  return card;
}

function openVideo(video) {
  $("#detail-title").textContent = video.title;
  $("#detail-category").textContent = video.category;
  $("#detail-duration").textContent = video.duration;
  $("#detail-creator").textContent = `By ${video.creator} · ${new Intl.NumberFormat("en", { notation: "compact" }).format(video.views)} views`;
  $("#detail-description").textContent = video.description;
  $("#player").style.background = getComputedStyle($(`.art-${video.id}`)).getPropertyValue("--bg-art");
  videoDialog.showModal();
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 4300);
}

$("#search-form").addEventListener("submit", (event) => { event.preventDefault(); render(); });
search.addEventListener("input", render);
$("#sort").addEventListener("change", render);
$("#categories").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  category = button.dataset.category;
  $("#categories").querySelectorAll(".chip").forEach((chip) => {
    const active = chip === button;
    chip.classList.toggle("active", active);
    chip.setAttribute("aria-pressed", String(active));
  });
  render();
});
$("#clear").addEventListener("click", () => {
  category = "All";
  search.value = "";
  $("#categories").querySelectorAll(".chip").forEach((chip) => {
    const active = chip.dataset.category === "All";
    chip.classList.toggle("active", active);
    chip.setAttribute("aria-pressed", String(active));
  });
  render();
});

const ageGate = $("#age-gate");
const blockedGate = $("#blocked-gate");
function setGateActive(active) {
  document.body.classList.toggle("gate-active", active);
  [document.querySelector(".topbar"), document.querySelector("main"), document.querySelector("footer")]
    .forEach((element) => { element.inert = active; });
}
try {
  if (localStorage.getItem("firstd-age-confirmed") === "yes") ageGate.hidden = true;
} catch {
  // Keep the gate active for this visit when browser storage is unavailable.
}
setGateActive(!ageGate.hidden);
if (!ageGate.hidden) $("#age-check").focus();
$("#age-check").addEventListener("change", (event) => { $("#age-enter").disabled = !event.target.checked; });
$("#age-enter").addEventListener("click", () => {
  if (!$("#age-check").checked) return;
  try {
    localStorage.setItem("firstd-age-confirmed", "yes");
  } catch {
    showToast("Age confirmation is only available for this visit because browser storage is disabled.");
  }
  ageGate.hidden = true;
  setGateActive(false);
});
$("#age-decline").addEventListener("click", () => {
  ageGate.hidden = true;
  blockedGate.hidden = false;
  $("#return-age").focus();
});
$("#return-age").addEventListener("click", () => {
  blockedGate.hidden = true;
  ageGate.hidden = false;
  setGateActive(true);
  $("#age-check").focus();
});
ageGate.addEventListener("cancel", (event) => event.preventDefault());

$("#upload-open").addEventListener("click", () => $("#upload-dialog").showModal());
$("#upload-close").addEventListener("click", () => $("#upload-dialog").close());
$("#standards-open").addEventListener("click", () => $("#standards-dialog").showModal());
$("#footer-standards").addEventListener("click", () => $("#standards-dialog").showModal());
$("#standards-close").addEventListener("click", () => $("#standards-dialog").close());
$("#footer-report").addEventListener("click", () => {
  reportDialog.showModal();
});
$("#detail-report").addEventListener("click", () => {
  videoDialog.close();
  reportDialog.showModal();
});
$("#report-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  reportDialog.close();
  event.currentTarget.reset();
  showToast("Demo report noted in this page only. No moderation team received it.");
});

render();
