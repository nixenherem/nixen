// ============================================================
// YOUR COMPLETIONS
//
// levelId:
//   Geometry Dash level ID. The site uses this to find the level's
//   current AREDL name and position automatically.
//
// fallbackName:
//   Only used if AREDL is temporarily unavailable.
//
// image:
//   For now, upload the image directly beside index.html.
// ============================================================

const levels = [
  {
    levelId: 88136707,
    fallbackName: "Sky Shredder",
    attempts: "—",
    completed: "—",
    worstFail: "—",
    video: "",
    image: "sky-shredder.jpg",
    note: ""
  }

  // Add more levels below:
  //
  // ,
  // {
  //   levelId: 12345678,
  //   fallbackName: "Level Name",
  //   attempts: "12,345",
  //   completed: "Aug 10, 2026",
  //   worstFail: "93%",
  //   video: "https://youtube.com/...",
  //   image: "level-name.jpg",
  //   note: ""
  // }
];

const levelList = document.getElementById("levelList");

function normalizeAredlLevels(payload) {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.levels)) return payload.levels;
    if (Array.isArray(payload.results)) return payload.results;
  }

  return [];
}

async function loadAredlData() {
  try {
    const response = await fetch("/api/aredl", {
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`AREDL request failed with ${response.status}`);
    }

    const payload = await response.json();
    const aredlLevels = normalizeAredlLevels(payload);

    const byId = new Map(
      aredlLevels.map(level => [String(level.level_id), level])
    );

    levels.forEach(level => {
      const match = byId.get(String(level.levelId));

      level.name = match?.name || level.fallbackName || `Level ${level.levelId}`;
      level.globalRank =
        Number.isFinite(Number(match?.position))
          ? Number(match.position)
          : null;
    });
  } catch (error) {
    console.error("Could not load AREDL data:", error);

    levels.forEach(level => {
      level.name = level.fallbackName || `Level ${level.levelId}`;
      level.globalRank = null;
    });
  }
}

function formatGlobalRank(rank) {
  return Number.isFinite(rank) ? `#${rank}` : "—";
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
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
  });

  return article;
}

function renderLevels() {
  levelList.innerHTML = "";

  levels.forEach((level, index) => {
    levelList.appendChild(createCard(level, index));
  });
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
  return String(text)
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

async function init() {
  // Show fallback data immediately.
  levels.forEach(level => {
    level.name = level.fallbackName || `Level ${level.levelId}`;
    level.globalRank = null;
  });
  renderLevels();

  // Then replace the name/position with live AREDL data.
  await loadAredlData();
  renderLevels();
  openHashLevel();
}

init();
