import { db } from "@/src/db";
import {
  answerAcceptances,
  answers,
  answerVotes,
  questions,
  users,
  userStats,
} from "@/src/db/schema";
import { createAnswerSchema } from "@/src/features/answers/lib/validators";
import { getCurrentUser } from "@/src/lib/auth/session";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: questionId } = await params;

  try {
    const currentUser = await getCurrentUser();

    // Base answer rows + author info
    const rows = await db
      .select({
        id: answers.id,
        content: answers.content,
        status: answers.status,
        commentsEnabled: answers.commentsEnabled,
        createdAt: answers.createdAt,
        authorId: answers.authorId,
        authorUsername: users.username,
        authorDisplayName: users.displayName,
        authorAvatarUrl: users.avatarUrl,
      })
      .from(answers)
      .innerJoin(users, eq(answers.authorId, users.id))
      .where(and(eq(answers.questionId, questionId), isNull(answers.deletedAt)))
      .orderBy(asc(answers.createdAt));

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Answers retrieved", answers: [] },
        { status: 200 },
      );
    }

    const answerIds = rows.map((r) => r.id);

    //  Scores per answer — one aggregated query
    const scoreRows = await db
      .select({
        answerId: answerVotes.answerId,
        score: sql<number>`
          sum(case when ${answerVotes.value} = 'UPVOTE' then 1
                   when ${answerVotes.value} = 'DOWNVOTE' then -1
                   else 0 end)::int
        `,
      })
      .from(answerVotes)
      .where(sql`${answerVotes.answerId} in ${answerIds}`)
      .groupBy(answerVotes.answerId);

    const scoreByAnswer = new Map(scoreRows.map((r) => [r.answerId, r.score]));

    //  Which answers are currently accepted for this question
    const acceptedRows = await db
      .select({ answerId: answerAcceptances.answerId })
      .from(answerAcceptances)
      .where(
        and(
          isNull(answerAcceptances.revokedAt),
          sql`${answerAcceptances.answerId} in ${answerIds}`,
        ),
      );

    const acceptedSet = new Set(acceptedRows.map((r) => r.answerId));

    // Current user's votes on these answers (only if logged in)
    const userVotesByAnswer = new Map<string, "UPVOTE" | "DOWNVOTE">();
    if (currentUser) {
      const userVoteRows = await db
        .select({
          answerId: answerVotes.answerId,
          value: answerVotes.value,
        })
        .from(answerVotes)
        .where(
          and(
            eq(answerVotes.userId, currentUser.id),
            sql`${answerVotes.answerId} in ${answerIds}`,
          ),
        );
      for (const row of userVoteRows) {
        userVotesByAnswer.set(row.answerId, row.value);
      }
    }

    // Compose
    const enriched = rows.map((row) => ({
      ...row,
      score: scoreByAnswer.get(row.id) ?? 0,
      userVote: userVotesByAnswer.get(row.id) ?? null,
      isAccepted: acceptedSet.has(row.id),
    }));

    return NextResponse.json(
      { message: "Answers retrieved", answers: enriched },
      { status: 200 },
    );
  } catch (err) {
    console.error("GET /api/questions/[id]/answers failed", err);
    return NextResponse.json(
      { message: "Could not load answers" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: questionId } = await params;

  // 1. Authentication
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  // 2. Parse request body
  const body = await req.json().catch(() => null);

  if (!body || typeof body !== "object" || !("content" in body)) {
    return NextResponse.json(
      { message: "Content is required" },
      { status: 400 },
    );
  }

  // 3. Validate content using Zod
  const parsed = createAnswerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Invalid input",
        issues: z.treeifyError(parsed.error),
      },
      { status: 400 },
    );
  }

  try {
    const answerId = await db.transaction(async (tx) => {
      // 4. Verify question exists and is open
      const [question] = await tx
        .select({
          id: questions.id,
          status: questions.status,
        })
        .from(questions)
        .where(and(eq(questions.id, questionId), isNull(questions.deletedAt)))
        .limit(1);

      if (!question) {
        throw new Error("QUESTION_NOT_FOUND");
      }

      if (question.status !== "OPEN") {
        throw new Error("QUESTION_CLOSED");
      }

      // 5. Insert answer
      const [created] = await tx
        .insert(answers)
        .values({
          questionId,
          authorId: currentUser.id,
          content: parsed.data.content,
          status: "ACTIVE",
          commentsEnabled: true,
        })
        .returning({ id: answers.id });

      // 6. Update answerer's stats
      await tx
        .update(userStats)
        .set({
          answersGiven: sql`${userStats.answersGiven} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(userStats.userId, currentUser.id));

      return created.id;
    });

    return NextResponse.json(
      {
        message: "Answer created successfully",
        answerId,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/questions/[id]/answers failed", err);

    if (err instanceof Error) {
      if (err.message === "QUESTION_NOT_FOUND") {
        return NextResponse.json(
          { message: "Question not found" },
          { status: 404 },
        );
      }

      if (err.message === "QUESTION_CLOSED") {
        return NextResponse.json(
          {
            message: "This question is closed and no longer accepts answers",
          },
          { status: 403 },
        );
      }
    }

    return NextResponse.json(
      { message: "Could not create answer" },
      { status: 500 },
    );
  }
}
