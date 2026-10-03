import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = ({ error, className, ...props }: InputProps) => (
  <input
    {...props}
    aria-invalid={error || undefined}
    className={clsx(
      "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
      error &&
        "border-destructive focus:border-destructive focus:ring-destructive/20",
      className,
    )}
  />
);
