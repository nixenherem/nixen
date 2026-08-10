import { verifySession } from "../_lib/auth.js";

export async function onRequest(context) {
  const valid = await verifySession(
    context.request,
    context.env.ADMIN_SESSION_SECRET
  );

  if (!valid) {
    return Response.redirect(
      new URL("/admin-login", context.request.url).toString(),
      302
    );
  }

  return context.next();
}
