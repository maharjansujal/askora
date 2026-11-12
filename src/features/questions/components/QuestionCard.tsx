"use client";

import Link from "next/link";
import { MessageSquare, Coins } from "lucide-react";
import { toPlainText } from "@/src/lib/editor/json";
import type { QuestionListItem } from "../hooks/useQuestions";
import type { ProseMirrorDoc } from "@/src/lib/editor/types";

interface QuestionCardProps {
  question: QuestionListItem;
}

export const QuestionCard = ({ question }: QuestionCardProps) => {
  const preview = (() => {
    try {
      const text = toPlainText(question.content as ProseMirrorDoc);
      return text.length > 180 ? text.slice(0, 180).trimEnd() + "…" : text;
    } catch {
      return "";
    }
  })();

  const relativeTime = formatRelative(question.createdAt);

  return (
    <Link
      href={`/questions/${question.id}`}
      className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/30"
    >
      <div className="flex gap-4">
        {/* Points badge column */}
        <div className="flex flex-col items-center gap-1 pt-0.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1 rounded-md bg-accent/15 px-2 py-1 font-semibold text-accent">
            <Coins className="h-3 w-3" />
            <span>{question.pointsCost}</span>
          </div>
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-base font-semibold text-foreground line-clamp-2">
            {question.title}
          </h3>

          {preview && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {preview}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            {question.categories.map(({ id, name }) => (
              <span
                key={id}
                className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
              >
                {name}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {question.authorDisplayName}
            </span>
            <span>@{question.authorUsername}</span>
            <span>·</span>
            <span>{relativeTime}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              in {question.subjectName}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

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
    year:
      new Date(iso).getFullYear() !== new Date().getFullYear()
        ? "numeric"
        : undefined,
  });
}
