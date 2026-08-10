const encoder = new TextEncoder();

function base64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function decodeBase64url(value) {
  const normalized = value
    .replaceAll("-", "+")
    .replaceAll("_", "/");

  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSession(secret) {
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not configured");

  const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
  const key = await importHmacKey(secret);

  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(String(expires)))
  );

  return `${expires}.${base64url(signature)}`;
}

export async function verifySession(request, secret) {
  if (!secret) return false;

  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/(?:^|;\s*)nixen_admin=([^;]+)/);

  if (!match) return false;

  const [expiresText, signatureText] = match[1].split(".");
  const expires = Number(expiresText);

  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) {
    return false;
  }

  try {
    const key = await importHmacKey(secret);

    return crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64url(signatureText),
      encoder.encode(expiresText)
    );
  } catch {
    return false;
  }
}

export async function passwordsMatch(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;

  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b))
  ]);

  const bytesA = new Uint8Array(hashA);
  const bytesB = new Uint8Array(hashB);

  if (bytesA.length !== bytesB.length) return false;

  let result = 0;
  for (let i = 0; i < bytesA.length; i++) {
    result |= bytesA[i] ^ bytesB[i];
  }

  return result === 0;
}
