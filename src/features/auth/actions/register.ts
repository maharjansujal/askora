"use server";

import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { hashPassword } from "@/src/lib/auth/password";
import { sendVerificationEmail } from "@/src/lib/mailer";
import { issueEmailVerificationCode } from "@/src/lib/otp";
import { registerSchema } from "@/src/lib/validation/auth";

const isUniqueViolation = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === "23505";

export type RegisterState = {
  error?: string;
  message?: string;
  id?: string;
};

export async function register(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const username = String(formData.get("username") ?? "");
  const email = String(formData.get("email") ?? "");
  const displayName = String(formData.get("displayName") ?? "");
  const password = String(formData.get("password") ?? "");

  const parsed = registerSchema.safeParse({
    username,
    email,
    displayName,
    password,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const {
    username: normalizedUsername,
    email: normalizedEmail,
    displayName: normalizedDisplayName,
    password: normalizedPassword,
  } = parsed.data;

  const passwordHash = await hashPassword(normalizedPassword);

  let user: {
    id: string;
    email: string;
  };

  try {
    [user] = await db
      .insert(users)
      .values({
        username: normalizedUsername.trim(),
        email: normalizedEmail.trim().toLowerCase(),
        displayName: normalizedDisplayName.trim(),
        passwordHash,
      })
      .returning({
        id: users.id,
        email: users.email,
      });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        error: "An account with those details already exists.",
      };
    }

    console.error("Failed to create user:", error);

    return {
      error: "Something went wrong. Please try again.",
    };
  }

  try {
    const code = await issueEmailVerificationCode(user.id);

    await sendVerificationEmail(user.email, code);
  } catch (error) {
    console.error("Failed to send verification email:", error);

    // User was created successfully, so don't fail registration.
  }

  return {
    message: "Registration successful.",
    id: user.id,
  };
}
