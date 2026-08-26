import { randomInt } from "crypto";
import { db } from "../db";
import { users, verificationCodes } from "../db/schema";
import { and, desc, eq, gt, isNull, lt, sql } from "drizzle-orm";
import { sha256 } from "./auth/password";

const CODE_TTL_MS = 1000 * 60 * 10; // 10 minutes
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 1000 * 60; // 1 minute between resends

const generateCode = () => randomInt(0, 1_000_000).toString().padStart(6, "0");

export const issueEmailVerificationCode = async (userId: string) =>
  db.transaction(async (tx) => {
    const [user] = await tx
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .for("update")
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    const now = new Date();
    const cooldownSince = new Date(now.getTime() - RESEND_COOLDOWN_MS);

    const [recent] = await tx
      .select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.userId, userId),
          eq(verificationCodes.purpose, "EMAIL_VERIFY"),
          isNull(verificationCodes.consumedAt),
          gt(verificationCodes.createdAt, cooldownSince),
        ),
      )
      .orderBy(desc(verificationCodes.createdAt))
      .limit(1);

    if (recent) {
      const waitMs =
        RESEND_COOLDOWN_MS - (now.getTime() - recent.createdAt.getTime());

      throw new Error(
        `Please wait ${Math.ceil(waitMs / 1000)}s before requesting another code`,
      );
    }

    // Invalidate any previous active verification codes.
    await tx
      .update(verificationCodes)
      .set({
        consumedAt: now,
      })
      .where(
        and(
          eq(verificationCodes.userId, userId),
          eq(verificationCodes.purpose, "EMAIL_VERIFY"),
          isNull(verificationCodes.consumedAt),
        ),
      );

    const code = generateCode();
    const codeHash = sha256(code);
    const expiresAt = new Date(now.getTime() + CODE_TTL_MS);

    await tx.insert(verificationCodes).values({
      userId,
      purpose: "EMAIL_VERIFY",
      codeHash,
      expiresAt,
      attempts: 0,
    });

    return code;
  });

export type VerifyResult =
  | { ok: true }
  | {
      ok: false;
      reason: "not_found" | "expired" | "too_many_attempts" | "invalid";
    };

export const verifyEmailCode = (
  userId: string,
  code: string,
): Promise<VerifyResult> => {
  const now = new Date();
  const codeHash = sha256(code);

  return db.transaction(async (tx) => {
    const [record] = await tx
      .select()
      .from(verificationCodes)
      .where(
        and(
          eq(verificationCodes.userId, userId),
          eq(verificationCodes.purpose, "EMAIL_VERIFY"),
          isNull(verificationCodes.consumedAt),
        ),
      )
      .orderBy(desc(verificationCodes.createdAt))
      .limit(1);

    if (!record) {
      return { ok: false, reason: "not_found" };
    }

    if (record.expiresAt.getTime() <= now.getTime()) {
      await tx
        .update(verificationCodes)
        .set({
          consumedAt: now,
        })
        .where(
          and(
            eq(verificationCodes.id, record.id),
            isNull(verificationCodes.consumedAt),
          ),
        );

      return { ok: false, reason: "expired" };
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      return {
        ok: false,
        reason: "too_many_attempts",
      };
    }

    if (codeHash !== record.codeHash) {
      const [updated] = await tx
        .update(verificationCodes)
        .set({
          attempts: sql`${verificationCodes.attempts} + 1`,
        })
        .where(
          and(
            eq(verificationCodes.id, record.id),
            isNull(verificationCodes.consumedAt),
            lt(verificationCodes.attempts, MAX_ATTEMPTS),
          ),
        )
        .returning({
          attempts: verificationCodes.attempts,
        });

      if (!updated) {
        const [current] = await tx
          .select({
            attempts: verificationCodes.attempts,
            consumedAt: verificationCodes.consumedAt,
          })
          .from(verificationCodes)
          .where(eq(verificationCodes.id, record.id))
          .limit(1);

        if (!current || current.consumedAt) {
          return { ok: false, reason: "not_found" };
        }

        if (current.attempts >= MAX_ATTEMPTS) {
          return {
            ok: false,
            reason: "too_many_attempts",
          };
        }

        return { ok: false, reason: "invalid" };
      }

      return { ok: false, reason: "invalid" };
    }
    const [consumed] = await tx
      .update(verificationCodes)
      .set({
        consumedAt: now,
      })
      .where(
        and(
          eq(verificationCodes.id, record.id),
          isNull(verificationCodes.consumedAt),
        ),
      )
      .returning({
        id: verificationCodes.id,
      });
    if (!consumed) {
      return { ok: false, reason: "not_found" };
    }
    await tx
      .update(users)
      .set({
        emailVerifiedAt: now,
      })
      .where(eq(users.id, userId));

    return { ok: true };
  });
};
