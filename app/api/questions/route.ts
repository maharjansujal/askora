import { db } from "@/src/db";
import {
  categories,
  questionCategories,
  questions,
  subjects,
  users,
} from "@/src/db/schema";
import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const PAGE_SIZE = 20;

const listQuerySchema = z.object({
  subjectId: z.uuid().optional(),
  categoryId: z.uuid().optional(),
  q: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const parsed = listQuerySchema.safeParse(params);

    if (!parsed.success)
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid query" },
        { status: 400 },
      );

    const { subjectId, categoryId, q, page } = parsed.data;
    const offset = (page - 1) * PAGE_SIZE;

    // Build the where clause
    const conditions = [
      eq(questions.status, "OPEN"),
      isNull(questions.deletedAt),
    ];

    if (subjectId) conditions.push(eq(questions.subjectId, subjectId));

    if (q)
      conditions.push(
        sql`lower(${questions.title}) like ${"%" + q.toLowerCase() + "%"}`,
      );

    //   If filtering by category, we need a subquery (questions that have at least one row in question_categories with that category)
    if (categoryId) {
      const questionIdsWithCategory = db
        .select({ id: questionCategories.questionId })
        .from(questionCategories)
        .where(eq(questionCategories.categoryId, categoryId));

      conditions.push(sql`${questions.id} in (${questionIdsWithCategory})`);
    }

    // Count query for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(questions)
      .where(and(...conditions));

    //   Main list sorted by pointsCost DESC first (higher-priority questions float to the top), then createdAt DESC for tie-breaking
    const rows = await db
      .select({
        id: questions.id,
        title: questions.title,
        content: questions.content,
        pointsCost: questions.pointsCost,
        status: questions.status,
        commentsEnabled: questions.commentsEnabled,
        createdAt: questions.createdAt,
        authorId: questions.authorId,
        authorUsername: users.username,
        authorDisplayName: users.displayName,
        authorAvatarUrl: users.avatarUrl,
        subjectId: questions.subjectId,
        subjectName: subjects.name,
      })
      .from(questions)
      .innerJoin(users, eq(questions.authorId, users.id))
      .innerJoin(subjects, eq(questions.subjectId, subjects.id))
      .where(and(...conditions))
      .orderBy(desc(questions.pointsCost), desc(questions.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset);

    // Attach categories per question — batch query to avoid N+1
    const questionIds = rows.map((r) => r.id);
    const tagRows =
      questionIds.length > 0
        ? await db
            .select({
              questionId: questionCategories.questionId,
              categoryId: categories.id,
              categoryName: categories.name,
              categorySlug: categories.slug,
            })
            .from(questionCategories)
            .innerJoin(
              categories,
              eq(questionCategories.categoryId, categories.id),
            )
            .where(inArray(questionCategories.questionId, questionIds))
        : [];

    // Group tags by questionId
    const tagsByQuestion = new Map<
      string,
      { id: string; name: string; slug: string }[]
    >();
    for (const row of tagRows) {
      const list = tagsByQuestion.get(row.questionId) ?? [];
      list.push({
        id: row.categoryId,
        name: row.categoryName,
        slug: row.categorySlug,
      });
      tagsByQuestion.set(row.questionId, list);
    }

    const items = rows.map((row) => ({
      ...row,
      categories: tagsByQuestion.get(row.id) ?? [],
    }));

    return NextResponse.json(
      {
        message: "Questions retrieved",
        questions: items,
        pagination: {
          page,
          pageSize: PAGE_SIZE,
          total: count,
          totalPages: Math.ceil(count / PAGE_SIZE),
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("GET /api/questions failed", err);
    return NextResponse.json(
      { message: "Could not load questions" },
      { status: 500 },
    );
  }
}
