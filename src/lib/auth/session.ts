import { randomBytes } from "crypto";
import { sha256 } from "./password";
import { db } from "@/src/db";
import { sessions } from "@/src/db/schema";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "session_token";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export const generateSessionToken = () => randomBytes(32).toString("hex");

export const createSession = async (
  userId: string,
  meta?: { userAgent?: string; ipAddress?: string },
) => {
  const token = generateSessionToken();
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({
    userId,
    tokenHash,
    expiresAt,
    userAgent: meta?.userAgent,
    ipAddress: meta?.ipAddress,
  });
};

export const setSessionCookie = async (token: string, expiresAt: Date) => {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
};

export const clearSessionCookie = async () => {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
};

export const getCurrentUser = async () => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const tokenHash = sha256(token);
};
