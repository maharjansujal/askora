import { db } from "@/src/db";
import {
  answerAcceptances,
  answers,
  notifications,
  questions,
  userStats,
} from "@/src/db/schema";
import { getCurrentUser } from "@/src/lib/auth/session";
import { and, eq, isNull, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: answerId } = await params;

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Load answer + parent question
      const [answerRow] = await tx
        .select({
          answerId: answers.id,
          answerAuthorId: answers.authorId,
          answerStatus: answers.status,
          answerDeletedAt: answers.deletedAt,
          questionId: questions.id,
          questionAuthorId: questions.authorId,
          questionStatus: questions.status,
          questionDeletedAt: questions.deletedAt,
        })
        .from(answers)
        .innerJoin(questions, eq(answers.questionId, questions.id))
        .where(eq(answers.id, answerId))
        .limit(1);

      if (!answerRow) throw new Error("Answer not found");
      if (answerRow.answerStatus !== "ACTIVE" || answerRow.answerDeletedAt) {
        throw new Error("This answer has been deleted");
      }
      if (
        answerRow.questionStatus === "DELETED" ||
        answerRow.questionDeletedAt
      ) {
        throw new Error("This question has been deleted");
      }
      if (answerRow.questionAuthorId !== currentUser.id) {
        throw new Error("Only the question author can accept an answer");
      }
      if (answerRow.answerAuthorId === currentUser.id) {
        throw new Error("You cannot accept your own answer");
      }

      // 2. Look up any currently-accepted answer on this question.
      //    There can be at most one (business rule — single-accept model).
      const [existingAcceptance] = await tx
        .select({
          id: answerAcceptances.id,
          answerId: answerAcceptances.answerId,
        })
        .from(answerAcceptances)
        .innerJoin(answers, eq(answerAcceptances.answerId, answers.id))
        .where(
          and(
            eq(answers.questionId, answerRow.questionId),
            isNull(answerAcceptances.revokedAt),
          ),
        )
        .limit(1);

      // Already accepted this exact answer → no-op
      if (existingAcceptance && existingAcceptance.answerId === answerId) {
        return { accepted: true as const, changed: false };
      }

      // A different answer is accepted → swap it (revoke old, then accept new)
      if (existingAcceptance && existingAcceptance.answerId !== answerId) {
        await revokeAcceptanceInTx(tx, {
          acceptanceId: existingAcceptance.id,
          answerId: existingAcceptance.answerId,
          questionId: answerRow.questionId,
        });
      }

      // 3. Insert new acceptance
      await tx.insert(answerAcceptances).values({
        answerId,
        acceptedBy: currentUser.id,
      });

      // 4. Bump the answerer's counters (used by rank requirements)
      await bumpAnswerCounters(tx, answerRow.answerAuthorId, +1);

      // 5. Notify the answerer — no points, just the fact
      await tx.insert(notifications).values({
        userId: answerRow.answerAuthorId,
        type: "ANSWER_ACCEPTED",
        title: "Your answer was accepted",
        message: "Your answer was marked as the accepted answer.",
        referenceType: "question",
        referenceId: answerRow.questionId,
      });

      return { accepted: true as const, changed: true };
    });

    return NextResponse.json(
      { message: "Answer accepted", changed: result.changed },
      { status: 200 },
    );
  } catch (err) {
    console.error("Accept answer failed", err);
    return NextResponse.json(
      {
        message: err instanceof Error ? err.message : "Could not accept answer",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: answerId } = await params;

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    await db.transaction(async (tx) => {
      const [answerRow] = await tx
        .select({
          answerId: answers.id,
          answerAuthorId: answers.authorId,
          questionAuthorId: questions.authorId,
          questionId: questions.id,
        })
        .from(answers)
        .innerJoin(questions, eq(answers.questionId, questions.id))
        .where(eq(answers.id, answerId))
        .limit(1);

      if (!answerRow) throw new Error("Answer not found");
      if (answerRow.questionAuthorId !== currentUser.id) {
        throw new Error("Only the question author can revoke acceptance");
      }

      const [acceptance] = await tx
        .select({ id: answerAcceptances.id })
        .from(answerAcceptances)
        .where(
          and(
            eq(answerAcceptances.answerId, answerId),
            isNull(answerAcceptances.revokedAt),
          ),
        )
        .limit(1);

      if (!acceptance) throw new Error("This answer is not accepted");

      await revokeAcceptanceInTx(tx, {
        acceptanceId: acceptance.id,
        answerId,
        questionId: answerRow.questionId,
      });
    });

    return NextResponse.json({ message: "Acceptance revoked" });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not revoke acceptance";
    console.error("revoke acceptance failed", err);
    return NextResponse.json({ message }, { status: 400 });
  }
}

async function revokeAcceptanceInTx(
  tx: Tx,
  args: { acceptanceId: string; answerId: string; questionId: string },
) {
  const { acceptanceId, answerId, questionId } = args;

  const [answer] = await tx
    .select({ authorId: answers.authorId })
    .from(answers)
    .where(eq(answers.id, answerId))
    .limit(1);

  if (!answer) throw new Error("Answer not found");

  //  Mark the acceptance revoked (keeps audit trail)
  await tx
    .update(answerAcceptances)
    .set({ revokedAt: new Date() })
    .where(eq(answerAcceptances.id, acceptanceId));

  //  Decrement the answerer's counters
  await bumpAnswerCounters(tx, answer.authorId, -1);

  //  Notify the answerer
  await tx.insert(notifications).values({
    userId: answer.authorId,
    type: "REWARD_REVOKED",
    title: "Answer acceptance revoked",
    message: "An accepted answer of yours was revoked by the question author.",
    referenceType: "answer",
    referenceId: answerId,
  });
}

async function bumpAnswerCounters(tx: Tx, userId: string, delta: 1 | -1) {
  await tx
    .update(userStats)
    .set({
      acceptedAnswers:
        delta === 1
          ? sql`${userStats.acceptedAnswers} + 1`
          : sql`${userStats.acceptedAnswers} - 1`,
      bestAnswers:
        delta === 1
          ? sql`${userStats.bestAnswers} + 1`
          : sql`${userStats.bestAnswers} - 1`,
      updatedAt: new Date(),
    })
    .where(eq(userStats.userId, userId));
}
