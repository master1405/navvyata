import { cookies } from "next/headers";
import crypto from "crypto";

export async function getAdminFromSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("admin_session");
  if (!sessionCookie?.value) return null;

  try {
    // Retrieve base64 encoded payload
    const decrypted = Buffer.from(sessionCookie.value, "base64").toString("utf8");
    return JSON.parse(decrypted);
  } catch (err) {
    console.error("Failed to parse admin session:", err);
    return null;
  }
}

export function verifyPassword(password, storedValue) {
  if (!storedValue || !storedValue.includes(":")) return false;
  const [salt, originalHash] = storedValue.split(":");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === originalHash;
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}
