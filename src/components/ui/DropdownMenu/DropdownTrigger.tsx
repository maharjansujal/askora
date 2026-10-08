"use client";

import { clsx } from "clsx";
import { ButtonHTMLAttributes } from "react";
import { useDropdown } from "./useDropdown";

export const DropdownMenuTrigger = ({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { open, setOpen, triggerId, contentId } = useDropdown();

  return (
    <button
      {...props}
      id={triggerId}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={open ? contentId : undefined}
      onClick={(event) => {
        props.onClick?.(event);

        if (!event.defaultPrevented) {
          setOpen(!open);
        }
      }}
      className={clsx(
        "inline-flex items-center justify-center transition-colors",
        " focus-visible:outline-none focus-visible:ring-2 focus-visible: ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
};
