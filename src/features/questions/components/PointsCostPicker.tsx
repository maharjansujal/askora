"use client";

import React, { useMemo } from "react";
import {
  ACCEPTED_ANSWER_REWARD_PERCENT,
  computeAcceptedAnswerReward,
  MAX_QUESTION_COST,
  MIN_QUESTION_COST,
} from "../../points/lib/constants";
import { Coins, Gift, TrendingUp } from "lucide-react";

interface PointsCostPickerProps {
  value: number;
  onChange: (next: number) => void;
  balance: number; // Gotta know user's current points balance for "You can't afford this" realization
  disabled?: boolean;
  error?: string;
}

export function PointsCostPicker({
  value,
  onChange,
  balance,
  disabled = false,
  error,
}: PointsCostPickerProps) {
  // Fill percentage: used to style the slider track
  const percent = useMemo(
    () =>
      ((value - MIN_QUESTION_COST) / (MAX_QUESTION_COST - MIN_QUESTION_COST)) *
      100,
    [value],
  );

  const reward = computeAcceptedAnswerReward(value);
  const canAfford = balance >= value;

  const priorityHint =
    value <= 15
      ? "Listed low — gets buried under higher-cost questions"
      : value <= 40
        ? "Listed in the middle of the feed"
        : value <= 70
          ? "Rises above most questions"
          : "Premium position — top of the feed";

  return (
    <div className="flex flex-col gap-3">
      {/* Header: cost + balance */}
      <div className="flex items-baseline justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium">
          <Coins className="h-4 w-4 text-accent" />
          <span>Question cost</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold tabular-nums text-accent">
            {value}
          </span>
          <span className="text-xs text-muted-foreground">pts</span>
        </div>
      </div>

      {/* Slider with a colored fill */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 flex items-center">
          <div className="h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
        <input
          type="range"
          min={MIN_QUESTION_COST}
          max={MAX_QUESTION_COST}
          step={1}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="points-slider relative"
          aria-label="Question point cost"
        />
      </div>

      {/* Min / max labels */}
      <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
        <span>{MIN_QUESTION_COST}</span>
        <span>{MAX_QUESTION_COST}</span>
      </div>

      {/* Live info cards */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <InfoCard
          icon={TrendingUp}
          label="Feed position"
          value={priorityHint}
        />
        <InfoCard
          icon={Gift}
          label={`Accepted answer reward (${ACCEPTED_ANSWER_REWARD_PERCENT}%)`}
          value={`${reward} pts to the answerer`}
        />
      </div>

      {/* Balance hint — only shows when the user can't afford it */}
      {!canAfford && (
        <p className="text-xs font-medium text-destructive">
          You have {balance} pts — need {value - balance} more for this cost.
        </p>
      )}

      {/* Form error */}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface InfoCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

const InfoCard = ({ icon: Icon, label, value }: InfoCardProps) => (
  <div className="flex flex-col gap-0.5 rounded-md border border-border bg-muted/40 p-2.5">
    <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </div>
    <p className="text-xs font-medium text-foreground">{value}</p>
  </div>
);
