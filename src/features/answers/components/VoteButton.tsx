"use client";

import { clsx } from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import { VoteValue } from "../types/answerTypes";

interface VoteButtonsProps {
  score: number;
  userVote: VoteValue | null;
  onVote: (value: VoteValue) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function VoteButtons({
  score,
  userVote,
  onVote,
  disabled = false,
  size = "md",
}: VoteButtonsProps) {
  const iconSize = size === "sm" ? 16 : 20;
  const padClass = size === "sm" ? "p-1" : "p-1.5";
  const scoreClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        type="button"
        onClick={() => onVote("UPVOTE")}
        disabled={disabled}
        aria-label={userVote === "UPVOTE" ? "Remove upvote" : "Upvote"}
        aria-pressed={userVote === "UPVOTE"}
        className={clsx(
          "rounded-md transition-colors",
          padClass,
          "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          userVote === "UPVOTE"
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <ChevronUp size={iconSize} strokeWidth={2.5} />
      </button>

      <span
        className={clsx(
          "font-semibold tabular-nums",
          scoreClass,
          userVote === "UPVOTE"
            ? "text-primary"
            : userVote === "DOWNVOTE"
              ? "text-destructive"
              : "text-foreground",
        )}
      >
        {score}
      </span>

      <button
        type="button"
        onClick={() => onVote("DOWNVOTE")}
        disabled={disabled}
        aria-label={userVote === "DOWNVOTE" ? "Remove downvote" : "Downvote"}
        aria-pressed={userVote === "DOWNVOTE"}
        className={clsx(
          "rounded-md transition-colors",
          padClass,
          "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          userVote === "DOWNVOTE"
            ? "text-destructive"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <ChevronDown size={iconSize} strokeWidth={2.5} />
      </button>
    </div>
  );
}
