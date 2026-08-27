import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { sendVerificationEmail } from "@/src/lib/mailer";
import { issueEmailVerificationCode } from "@/src/lib/otp";
import { resendCodeSchema } from "@/src/lib/validation/auth";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const body = await req.json().catch(() => null);
  const parsed = resendCodeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { userId } = parsed.data;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.emailVerifiedAt) {
    return NextResponse.json(
      { error: "Email is already verified" },
      { status: 400 },
    );
  }

  try {
    const code = await issueEmailVerificationCode(user.id);
    await sendVerificationEmail(user.email, code);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not send code" },
      { status: 429 },
    );
  }

  return NextResponse.json({ success: true });
};
