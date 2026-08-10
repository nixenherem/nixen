export async function onRequestPost(context) {
  const body = await context.request.json();
  const ids = body.ids;

  if (
    !Array.isArray(ids) ||
    ids.some(id => !Number.isInteger(Number(id)) || Number(id) <= 0)
  ) {
    return Response.json({ error: "Invalid order" }, { status: 400 });
  }

  const statements = ids.map((id, index) =>
    context.env.DB.prepare(
      "UPDATE completions SET sort_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(index + 1, Number(id))
  );

  if (statements.length) {
    await context.env.DB.batch(statements);
  }

  return Response.json({ ok: true });
}
