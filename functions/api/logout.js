export async function onRequestPost() {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Set-Cookie":
        "nixen_admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict"
    }
  });
}
