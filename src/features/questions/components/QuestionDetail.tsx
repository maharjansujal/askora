"use client";

import { RichTextViewer } from "@/src/components/editor/RichTextViewer";
import { AnswerForm } from "../../answers/components/AnswerForm";
import { AnswerItem, AnswerList } from "../../answers/components/AnswerList";
import { ProseMirrorDoc } from "@/src/lib/editor/types";
import { QuestionVoteButtons } from "./QuestionVoteButtons";
import { QuestionDetail as QuestionDetailType } from "../types/questionTypes";
import { formatRelative } from "@/src/utils";
import { useQuestion } from "../hooks/useQuestion";
import { useAnswers } from "../../answers/hooks/useAnswers";
import { QuestionForm } from "./QuestionForm";
import { Modal } from "@/src/components/ui/Modal/Modal";
import { useModal } from "@/src/components/ui/Modal/useModal";
import { Button } from "@/src/components/ui/Button";
import { Pencil } from "lucide-react";

interface QuestionDetailProps {
  initialQuestion: QuestionDetailType;
  initialAnswers: AnswerItem[];
  currentUserId: string | null;
}

export function QuestionDetail({
  currentUserId,
  initialQuestion,
  initialAnswers,
}: QuestionDetailProps) {
  const isQuestionAuthor = currentUserId === initialQuestion.authorId;
  const isQuestionClosed = initialQuestion.status !== "OPEN";
  const canAnswer = !!currentUserId && !isQuestionClosed;

  const editModal = useModal();
  const answerDisabledReason = !currentUserId
    ? "Sign in to answer this question."
    : isQuestionClosed
      ? "This question is closed and no longer accepts answers."
      : undefined;

  const { question: fetchedQuestion } = useQuestion(
    initialQuestion.id,
    initialQuestion,
  );
  const { answers } = useAnswers(initialQuestion.id, initialAnswers);

  const question = fetchedQuestion ?? initialQuestion;

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

                {isQuestionAuthor && question.status === "OPEN" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Pencil}
                    onClick={editModal.openModal}
                    className="ml-auto"
                  >
                    Edit
                  </Button>
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
      <Modal
        open={editModal.open}
        onClose={editModal.closeModal}
        title="Edit Question"
      >
        <div className="p-10 w-full md:w-7xl">
          <QuestionForm
            pointsBalance={0 /* not used in edit mode */}
            initialData={{
              questionId: question.id,
              title: question.title,
              content: question.content as ProseMirrorDoc,
              subjectId: question.subjectId,
              categoryIds: question.categories.map((c) => c.id),
              pointsCost: question.pointsCost,
            }}
            onSuccess={() => {
              editModal.closeModal();
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
