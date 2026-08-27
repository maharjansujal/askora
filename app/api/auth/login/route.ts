import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { verifyPassword } from "@/src/lib/auth/password";
import { createSession, setSessionCookie } from "@/src/lib/auth/session";
import { loginSchema } from "@/src/lib/validation/auth";
import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = lower(${email})`)
    .limit(1);

  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  }

  if (user.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "This account is not active. Contact support." },
      { status: 403 },
    );
  }

  if (!user.emailVerifiedAt) {
    return NextResponse.json(
      {
        error: "Please verify your email before logging in",
        userId: user.id,
        needsVerification: true,
      },
      { status: 403 },
    );
  }

  const userAgent = req.headers.get("user-agent") ?? undefined;
  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;

  const { token, expiresAt } = await createSession(user.id, {
    userAgent,
    ipAddress,
  });
  await setSessionCookie(token, expiresAt);

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
};
