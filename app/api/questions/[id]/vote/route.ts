import { db } from "@/src/db";
import { questions, questionVotes, userStats } from "@/src/db/schema";
import { getCurrentUser } from "@/src/lib/auth/session";
import { and, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const voteBodySchema = z.object({
  id: z.string().min(1),
  value: z.enum(["UPVOTE", "DOWNVOTE"]),
});

export async function POST(req: NextRequest) {
  // 1. Authenticate user
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { error: "You must be signed in" },
      { status: 401 },
    );
  }

  // 2. Validate request body
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = voteBodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid request body",
        issues: z.treeifyError(parsed.error),
      },
      { status: 400 },
    );
  }

  const { id: questionId, value } = parsed.data;

  try {
    await db.transaction(async (tx) => {
      // 3. Find question
      const [question] = await tx
        .select({ authorId: questions.authorId })
        .from(questions)
        .where(eq(questions.id, questionId))
        .limit(1);

      if (!question) {
        throw new Error("QUESTION_NOT_FOUND");
      }

      // 4. Prevent voting on own question
      if (question.authorId === currentUser.id) {
        throw new Error("CANNOT_VOTE_OWN_QUESTION");
      }

      // 5. Find existing vote
      const [existing] = await tx
        .select({ value: questionVotes.value })
        .from(questionVotes)
        .where(
          and(
            eq(questionVotes.questionId, questionId),
            eq(questionVotes.userId, currentUser.id),
          ),
        )
        .limit(1);

      let upvoteDelta = 0;
      let downvoteDelta = 0;

      if (!existing) {
        if (value === "UPVOTE") upvoteDelta = 1;
        else downvoteDelta = 1;

        await tx.insert(questionVotes).values({
          questionId,
          userId: currentUser.id,
          value,
        });
      } else if (existing.value === value) {
        if (value === "UPVOTE") upvoteDelta = -1;
        else downvoteDelta = -1;

        await tx
          .delete(questionVotes)
          .where(
            and(
              eq(questionVotes.questionId, questionId),
              eq(questionVotes.userId, currentUser.id),
            ),
          );
      } else {
        if (value === "UPVOTE") {
          upvoteDelta = 1;
          downvoteDelta = -1;
        } else {
          upvoteDelta = -1;
          downvoteDelta = 1;
        }

        await tx
          .update(questionVotes)
          .set({
            value,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(questionVotes.questionId, questionId),
              eq(questionVotes.userId, currentUser.id),
            ),
          );
      }

      // 6. Update author's stats
      if (upvoteDelta !== 0 || downvoteDelta !== 0) {
        await tx
          .update(userStats)
          .set({
            upvotesReceived:
              upvoteDelta !== 0
                ? sql`${userStats.upvotesReceived} + ${upvoteDelta}`
                : undefined,

            downvotesReceived:
              downvoteDelta !== 0
                ? sql`${userStats.downvotesReceived} + ${downvoteDelta}`
                : undefined,

            updatedAt: new Date(),
          })
          .where(eq(userStats.userId, question.authorId));
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Vote failed:", err);

    if (err instanceof Error) {
      if (err.message === "QUESTION_NOT_FOUND") {
        return NextResponse.json(
          { error: "Question not found" },
          { status: 404 },
        );
      }

      if (err.message === "CANNOT_VOTE_OWN_QUESTION") {
        return NextResponse.json(
          { error: "You cannot vote on your own question" },
          { status: 403 },
        );
      }
    }

    return NextResponse.json(
      { error: "Could not record vote" },
      { status: 500 },
    );
  }
}
