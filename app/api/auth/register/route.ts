import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { hashPassword } from "@/src/lib/auth/password";
import { sendVerificationEmail } from "@/src/lib/mailer";
import { issueEmailVerificationCode } from "@/src/lib/otp";
import { registerSchema } from "@/src/lib/validation/auth";
import { NextRequest, NextResponse } from "next/server";

const isUniqueViolation = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === "23505";

export const POST = async (req: NextRequest) => {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Invalid input",
      },
      { status: 400 },
    );
  }

  const { username, email, password } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim();

  const passwordHash = await hashPassword(password);

  let user: {
    id: string;
    email: string;
  };

  try {
    [user] = await db
      .insert(users)
      .values({
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash,
      })
      .returning({
        id: users.id,
        email: users.email,
      });
  } catch (err) {
    if (isUniqueViolation(err)) {
      return NextResponse.json(
        {
          error: "An account with those details already exists",
        },
        { status: 409 },
      );
    }
    console.error("Failed to create user", err);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }

  try {
    const code = await issueEmailVerificationCode(user.id);
    await sendVerificationEmail(user.email, code);
  } catch (err) {
    console.error("Failed to send verification email", err);
  }

  return NextResponse.json(
    { message: "Registration successful", id: user.id },
    { status: 201 },
  );
};
