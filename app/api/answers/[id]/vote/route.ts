import { db } from "@/src/db";
import { answers, answerVotes, userStats } from "@/src/db/schema";
import { getCurrentUser } from "@/src/lib/auth/session";
import { and, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const voteBodySchema = z.object({
  value: z.enum(["UPVOTE", "DOWNVOTE"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: answerId } = await params;

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = voteBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const requestedValue = parsed.data.value;

  try {
    await db.transaction(async (tx) => {
      const [answer] = await tx
        .select({ authorId: answers.authorId })
        .from(answers)
        .where(eq(answers.id, answerId))
        .limit(1);

      if (!answer) throw new Error("Answer not found");
      if (answer.authorId === currentUser.id) {
        throw new Error("You cannot vote on your own answer");
      }

      const [existing] = await tx
        .select({ value: answerVotes.value })
        .from(answerVotes)
        .where(
          and(
            eq(answerVotes.answerId, answerId),
            eq(answerVotes.userId, currentUser.id),
          ),
        )
        .limit(1);

      let upvoteDelta = 0;
      let downvoteDelta = 0;
      let action: "insert" | "update" | "delete";

      if (!existing) {
        action = "insert";
        if (requestedValue === "UPVOTE") upvoteDelta = 1;
        else downvoteDelta = 1;
      } else if (existing.value === requestedValue) {
        action = "delete";
        if (existing.value === "UPVOTE") upvoteDelta = -1;
        else downvoteDelta = -1;
      } else {
        action = "update";
        if (requestedValue === "UPVOTE") {
          upvoteDelta = 1;
          downvoteDelta = -1;
        } else {
          upvoteDelta = -1;
          downvoteDelta = 1;
        }
      }

      if (action === "insert") {
        await tx.insert(answerVotes).values({
          answerId,
          userId: currentUser.id,
          value: requestedValue,
        });
      } else if (action === "update") {
        await tx
          .update(answerVotes)
          .set({ value: requestedValue, updatedAt: new Date() })
          .where(
            and(
              eq(answerVotes.answerId, answerId),
              eq(answerVotes.userId, currentUser.id),
            ),
          );
      } else {
        await tx
          .delete(answerVotes)
          .where(
            and(
              eq(answerVotes.answerId, answerId),
              eq(answerVotes.userId, currentUser.id),
            ),
          );
      }

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
          .where(eq(userStats.userId, answer.authorId));
      }
    });

    return NextResponse.json({ message: "Vote recorded" });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not record vote";
    return NextResponse.json({ message }, { status: 400 });
  }
}
