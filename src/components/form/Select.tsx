import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";
import { clsx } from "clsx";

export type SelectOption =
  | string
  | {
      label: string;
      value: string;
    };

interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> {
  options: readonly SelectOption[];
  onChange?: (value: string) => void;
  error?: boolean;
}

export const Select = ({
  options,
  error,
  className,
  disabled,
  onChange,
  ...props
}: SelectProps) => (
  <div className="relative w-full">
    <select
      {...props}
      disabled={disabled}
      aria-invalid={error || undefined}
      onChange={(e) => onChange?.(e.target.value)}
      className={clsx(
        "w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
        error &&
          "border-destructive focus:border-destructive focus:ring-destructive/20",
        className,
      )}
    >
      {options.map((option) => {
        const item =
          typeof option === "string"
            ? { label: option, value: option }
            : option;

        return (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        );
      })}
    </select>

    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
  </div>
);
