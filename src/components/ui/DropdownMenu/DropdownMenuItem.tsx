"use client";

import { ButtonHTMLAttributes } from "react";
import { useDropdown } from "./useDropdown";
import { clsx } from "clsx";

type DropdownMenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  destructive?: boolean;
};

export const DropdownMenuItem = ({
  children,
  className = "",
  destructive = false,
  disabled,
  onClick,
  ...props
}: DropdownMenuItemProps) => {
  const { setOpen } = useDropdown();

  return (
    <button
      {...props}
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);

        if (!event.defaultPrevented) setOpen(false);
      }}
      className={clsx(
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium outline-none transition-colors",
        "text-popover-foreground hover:bg-muted focus:bg-muted",
        destructive &&
          "text-destructive hover:bg-destructive/10 focus:bg-destructive/10",
        className,
      )}
    >
      {children}
    </button>
  );
};
