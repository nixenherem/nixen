import {
  createSession,
  passwordsMatch
} from "../_lib/auth.js";

export async function onRequestPost(context) {
  if (!context.env.ADMIN_PASSWORD || !context.env.ADMIN_SESSION_SECRET) {
    return Response.json(
      { error: "Admin secrets are not configured" },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const valid = await passwordsMatch(
    body.password,
    context.env.ADMIN_PASSWORD
  );

  if (!valid) {
    return Response.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await createSession(context.env.ADMIN_SESSION_SECRET);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Set-Cookie":
        `nixen_admin=${token}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Strict`
    }
  });
}
