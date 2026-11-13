"use client";

import { RichTextViewer } from "@/src/components/editor/RichTextViewer";
import { AnswerForm } from "../../answers/components/AnswerForm";
import { AnswerItem, AnswerList } from "../../answers/components/AnswerList";
import { ProseMirrorDoc } from "@/src/lib/editor/types";
import { QuestionVoteButtons } from "./QuestionVoteButtons";
import { QuestionDetail as QuestionDetailType } from "../types/questionTypes";

interface QuestionDetailProps {
  question: QuestionDetailType;
  answers: AnswerItem[];
  currentUserId: string | null;
}

export function QuestionDetail({
  question,
  answers,
  currentUserId,
}: QuestionDetailProps) {
  const isQuestionAuthor = currentUserId === question.authorId;
  const isQuestionClosed = question.status !== "OPEN";
  const canAnswer = !!currentUserId && !isQuestionClosed;

  const answerDisabledReason = !currentUserId
    ? "Sign in to answer this question."
    : isQuestionClosed
      ? "This question is closed and no longer accepts answers."
      : undefined;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <article className="rounded-lg border border-border bg-card p-6">
        <div className="flex gap-4">
          {/* Votes column */}
          <div className="shrink-0">
            <QuestionVoteButtons
              questionId={question.id}
              score={question.score}
              userVote={question.userVote}
              disabled={!currentUserId}
            />
          </div>

          {/* Content column */}
          <div className="min-w-0 flex-1 space-y-4">
            <header className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-accent/15 px-2 py-0.5 font-semibold text-accent">
                  ✦ {question.pointsCost} pts
                </span>
                <span>·</span>
                <span>{question.subjectName}</span>
                {question.status !== "OPEN" && (
                  <span className="rounded-full bg-destructive/15 px-2 py-0.5 font-semibold text-destructive">
                    {question.status}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold leading-tight text-foreground">
                {question.title}
              </h1>
            </header>

            <RichTextViewer doc={question.content as ProseMirrorDoc} />

            {question.categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {question.categories.map((cat) => (
                  <span
                    key={cat.id}
                    className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {question.authorDisplayName}
              </span>
              <span>@{question.authorUsername}</span>
              <span>·</span>
              <span>{formatRelative(question.createdAt)}</span>
            </div>
          </div>
        </div>
      </article>

      <AnswerList
        questionId={question.id}
        answers={answers}
        currentUserId={currentUserId}
        questionAuthorId={question.authorId}
      />

      {isQuestionAuthor && !isQuestionClosed && (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            You asked this question — you can still answer it yourself if you
            found a solution, but you cannot accept your own answer.
          </p>
          <div className="mt-3">
            <AnswerForm questionId={question.id} />
          </div>
        </div>
      )}

      {!isQuestionAuthor && (
        <div className="rounded-lg border border-border bg-card p-4">
          <AnswerForm
            questionId={question.id}
            disabled={!canAnswer}
            disabledReason={answerDisabledReason}
          />
        </div>
      )}
    </div>
  );
}

function formatRelative(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;

  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < week) return `${Math.floor(diff / day)}d ago`;

  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
