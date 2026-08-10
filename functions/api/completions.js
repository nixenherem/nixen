export async function onRequestGet(context) {
  if (!context.env.DB) {
    return Response.json(
      { error: "D1 binding DB is not configured" },
      { status: 500 }
    );
  }

  const { results } = await context.env.DB.prepare(`
    SELECT
      id,
      sort_order,
      level_id,
      attempts,
      completed,
      worst_fail,
      video,
      image,
      note
    FROM completions
    ORDER BY sort_order ASC, id ASC
  `).all();

  return Response.json(results || [], {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
