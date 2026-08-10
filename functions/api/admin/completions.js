function text(value) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function validLevelId(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

export async function onRequestPost(context) {
  const body = await context.request.json();
  const levelId = validLevelId(body.level_id);

  if (!levelId) {
    return Response.json({ error: "Invalid level ID" }, { status: 400 });
  }

  try {
    const result = await context.env.DB.prepare(`
      INSERT INTO completions (
        sort_order,
        level_id,
        attempts,
        completed,
        worst_fail,
        video,
        image,
        note
      )
      VALUES (
        (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM completions),
        ?, ?, ?, ?, ?, ?, ?
      )
      RETURNING
        id,
        sort_order,
        level_id,
        attempts,
        completed,
        worst_fail,
        video,
        image,
        note
    `).bind(
      levelId,
      text(body.attempts),
      text(body.completed),
      text(body.worst_fail),
      text(body.video),
      text(body.image),
      text(body.note)
    ).first();

    return Response.json(result, { status: 201 });
  } catch (error) {
    if (String(error).toLowerCase().includes("unique")) {
      return Response.json(
        { error: "That level ID is already in your list." },
        { status: 409 }
      );
    }

    throw error;
  }
}

export async function onRequestPut(context) {
  const body = await context.request.json();
  const id = Number(body.id);
  const levelId = validLevelId(body.level_id);

  if (!Number.isInteger(id) || id <= 0 || !levelId) {
    return Response.json({ error: "Invalid completion" }, { status: 400 });
  }

  try {
    const result = await context.env.DB.prepare(`
      UPDATE completions
      SET
        level_id = ?,
        attempts = ?,
        completed = ?,
        worst_fail = ?,
        video = ?,
        image = ?,
        note = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      RETURNING
        id,
        sort_order,
        level_id,
        attempts,
        completed,
        worst_fail,
        video,
        image,
        note
    `).bind(
      levelId,
      text(body.attempts),
      text(body.completed),
      text(body.worst_fail),
      text(body.video),
      text(body.image),
      text(body.note),
      id
    ).first();

    if (!result) {
      return Response.json({ error: "Completion not found" }, { status: 404 });
    }

    return Response.json(result);
  } catch (error) {
    if (String(error).toLowerCase().includes("unique")) {
      return Response.json(
        { error: "That level ID is already in your list." },
        { status: 409 }
      );
    }

    throw error;
  }
}

export async function onRequestDelete(context) {
  const body = await context.request.json();
  const id = Number(body.id);

  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "Invalid completion" }, { status: 400 });
  }

  await context.env.DB.prepare(
    "DELETE FROM completions WHERE id = ?"
  ).bind(id).run();

  return Response.json({ ok: true });
}
