"use server";

import { db } from "@/src/db";
import { ranks, users } from "@/src/db/schema";
import { hashPassword } from "@/src/lib/auth/password";
import { sendVerificationEmail } from "@/src/lib/mailer";
import { issueEmailVerificationCode } from "@/src/lib/otp";
import { registerSchema } from "@/src/lib/validation/auth";
import { eq } from "drizzle-orm";
import {
  INITIAL_RANK_NAME,
  SIGNUP_BONUS_POINTS,
} from "@/src/features/points/lib/constants";
import { upsertUserStats } from "@/src/features/points/lib/upsertUserStats";

const isUniqueViolation = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === "23505";

export type RegisterState = {
  error?: string;
  message?: string;
  id?: string;
  values?: {
    username?: string;
    email?: string;
    displayName?: string;
  };
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
      values: { username, email, displayName },
    };
  }

  const {
    username: normalizedUsername,
    email: normalizedEmail,
    displayName: normalizedDisplayName,
    password: normalizedPassword,
  } = parsed.data;

  const passwordHash = await hashPassword(normalizedPassword);

  let user: { id: string; email: string };

  try {
    user = await db.transaction(async (tx) => {
      const [rank] = await tx
        .select({ id: ranks.id })
        .from(ranks)
        .where(eq(ranks.name, INITIAL_RANK_NAME))
        .limit(1);

      if (!rank) {
        throw new Error(
          `Initial rank "${INITIAL_RANK_NAME}" not found. Run the seed script.`,
        );
      }

      const [created] = await tx
        .insert(users)
        .values({
          username: normalizedUsername.trim(),
          email: normalizedEmail.trim().toLowerCase(),
          displayName: normalizedDisplayName.trim(),
          passwordHash,
          pointsBalance: SIGNUP_BONUS_POINTS,
          rankId: rank.id,
        })
        .returning({ id: users.id, email: users.email });

      await upsertUserStats(tx, created.id);

      return created;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return {
        error: "An account with those details already exists.",
        values: { username, email, displayName },
      };
    }

    console.error("Failed to create user:", error);

    return {
      error: "Something went wrong. Please try again.",
      values: { username, email, displayName },
    };
  }

  try {
    const code = await issueEmailVerificationCode(user.id);
    await sendVerificationEmail(user.email, code);
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }

  return { message: "Registration successful.", id: user.id };
}
