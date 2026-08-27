import { randomBytes } from "crypto";
import { sha256 } from "./password";
import { db } from "@/src/db";
import { sessions, users } from "@/src/db/schema";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

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

  return { token, expiresAt };
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
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.tokenHash, tokenHash))
    .limit(1);

  if (!session) return null;
  if (session.revokedAt) return null;
  if (session.expiresAt.getTime() < Date.now()) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) return null;

  // best-effort, don't block the request on this
  db.update(sessions)
    .set({ lastUsedAt: new Date() })
    .where(eq(sessions.id, session.id))
    .catch(() => {});

  return user;
};

export const revokeSessionByToken = async (
  token: string,
  reason = "logout",
) => {
  const tokenHash = sha256(token);
  await db
    .update(sessions)
    .set({ revokedAt: new Date(), revokeReason: reason })
    .where(eq(sessions.tokenHash, tokenHash));
};
