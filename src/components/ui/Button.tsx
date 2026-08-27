import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export const Button = ({
  children,
  loading = false,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <button type="button" disabled={disabled || loading} {...props}>
      {loading ? "Loading..." : children}
    </button>
  );
};
