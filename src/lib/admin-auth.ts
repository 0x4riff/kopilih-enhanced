import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE = "kopilih_admin_session";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function isAdminAuthenticated() {
  const store = await cookies();
  return store.get(ADMIN_SESSION_COOKIE)?.value === "active";
}

export async function requireAdminAuth() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    redirect("/admin/login");
  }
}

export function hasAdminCredentials() {
  return Boolean(ADMIN_USERNAME && ADMIN_USERNAME.trim() && ADMIN_PASSWORD && ADMIN_PASSWORD.trim());
}

export function validateAdminCredentials(username: string, password: string) {
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) return false;
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}
