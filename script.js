// The order of this array controls the left-side rank:
// first level = #1, second = #2, etc.
//
// For screenshots, just upload the image file directly into the
// main/root of your GitHub repo for now.
// Example: if image is "sky-shredder.jpg", put sky-shredder.jpg
// beside index.html, style.css, and script.js.

const levels = [
  {
    name: "Sky Shredder",
    creator: "Creator",
    globalRank: 181,
    attempts: "—",
    completed: "—",
    worstFail: "—",
    video: "",
    image: "sky-shredder.jpg",
    note: ""
  },
  {
    name: "Level Two",
    creator: "Creator",
    globalRank: 240,
    attempts: "—",
    completed: "—",
    worstFail: "—",
    video: "",
    image: "level-two.jpg",
    note: ""
  },
  {
    name: "Level Three",
    creator: "Creator",
    globalRank: 315,
    attempts: "—",
    completed: "—",
    worstFail: "—",
    video: "",
    image: "level-three.jpg",
    note: ""
  },
  {
    name: "Level Four",
    creator: "Creator",
    globalRank: 420,
    attempts: "—",
    completed: "—",
    worstFail: "—",
    video: "",
    image: "level-four.jpg",
    note: ""
  },
  {
    name: "Level Five",
    creator: "Creator",
    globalRank: null,
    attempts: "—",
    completed: "—",
    worstFail: "—",
    video: "",
    image: "level-five.jpg",
    note: ""
  }
];

const levelList = document.getElementById("levelList");
const searchInput = document.getElementById("searchInput");
const resultsText = document.getElementById("resultsText");
const emptyState = document.getElementById("emptyState");

function formatGlobalRank(rank) {
  return Number.isFinite(rank) ? `#${rank}` : "Unranked";
}

function createCard(level, index) {
  const article = document.createElement("article");
  article.className = "level-card";

  article.innerHTML = `
    <div
      class="level-bg"
      style="background-image: url('${escapeAttribute(level.image || "")}');"
      aria-hidden="true"
    ></div>

    <div class="level-overlay" aria-hidden="true"></div>

    <button class="level-header" type="button" aria-expanded="false">
      <span class="personal-rank">#${index + 1}</span>

      <span class="level-title-wrap">
        <span class="level-name">${escapeHTML(level.name)}</span>
        <span class="level-creator">${escapeHTML(level.creator || "")}</span>
      </span>

      <span class="global-rank ${Number.isFinite(level.globalRank) ? "" : "unranked"}">
        ${formatGlobalRank(level.globalRank)}
      </span>
    </button>

    <div class="chevron" aria-hidden="true">⌄</div>

    <div class="level-details-wrap">
      <div class="level-details-inner">
        <div class="level-details">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">Attempts</span>
              <span class="detail-value">${escapeHTML(String(level.attempts ?? "—"))}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Completed</span>
              <span class="detail-value">${escapeHTML(String(level.completed ?? "—"))}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Worst Fail</span>
              <span class="detail-value">${escapeHTML(String(level.worstFail ?? "—"))}</span>
            </div>
          </div>

          <div class="detail-bottom">
            <p class="level-note">${escapeHTML(level.note || "")}</p>

            ${
              level.video
                ? `<a class="video-link" href="${escapeAttribute(level.video)}" target="_blank" rel="noopener noreferrer">Watch completion</a>`
                : `<span class="video-link disabled">No video added</span>`
            }
          </div>
        </div>
      </div>
    </div>
  `;

  const button = article.querySelector(".level-header");

  button.addEventListener("click", () => {
    const isOpen = article.classList.contains("open");

    document.querySelectorAll(".level-card.open").forEach(card => {
      card.classList.remove("open");
      card.querySelector(".level-header")?.setAttribute("aria-expanded", "false");
    });

    if (!isOpen) {
      article.classList.add("open");
      button.setAttribute("aria-expanded", "true");

      const slug = slugify(level.name);
      history.replaceState(null, "", `#${slug}`);
    } else {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  });

  return article;
}

function renderLevels(items = levels) {
  levelList.innerHTML = "";

  items.forEach(({ level, originalIndex }) => {
    levelList.appendChild(createCard(level, originalIndex));
  });

  const total = items.length;
  resultsText.textContent =
    total === levels.length ? `${levels.length} levels` : `${total} of ${levels.length}`;

  emptyState.hidden = total !== 0;
}

function filterLevels() {
  const query = searchInput.value.trim().toLowerCase();

  const filtered = levels
    .map((level, originalIndex) => ({ level, originalIndex }))
    .filter(({ level }) => {
      return (
        level.name.toLowerCase().includes(query) ||
        (level.creator || "").toLowerCase().includes(query)
      );
    });

  renderLevels(filtered);
}

function openHashLevel() {
  const hash = window.location.hash.slice(1);
  if (!hash) return;

  const targetIndex = levels.findIndex(level => slugify(level.name) === hash);
  if (targetIndex < 0) return;

  const card = levelList.children[targetIndex];
  if (!card) return;

  card.classList.add("open");
  card.querySelector(".level-header")?.setAttribute("aria-expanded", "true");
}

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHTML(String(value));
}

searchInput.addEventListener("input", filterLevels);

renderLevels(levels.map((level, originalIndex) => ({ level, originalIndex })));
openHashLevel();
