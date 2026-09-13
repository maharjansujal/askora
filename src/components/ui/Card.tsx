import { HTMLAttributes } from "react";

type CardSize = "sm" | "md" | "lg" | "xl";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  size?: CardSize;
};

const sizes: Record<CardSize, string> = {
  sm: "rounded-lg p-4",
  md: "rounded-xl p-6",
  lg: "rounded-2xl p-8",
  xl: "rounded-3xl p-10",
};

export const Card = ({
  children,
  size = "md",
  className = "",
  ...props
}: CardProps) => {
  return (
    <div
      className={[
        "bg-card text-card-foreground",
        "border border-border",
        "shadow-sm",
        sizes[size],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
};
