const levels = [
  {
    name: "Sky Shredder",
    creator: "Creator",
    globalRank: 181,
    attempts: "—",
    completed: "—",
    worstFail: "—",
    enjoyment: "—",
    video: "",
    image: "images/sky-shredder.jpg",
    note: "Your hardest completion."
  },
  {
    name: "Level Two",
    creator: "Creator",
    globalRank: 240,
    attempts: "—",
    completed: "—",
    worstFail: "—",
    enjoyment: "—",
    video: "",
    image: "images/level-two.jpg",
    note: ""
  },
  {
    name: "Level Three",
    creator: "Creator",
    globalRank: 315,
    attempts: "—",
    completed: "—",
    worstFail: "—",
    enjoyment: "—",
    video: "",
    image: "images/level-three.jpg",
    note: ""
  },
  {
    name: "Level Four",
    creator: "Creator",
    globalRank: 420,
    attempts: "—",
    completed: "—",
    worstFail: "—",
    enjoyment: "—",
    video: "",
    image: "images/level-four.jpg",
    note: ""
  },
  {
    name: "Level Five",
    creator: "Creator",
    globalRank: null,
    attempts: "—",
    completed: "—",
    worstFail: "—",
    enjoyment: "—",
    video: "",
    image: "images/level-five.jpg",
    note: ""
  }
];

const FALLBACK_BACKGROUNDS = [
  "linear-gradient(135deg, #171b31, #3d2056 50%, #12131b)",
  "linear-gradient(135deg, #14222e, #153e52 48%, #11131c)",
  "linear-gradient(135deg, #251521, #552239 50%, #151018)",
  "linear-gradient(135deg, #162018, #2c492f 48%, #111712)",
  "linear-gradient(135deg, #262016, #5b4720 50%, #17140e)"
];

const levelList = document.getElementById("levelList");
const searchInput = document.getElementById("searchInput");
const resultsText = document.getElementById("resultsText");
const emptyState = document.getElementById("emptyState");
const completionCount = document.getElementById("completionCount");
const hardestName = document.getElementById("hardestName");
const lastUpdated = document.getElementById("lastUpdated");

completionCount.textContent = levels.length;
hardestName.textContent = levels[0]?.name || "—";
lastUpdated.textContent = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date());

function formatGlobalRank(rank) {
  return Number.isFinite(rank) ? `#${rank}` : "Unranked";
}

function createCard(level, index) {
  const article = document.createElement("article");
  article.className = "level-card";

  const fallback = FALLBACK_BACKGROUNDS[index % FALLBACK_BACKGROUNDS.length];
  const safeImage = level.image || "";

  article.innerHTML = `
    <div class="level-bg" style="background-image: linear-gradient(rgba(0,0,0,.08), rgba(0,0,0,.08)), url('${safeImage}'), ${fallback};" aria-hidden="true"></div>
    <div class="level-overlay" aria-hidden="true"></div>

    <button class="level-header" type="button" aria-expanded="false">
      <span class="personal-rank">#${index + 1}</span>
      <span class="level-title-wrap">
        <span class="level-name">${escapeHTML(level.name)}</span>
        <span class="level-creator">${escapeHTML(level.creator || "")}</span>
      </span>
      <span class="global-rank ${Number.isFinite(level.globalRank) ? "" : "unranked"}">${formatGlobalRank(level.globalRank)}</span>
    </button>

    <div class="chevron" aria-hidden="true">⌄</div>

    <div class="level-details-wrap">
      <div class="level-details-inner">
        <div class="level-details">
          <div class="detail-grid">
            <div class="detail-item"><span class="detail-label">Attempts</span><span class="detail-value">${escapeHTML(String(level.attempts ?? "—"))}</span></div>
            <div class="detail-item"><span class="detail-label">Completed</span><span class="detail-value">${escapeHTML(String(level.completed ?? "—"))}</span></div>
            <div class="detail-item"><span class="detail-label">Worst Fail</span><span class="detail-value">${escapeHTML(String(level.worstFail ?? "—"))}</span></div>
            <div class="detail-item"><span class="detail-label">Enjoyment</span><span class="detail-value">${escapeHTML(String(level.enjoyment ?? "—"))}</span></div>
          </div>
          <div class="detail-bottom">
            <p class="level-note">${escapeHTML(level.note || "")}</p>
            ${level.video ? `<a class="video-link" href="${escapeHTML(level.video)}" target="_blank" rel="noopener noreferrer">▶ Watch completion</a>` : `<span class="video-link disabled">▶ No video added</span>`}
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
      history.replaceState(null, "", `#${slugify(level.name)}`);
    } else {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  });
  return article;
}

function renderLevels(items = levels.map((level, originalIndex) => ({ level, originalIndex }))) {
  levelList.innerHTML = "";
  items.forEach(({ level, originalIndex }) => levelList.appendChild(createCard(level, originalIndex)));
  resultsText.textContent = items.length === levels.length ? `${levels.length} levels` : `${items.length} of ${levels.length}`;
  emptyState.hidden = items.length !== 0;
}

function filterLevels() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = levels.map((level, originalIndex) => ({ level, originalIndex })).filter(({ level }) =>
    level.name.toLowerCase().includes(query) || (level.creator || "").toLowerCase().includes(query)
  );
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
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function escapeHTML(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

searchInput.addEventListener("input", filterLevels);
renderLevels();
openHashLevel();
