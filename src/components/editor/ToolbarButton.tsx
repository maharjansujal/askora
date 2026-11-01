"use client";

import { clsx } from "clsx";
import { ButtonHTMLAttributes } from "react";

interface ToolbarButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  tooltip?: string;
}

export function ToolbarButton({
  active = false,
  tooltip,
  className,
  children,
  ...props
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={tooltip}
      aria-label={tooltip}
      aria-pressed={active}
      className={clsx(
        "inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-sm px-2 text-xs font-medium transition-colors",
        "text-muted-foreground hover:bg-muted hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-40",
        active && "bg-muted text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
