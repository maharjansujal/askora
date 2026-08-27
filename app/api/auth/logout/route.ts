import {
  clearSessionCookie,
  revokeSessionByToken,
  SESSION_COOKIE_NAME,
} from "@/src/lib/auth/session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (_req: NextRequest) => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await revokeSessionByToken(token, "logout");
  }
  await clearSessionCookie();

  return NextResponse.json({ success: true });
};
