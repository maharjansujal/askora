import { db } from "@/src/db";
import {
  answerAcceptances,
  answers,
  answerVotes,
  categories,
  questionCategories,
  questions,
  questionVotes,
  subjects,
  users,
} from "@/src/db/schema";
import { safeParseContent } from "@/src/lib/editor/json";
import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";
import { AnswerItem } from "../../answers/components/AnswerList";
import { QuestionDetail } from "../types/questionTypes";

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

  const parsedContent = safeParseContent(question.content);
  if (!parsedContent.success) {
    console.error(
      `Question ${question.id} has invalid content shape`,
      parsedContent.error,
    );
    return null;
  }

  const cats = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(questionCategories)
    .innerJoin(categories, eq(questionCategories.categoryId, categories.id))
    .where(eq(questionCategories.questionId, id));

  return { ...question, content: parsedContent.data, categories: cats };
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

export async function loadQuestionDetail({
  questionId,
  currentUserId,
}: {
  questionId: string;
  currentUserId: string | null;
}) {
  // Question, author and subject
  const [questionRow] = await db
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
    .where(and(eq(questions.id, questionId), isNull(questions.deletedAt)))
    .limit(1);

  if (!questionRow) return null;

  // Question score
  const [scoreRow] = await db
    .select({
      score: sql<number>`
        coalesce(
          sum(case when ${questionVotes.value} = 'UPVOTE' then 1
                   when ${questionVotes.value} = 'DOWNVOTE' then -1
                   else 0 end)::int,
          0
        )
      `,
    })
    .from(questionVotes)
    .where(eq(questionVotes.questionId, questionId));

  // User's vote on the question
  let userVote: "UPVOTE" | "DOWNVOTE" | null = null;
  if (currentUserId) {
    const [vote] = await db
      .select({ value: questionVotes.value })
      .from(questionVotes)
      .where(
        and(
          eq(questionVotes.questionId, questionId),
          eq(questionVotes.userId, currentUserId),
        ),
      )
      .limit(1);
    if (vote) userVote = vote.value;
  }

  // Categories
  const cats = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
    })
    .from(questionCategories)
    .innerJoin(categories, eq(questionCategories.categoryId, categories.id))
    .where(eq(questionCategories.questionId, questionId));

  const question: QuestionDetail = {
    ...questionRow,
    createdAt: questionRow.createdAt.toISOString(),
    score: scoreRow?.score ?? 0,
    userVote,
    categories: cats,
  };

  // Answers
  const answerRows = await db
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

  const answerIds = answerRows.map((a) => a.id);
  const scoreByAnswer = new Map<string, number>();
  const userVoteByAnswer = new Map<string, "UPVOTE" | "DOWNVOTE">();
  const acceptedSet = new Set<string>();

  if (answerIds.length > 0) {
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
    for (const r of scoreRows) scoreByAnswer.set(r.answerId, r.score);

    if (currentUserId) {
      const userVoteRows = await db
        .select({ answerId: answerVotes.answerId, value: answerVotes.value })
        .from(answerVotes)
        .where(
          and(
            eq(answerVotes.userId, currentUserId),
            sql`${answerVotes.answerId} in ${answerIds}`,
          ),
        );
      for (const r of userVoteRows) userVoteByAnswer.set(r.answerId, r.value);
    }

    const acceptRows = await db
      .select({ answerId: answerAcceptances.answerId })
      .from(answerAcceptances)
      .where(
        and(
          isNull(answerAcceptances.revokedAt),
          sql`${answerAcceptances.answerId} in ${answerIds}`,
        ),
      );
    for (const r of acceptRows) acceptedSet.add(r.answerId);
  }

  const answersWithMeta: AnswerItem[] = answerRows.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
    score: scoreByAnswer.get(a.id) ?? 0,
    userVote: userVoteByAnswer.get(a.id) ?? null,
    isAccepted: acceptedSet.has(a.id),
  }));

  return { question, answers: answersWithMeta };
}
