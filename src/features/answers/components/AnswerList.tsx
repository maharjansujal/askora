"use client";

import { RichTextViewer } from "@/src/components/editor/RichTextViewer";
import { useAcceptAnswer } from "../hooks/useAcceptAnswer";
import { useVoteAnswer, VoteValue } from "../hooks/useVoteAnswer";
import { useMemo } from "react";
import { ProseMirrorDoc } from "@/src/lib/editor/types";
import { Check, CheckCircle2 } from "lucide-react";
import { VoteButtons } from "./VoteButton";

export interface AnswerItem {
  id: string;
  content: unknown;
  status: "ACTIVE" | "DELETED";
  commentsEnabled: boolean;
  createdAt: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarUrl: string | null;
  score: number;
  userVote: VoteValue | null;
  isAccepted: boolean;
}

interface AnswerListProps {
  questionId: string;
  answers: AnswerItem[];
  currentUserId: string | null;
  questionAuthorId: string;
}

export function AnswerList({
  questionId,
  answers,
  currentUserId,
  questionAuthorId,
}: AnswerListProps) {
  const { acceptAnswer, revokeAcceptance, isAccepting, isRevoking } =
    useAcceptAnswer();
  const { voteAnswer, isVoting } = useVoteAnswer();

  const canAccept = currentUserId === questionAuthorId;

  const sorted = useMemo(
    () =>
      [...answers].sort((a, b) => {
        if (a.isAccepted !== b.isAccepted) return a.isAccepted ? -1 : 1;
        if (a.score !== b.score) return b.score - a.score;
        return a.createdAt.localeCompare(b.createdAt);
      }),
    [answers],
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No answers yet. Be the first to help.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">
        {sorted.length} {sorted.length === 1 ? "Answer" : "Answers"}
      </h2>

      {sorted.map((answer) => {
        const isOwnAnswer = currentUserId === answer.authorId;
        const canAcceptThis = canAccept && !isOwnAnswer;

        return (
          <article
            key={answer.id}
            className={[
              "rounded-lg border p-4 transition-colors",
              answer.isAccepted
                ? "border-success/50 bg-success/5"
                : "border-border bg-card",
            ].join(" ")}
          >
            {/* Accepted banner */}
            {answer.isAccepted && (
              <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-success">
                <CheckCircle2 size={14} />
                Accepted answer
              </div>
            )}

            <div className="flex gap-4">
              {/* Votes column */}
              <div className="shrink-0">
                <VoteButtons
                  score={answer.score}
                  userVote={answer.userVote}
                  disabled={isVoting || !currentUserId}
                  size="sm"
                  onVote={(value) =>
                    voteAnswer({ answerId: answer.id, questionId, value })
                  }
                />

                {/* Accept button — only for question author, below votes */}
                {canAcceptThis && (
                  <div className="mt-3 flex flex-col items-center">
                    {answer.isAccepted ? (
                      <button
                        type="button"
                        onClick={() =>
                          revokeAcceptance({ answerId: answer.id, questionId })
                        }
                        disabled={isAccepting || isRevoking}
                        aria-label="Revoke accepted answer"
                        className="rounded-full bg-success p-1.5 text-success-foreground transition-colors hover:bg-success/90 disabled:opacity-50"
                      >
                        <Check size={16} strokeWidth={3} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          acceptAnswer({ answerId: answer.id, questionId })
                        }
                        disabled={isAccepting || isRevoking}
                        aria-label="Accept this answer"
                        className="rounded-full border-2 border-muted-foreground/30 p-1 text-muted-foreground transition-colors hover:border-success hover:text-success disabled:opacity-50"
                      >
                        <Check size={16} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Content column */}
              <div className="min-w-0 flex-1 space-y-3">
                <RichTextViewer doc={answer.content as ProseMirrorDoc} />

                <div className="flex items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {answer.authorDisplayName}
                  </span>
                  <span>@{answer.authorUsername}</span>
                  <span>·</span>
                  <span>{formatRelative(answer.createdAt)}</span>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function formatRelative(iso: string) {
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
