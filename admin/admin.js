const completionEditor = document.getElementById("completionEditor");
const adminMessage = document.getElementById("adminMessage");
const saveOrderButton = document.getElementById("saveOrderButton");
const addButton = document.getElementById("addButton");
const logoutButton = document.getElementById("logoutButton");
const newLevelId = document.getElementById("newLevelId");
const newLevelPreview = document.getElementById("newLevelPreview");

let completions = [];
let aredlById = new Map();

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    }
  });

  if (response.status === 401) {
    location.href = "/admin-login";
    throw new Error("Not signed in");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed (${response.status})`);
  }

  return payload;
}

function normalizeAredlLevels(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.levels)) return payload.levels;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function getAredlInfo(levelId) {
  return aredlById.get(String(levelId));
}

function formatAredl(levelId) {
  const info = getAredlInfo(levelId);
  if (!info) return `Level ID ${levelId}`;
  const position = Number.isFinite(Number(info.position)) ? ` · #${info.position}` : "";
  return `${info.name}${position}`;
}

function field(label, value, key, type = "input") {
  const escapedValue = escapeHTML(value ?? "");

  if (type === "textarea") {
    return `
      <label class="full-label">
        ${label}
        <textarea data-field="${key}" rows="2">${escapedValue}</textarea>
      </label>
    `;
  }

  return `
    <label>
      ${label}
      <input data-field="${key}" value="${escapeAttribute(value ?? "")}">
    </label>
  `;
}

function render() {
  completionEditor.innerHTML = "";

  completions.forEach((completion, index) => {
    const item = document.createElement("article");
    item.className = "completion-item";
    item.dataset.id = completion.id;

    item.innerHTML = `
      <div class="completion-top">
        <div>
          <span class="rank-label">#${index + 1}</span>
          <span class="completion-name">${escapeHTML(formatAredl(completion.level_id))}</span>
        </div>

        <div class="order-buttons">
          <button class="secondary-button move-up" type="button" ${index === 0 ? "disabled" : ""}>↑</button>
          <button class="secondary-button move-down" type="button" ${index === completions.length - 1 ? "disabled" : ""}>↓</button>
        </div>
      </div>

      <div class="form-grid">
        ${field("Level ID", completion.level_id, "level_id")}
        ${field("Attempts", completion.attempts, "attempts")}
        ${field("Completed", completion.completed, "completed")}
        ${field("Worst fail", completion.worst_fail, "worst_fail")}
        ${field("Video URL", completion.video, "video")}
        ${field("Image filename / URL", completion.image, "image")}
      </div>

      ${field("Note", completion.note, "note", "textarea")}

      <div class="completion-actions">
        <button class="danger-button delete-button" type="button">Delete</button>
        <button class="save-button" type="button">Save changes</button>
      </div>
    `;

    item.querySelector(".move-up").addEventListener("click", () => {
      if (index === 0) return;
      [completions[index - 1], completions[index]] =
        [completions[index], completions[index - 1]];
      render();
    });

    item.querySelector(".move-down").addEventListener("click", () => {
      if (index >= completions.length - 1) return;
      [completions[index + 1], completions[index]] =
        [completions[index], completions[index + 1]];
      render();
    });

    item.querySelector(".save-button").addEventListener("click", async () => {
      const updated = readItem(item, completion);

      try {
        setMessage("Saving…");
        await request("/api/admin/completions", {
          method: "PUT",
          body: JSON.stringify(updated)
        });

        Object.assign(completion, updated);
        render();
        setMessage("Saved.");
      } catch (error) {
        setMessage(error.message);
      }
    });

    item.querySelector(".delete-button").addEventListener("click", async () => {
      if (!confirm(`Delete ${formatAredl(completion.level_id)}?`)) return;

      try {
        setMessage("Deleting…");
        await request("/api/admin/completions", {
          method: "DELETE",
          body: JSON.stringify({ id: completion.id })
        });

        completions = completions.filter(entry => entry.id !== completion.id);
        render();
        await saveOrder();
        setMessage("Deleted.");
      } catch (error) {
        setMessage(error.message);
      }
    });

    completionEditor.appendChild(item);
  });
}

function readItem(item, completion) {
  const value = key => item.querySelector(`[data-field="${key}"]`).value.trim();

  return {
    id: completion.id,
    level_id: Number(value("level_id")),
    attempts: value("attempts"),
    completed: value("completed"),
    worst_fail: value("worst_fail"),
    video: value("video"),
    image: value("image"),
    note: value("note")
  };
}

async function saveOrder() {
  await request("/api/admin/reorder", {
    method: "POST",
    body: JSON.stringify({
      ids: completions.map(item => item.id)
    })
  });
}

saveOrderButton.addEventListener("click", async () => {
  try {
    setMessage("Saving order…");
    await saveOrder();
    setMessage("Order saved.");
  } catch (error) {
    setMessage(error.message);
  }
});

addButton.addEventListener("click", async () => {
  const levelId = Number(document.getElementById("newLevelId").value.trim());

  if (!Number.isInteger(levelId) || levelId <= 0) {
    setMessage("Enter a valid level ID.");
    return;
  }

  try {
    setMessage("Adding…");

    const created = await request("/api/admin/completions", {
      method: "POST",
      body: JSON.stringify({
        level_id: levelId,
        attempts: document.getElementById("newAttempts").value.trim(),
        completed: document.getElementById("newCompleted").value.trim(),
        worst_fail: document.getElementById("newWorstFail").value.trim(),
        video: document.getElementById("newVideo").value.trim(),
        image: document.getElementById("newImage").value.trim(),
        note: document.getElementById("newNote").value.trim()
      })
    });

    completions.push(created);
    clearNewForm();
    render();
    setMessage("Added.");
  } catch (error) {
    setMessage(error.message);
  }
});

newLevelId.addEventListener("input", () => {
  const levelId = newLevelId.value.trim();
  newLevelPreview.textContent = levelId ? formatAredl(levelId) : "";
});

logoutButton.addEventListener("click", async () => {
  await fetch("/api/logout", { method: "POST" });
  location.href = "/admin-login";
});

function clearNewForm() {
  [
    "newLevelId",
    "newAttempts",
    "newCompleted",
    "newWorstFail",
    "newVideo",
    "newImage",
    "newNote"
  ].forEach(id => {
    document.getElementById(id).value = "";
  });

  newLevelPreview.textContent = "";
}

function setMessage(message) {
  adminMessage.textContent = message;
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
    const [completionPayload, aredlPayload] = await Promise.all([
      request("/api/completions"),
      request("/api/aredl")
    ]);

    completions = Array.isArray(completionPayload)
      ? completionPayload
      : completionPayload.completions || [];

    aredlById = new Map(
      normalizeAredlLevels(aredlPayload)
        .map(level => [String(level.level_id), level])
    );

    render();
  } catch (error) {
    setMessage(error.message);
  }
}

init();
