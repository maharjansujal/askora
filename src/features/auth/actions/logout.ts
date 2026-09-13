"use server";

import {
  clearSessionCookie,
  revokeSessionByToken,
  SESSION_COOKIE_NAME,
} from "@/src/lib/auth/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await revokeSessionByToken(token, "logout");
  }

  await clearSessionCookie();

  redirect("/login");
}
