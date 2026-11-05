import { db } from "@/src/db";
import {
  categories,
  questionCategories,
  questions,
  subjects,
} from "@/src/db/schema";
import { eq, inArray } from "drizzle-orm";

export const listSubjects = async () =>
  db
    .select({ id: subjects.id, name: subjects.name, slug: subjects.slug })
    .from(subjects)
    .orderBy(subjects.name);

export const listCategories = async () =>
  db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .orderBy(categories.name);

export async function getQuestionById(id: string) {
  const [question] = await db
    .select({
      id: questions.id,
      title: questions.title,
      content: questions.content,
      pointsCost: questions.pointsCost,
      status: questions.status,
      commentsEnabled: questions.commentsEnabled,
      createdAt: questions.createdAt,
      authorId: questions.authorId,
      subjectId: questions.subjectId,
      subjectName: subjects.name,
    })
    .from(questions)
    .innerJoin(subjects, eq(questions.subjectId, subjects.id))
    .where(eq(questions.id, id))
    .limit(1);

  if (!question) return null;

  const cats = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(questionCategories)
    .innerJoin(categories, eq(questionCategories.categoryId, categories.id))
    .where(eq(questionCategories.questionId, id));

  return { ...question, categories: cats };
}

export async function getQuestionCategoryIds(questionId: string) {
  const rows = await db
    .select({ categoryId: questionCategories.categoryId })
    .from(questionCategories)
    .where(eq(questionCategories.questionId, questionId));
  return rows.map((r) => r.categoryId);
}

// Given a list of subject ids, return the ones that exist.
// Used to validate the create payload - we don't trust the client to send valid uuids.
export async function getExistingSubjectIds(ids: string[]) {
  if (ids.length === 0) return [];
  const rows = await db
    .select({ id: subjects.id })
    .from(subjects)
    .where(inArray(subjects.id, ids));
  return rows.map((r) => r.id);
}

// Given a list of category ids, return the ones that exist.
export async function getExistingCategoryIds(ids: string[]) {
  if (ids.length === 0) return [];
  const rows = await db
    .select({ id: categories.id })
    .from(categories)
    .where(inArray(categories.id, ids));
  return rows.map((r) => r.id);
}
