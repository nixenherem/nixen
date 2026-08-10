const levelList = document.getElementById("levelList");
const statusMessage = document.getElementById("statusMessage");

async function getJSON(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }

  return response.json();
}

function normalizeAredlLevels(payload) {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === "object") {
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.levels)) return payload.levels;
    if (Array.isArray(payload.results)) return payload.results;
  }

  return [];
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
              <span class="detail-value">${displayValue(level.attempts)}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Completed</span>
              <span class="detail-value">${displayValue(level.completed)}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">Worst Fail</span>
              <span class="detail-value">${displayValue(level.worst_fail)}</span>
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
      history.replaceState(null, "", `#${slugify(level.name)}`);
    } else {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  });

  return article;
}

function renderLevels(levels) {
  levelList.innerHTML = "";

  levels.forEach((level, index) => {
    levelList.appendChild(createCard(level, index));
  });

  statusMessage.textContent = levels.length ? "" : "No completions added yet.";
}

function openHashLevel(levels) {
  const hash = window.location.hash.slice(1);
  if (!hash) return;

  const targetIndex = levels.findIndex(level => slugify(level.name) === hash);
  if (targetIndex < 0) return;

  const card = levelList.children[targetIndex];
  if (!card) return;

  card.classList.add("open");
  card.querySelector(".level-header")?.setAttribute("aria-expanded", "true");
}

function displayValue(value) {
  const text = value === null || value === undefined || value === "" ? "—" : String(value);
  return escapeHTML(text);
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
  try {
    const [completionsPayload, aredlPayload] = await Promise.all([
      getJSON("/api/completions"),
      getJSON("/api/aredl")
    ]);

    const completions = Array.isArray(completionsPayload)
      ? completionsPayload
      : completionsPayload.completions || [];

    const aredlLevels = normalizeAredlLevels(aredlPayload);
    const aredlById = new Map(
      aredlLevels.map(level => [String(level.level_id), level])
    );

    const levels = completions.map(completion => {
      const match = aredlById.get(String(completion.level_id));

      return {
        ...completion,
        name: match?.name || completion.fallback_name || `Level ${completion.level_id}`,
        globalRank: Number.isFinite(Number(match?.position))
          ? Number(match.position)
          : null
      };
    });

    renderLevels(levels);
    openHashLevel(levels);
  } catch (error) {
    console.error(error);
    levelList.innerHTML = "";
    statusMessage.textContent =
      "The list could not be loaded. Check the Cloudflare database binding.";
  }
}

init();
