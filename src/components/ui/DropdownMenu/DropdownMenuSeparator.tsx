import { clsx } from "clsx";
import { HTMLAttributes } from "react";

type DropdownMenuSeparatorProps = HTMLAttributes<HTMLDivElement>;

export const DropdownMenuSeparator = ({
  className = "",
  ...props
}: DropdownMenuSeparatorProps) => (
  <div
    {...props}
    role="separator"
    className={clsx("-mx-1 my-1 h-px bg-border", className)}
  />
);
