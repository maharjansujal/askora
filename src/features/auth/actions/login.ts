"use server";

import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { sql } from "drizzle-orm";
import { createSession, setSessionCookie } from "@/src/lib/auth/session";
import { verifyPassword } from "@/src/lib/auth/password";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export type LoginState = {
  error?: string;
  message?: string;
};

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!identifier) {
    return {
      error: "Email or username is required.",
    };
  }

  if (!password) {
    return {
      error: "Password is required.",
    };
  }

  // If it looks like an email, normalize it.
  // Otherwise treat it as a username.
  const isEmail = identifier.includes("@");

  const [user] = await db
    .select()
    .from(users)
    .where(
      isEmail
        ? sql`lower(${users.email}) = ${identifier.toLowerCase()}`
        : sql`lower(${users.username}) = ${identifier.toLowerCase()}`,
    )
    .limit(1);

  if (!user) {
    return {
      error: "Invalid email/username or password.",
    };
  }

  if (!user.passwordHash) {
    return {
      error:
        "This account does not have a password. Please use Google to sign in.",
    };
  }

  const validPassword = await verifyPassword(password, user.passwordHash);

  if (!validPassword) {
    return {
      error: "Invalid email/username or password.",
    };
  }

  if (user.status !== "ACTIVE") {
    return {
      error: "This account is not active. Contact support.",
    };
  }

  if (!user.emailVerifiedAt) {
    return {
      error: "Please verify your email before logging in.",
    };
  }

  const requestHeaders = await headers();

  const userAgent = requestHeaders.get("user-agent") ?? undefined;

  const ipAddress =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;

  const { token, expiresAt } = await createSession(user.id, {
    userAgent,
    ipAddress,
  });

  await setSessionCookie(token, expiresAt);

  redirect("/dashboard");
}
