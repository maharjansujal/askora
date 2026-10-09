"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, Check, Info, X } from "lucide-react";

export type AlertType = "success" | "error" | "info";

type Props = {
  message: string;
  type: AlertType;
  label?: string;
  duration?: number;
  onDismiss?: () => void;
};

const VARIANTS = {
  success: {
    icon: Check,
    label: "Success",
    accent: "bg-success",
    tint: "from-success/10",
    iconWrap: "bg-success/15 text-success",
  },
  error: {
    icon: AlertCircle,
    label: "Something went wrong",
    accent: "bg-destructive",
    tint: "from-destructive/10",
    iconWrap: "bg-destructive/15 text-destructive",
  },
  info: {
    icon: Info,
    label: "Heads up",
    accent: "bg-primary",
    tint: "from-primary/10",
    iconWrap: "bg-primary/15 text-primary",
  },
} as const;

export const Alert = ({
  message,
  type,
  label,
  duration = 5000,
  onDismiss,
}: Props) => {
  const v = VARIANTS[type];
  const Icon = v.icon;

  // Keep the latest onDismiss in a ref so a parent re-render with a new
  // function identity doesn't restart the auto-dismiss timer.
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (duration <= 0 || !dismissRef.current) return;
    const timer = setTimeout(() => dismissRef.current?.(), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-9999 flex justify-center px-4">
      <div
        role={type === "error" ? "alert" : "status"}
        className="pointer-events-auto relative w-full max-w-sm animate-alert-in overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-lg"
      >
        {/* soft colour wash + left accent bar */}
        <div
          className={`pointer-events-none absolute inset-0 bg-linear-to-r ${v.tint} to-transparent`}
        />
        <div className={`absolute inset-y-0 left-0 w-1 ${v.accent}`} />

        <div className="relative flex items-start gap-3 py-3 pl-5 pr-3">
          <div
            className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${v.iconWrap}`}
          >
            <Icon className="size-4" strokeWidth={2.4} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug">
              {label ?? v.label}
            </p>
            <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
              {message}
            </p>
          </div>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss"
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* countdown bar */}
        {duration > 0 && onDismiss && (
          <div
            className={`absolute bottom-0 left-0 h-0.5 animate-alert-progress ${v.accent}`}
            style={{ animationDuration: `${duration}ms` }}
          />
        )}
      </div>
    </div>
  );
};
