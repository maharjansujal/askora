import { ButtonHTMLAttributes } from "react";

type ButtonVariant =
  | "default"
  | "outline"
  | "secondary"
  | "ghost"
  | "destructive";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",

  outline:
    "border border-border bg-background text-foreground shadow-sm hover:bg-muted",

  secondary:
    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",

  ghost: "bg-transparent text-foreground hover:bg-muted",

  destructive:
    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
};

export const Button = ({
  children,
  loading = false,
  disabled,
  className = "",
  variant = "default",
  type = "button",
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex w-full gap-2 cursor-pointer items-center justify-center rounded-lg px-4 py-2.5 font-sans text-sm font-medium outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};
