import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="block font-sans text-sm font-medium text-zinc-300"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={id}
          className={`w-full rounded-lg border bg-zinc-950 px-3.5 py-2.5 font-sans text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all duration-150 ${error ? "border-red-500/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/10" : "border-zinc-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"} hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...props}
        />

        {error && <p className="font-sans text-xs text-red-400">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
