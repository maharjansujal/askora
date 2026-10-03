import type { ReactNode } from "react";

interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  message?: string;
  children: ReactNode;
  className?: string;
}

export const FormField = ({
  label,
  required = false,
  error,
  message,
  children,
  className = "",
}: FormFieldProps) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && (
      <label className="text-sm font-medium text-foreground">
        {label}

        {required && <span className="ml-1 text-destructive">*</span>}
      </label>
    )}

    {children}

    {error ? (
      <p className="text-xs text-destructive">{error}</p>
    ) : message ? (
      <p className="text-xs text-muted-foreground">{message}</p>
    ) : null}
  </div>
);
