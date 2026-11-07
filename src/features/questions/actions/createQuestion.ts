"use server";

import { ProseMirrorDoc } from "@/src/lib/editor/types";
import { createQuestionSchema } from "../lib/validators";
import { getExistingCategoryIds, getExistingSubjectIds } from "../lib/queries";
import { isInsufficientPointsError } from "../../points/lib/errors";
import { questionCategories, questions } from "@/src/db/schema";
import { spendPoints } from "../../points/lib/spendPoints";
import { db } from "@/src/db";
import { getCurrentUser } from "@/src/lib/auth/session";

export type CreateQuestionResult =
  | { ok: true; questionId: string }
  | { ok: false; error: string }
  | { ok: null };

export type CreateQuestionCoreArgs = {
  userId: string;
  input: {
    title: string;
    content: ProseMirrorDoc;
    subjectId: string;
    categoryIds: string[];
    pointsCost: number;
  };
};

export async function createQuestionCore({
  userId,
  input,
}: CreateQuestionCoreArgs): Promise<CreateQuestionResult> {
  const parsed = createQuestionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { title, content, subjectId, categoryIds, pointsCost } = parsed.data;

  const [validSubjectIds, validCategoryIds] = await Promise.all([
    getExistingSubjectIds([subjectId]),
    getExistingCategoryIds(categoryIds),
  ]);

  if (validSubjectIds.length === 0) {
    return { ok: false, error: "That subject does not exist" };
  }

  if (validCategoryIds.length !== categoryIds.length) {
    return { ok: false, error: "One or more categories do not exist" };
  }

  try {
    const questionId = await db.transaction(async (tx) => {
      await spendPoints(tx, {
        userId,
        amount: pointsCost,
        type: "QUESTION_COST",
        referenceType: "question",
        description: title.slice(0, 120),
        statsDelta: { questionsAsked: 1 },
        skipRankRecompute: true,
      });

      const [created] = await tx
        .insert(questions)
        .values({
          authorId: userId,
          subjectId,
          title,
          content,
          pointsCost,
          status: "OPEN",
          commentsEnabled: true,
        })
        .returning({ id: questions.id });

      await tx.insert(questionCategories).values(
        categoryIds.map((categoryId) => ({
          questionId: created.id,
          categoryId,
        })),
      );

      return created.id;
    });

    return { ok: true, questionId };
  } catch (err) {
    if (isInsufficientPointsError(err)) {
      return {
        ok: false,
        error: `You need ${err.shortfall} more points to ask this question.`,
      };
    }

    console.error("createQuestionCore failed", err);

    return {
      ok: false,
      error: "Could not create question. Please try again.",
    };
  }
}

export type CreateQuestionActionState = { ok: null };

export async function createQuestionAction(
  _prev: CreateQuestionActionState | CreateQuestionResult,
  formData: FormData,
): Promise<CreateQuestionResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, error: "You must be signed in" };
  }

  const rawContent = formData.get("content");
  let parsedContent: ProseMirrorDoc;

  if (typeof rawContent !== "string") {
    return { ok: false, error: "Content is required" };
  }

  try {
    parsedContent = JSON.parse(rawContent);
  } catch {
    return { ok: false, error: "Content is not valid JSON" };
  }

  const input = {
    title: String(formData.get("title") ?? ""),
    content: parsedContent,
    subjectId: String(formData.get("subjectId") ?? ""),
    categoryIds: formData.getAll("categoryIds").map(String),
    pointsCost: Number(formData.get("pointsCost") ?? 0),
  };

  return createQuestionCore({ userId: user.id, input });
}
