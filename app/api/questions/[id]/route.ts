import { getCurrentUser } from "@/src/lib/auth/session";
import { loadQuestionDetail } from "@/src/features/questions/lib/queries";
import { NextRequest, NextResponse } from "next/server";
import { createQuestionSchema } from "@/src/features/questions/lib/validators";
import { db } from "@/src/db";
import {
  categories,
  questionCategories,
  questions,
  subjects,
} from "@/src/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { TbX } from "react-icons/tb";
import { revalidatePath } from "next/cache";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const currentUser = await getCurrentUser();

  try {
    const result = await loadQuestionDetail({
      questionId: id,
      currentUserId: currentUser?.id ?? null,
    });

    if (!result) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Question retrieved", ...result },
      { status: 200 },
    );
  } catch (err) {
    console.error("GET /api/questions/[id] failed", err);
    return NextResponse.json(
      { message: "Could not load question" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  if (!body) {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createQuestionSchema
    .omit({ pointsCost: true })
    .safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { title, content, subjectId, categoryIds } = parsed.data;

  try {
    const result = await db.transaction(async (tx) => {
      // Load the question and verify the ownership
      const [existing] = await tx
        .select({
          id: questions.id,
          authorId: questions.authorId,
          deletedAt: questions.deletedAt,
        })
        .from(questions)
        .where(eq(questions.id, id))
        .limit(1);

      if (!existing) throw new Error("Question not found");
      if (existing.deletedAt) throw new Error("Question has been deleted");
      if (existing.authorId !== currentUser.id) {
        throw new Error("Only the question author can edit it");
      }

      // Verify subject exists
      const [subject] = await tx
        .select({ id: subjects.id })
        .from(subjects)
        .where(eq(subjects.id, subjectId))
        .limit(1);

      // Verify categories exist
      const validCategories = await tx
        .select({ id: categories.id })
        .from(categories)
        .where(
          categoryIds.length > 0
            ? inArray(categories.id, categoryIds)
            : sql`false`,
        );

      if (validCategories.length !== categoryIds.length) {
        throw new Error("One or more categories do not exist");
      }

      // Update the title, content, subject only. pointsCost is deliberately read-only
      await tx
        .update(questions)
        .set({
          title,
          content,
          subjectId,
          updatedAt: new Date(),
        })
        .where(eq(questions.id, id));

      // Delete existing categories related to this question, insert new one
      await tx
        .delete(questionCategories)
        .where(eq(questionCategories.questionId, id));

      if (categoryIds.length > 0) {
        await tx.insert(questionCategories).values(
          categoryIds.map((cId) => ({
            questionId: id,
            categoryId: cId,
          })),
        );
      }

      return { questionId: id };
    });

    // Invalidate both the detail page and the feed
    revalidatePath(`/questions/${result.questionId}`);
    revalidatePath("/questions");

    return NextResponse.json(
      { message: "Question updated", questionId: result.questionId },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update";
    console.error("PATCH /api/questions/[id] failed", err);
    return NextResponse.json({ message }, { status: 400 });
  }
}
