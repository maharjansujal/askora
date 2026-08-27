import { verifyEmailCode } from "@/src/lib/otp";
import { verifyEmailSchema } from "@/src/lib/validation/auth";
import { NextRequest, NextResponse } from "next/server";

const REASON_MESSAGES: Record<string, string> = {
  not_found: "No pending verification code found. Please request a new one.",
  expired: "This code has expired. Please request a new one.",
  too_many_attempts: "Too many incorrect attempts. Please request a new code.",
  invalid: "Incorrect code. Please try again.",
};

export const POST = async (req: NextRequest) => {
  const body = await req.json().catch(() => null);
  const parsed = verifyEmailSchema.safeParse(body);

  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );

  const { userId, code } = parsed.data;
  const result = await verifyEmailCode(userId, code);

  if (!result.ok)
    return NextResponse.json(
      { error: REASON_MESSAGES[result.reason] },
      { status: 400 },
    );

  return NextResponse.json({ success: true });
};
