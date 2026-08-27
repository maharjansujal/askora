import { InputHTMLAttributes, forwardRef } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, ...props }, ref) => {
    return (
      <div>
        {label && <label htmlFor={id}>{label}</label>}

        <input ref={ref} id={id} {...props} />

        {error && <p>{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
