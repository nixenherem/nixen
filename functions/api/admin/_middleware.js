import { verifySession } from "../../_lib/auth.js";

export async function onRequest(context) {
  const valid = await verifySession(
    context.request,
    context.env.ADMIN_SESSION_SECRET
  );

  if (!valid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return context.next();
}
