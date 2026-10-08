"use client";

import { HTMLAttributes, useEffect, useRef } from "react";
import { useDropdown } from "./useDropdown";
import { clsx } from "clsx";
import { createPortal } from "react-dom";

type DropdownMenuContentProps = HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "center" | "end";
  side?: "top" | "bottom";
};

export const DropdownMenuContent = ({
  children,
  className = "",
  align = "end",
  side = "bottom",
  ...props
}: DropdownMenuContentProps) => {
  const { open, setOpen, triggerId, contentId } = useDropdown();

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (contentRef.current && !contentRef.current.contains(target)) {
        const trigger = document.getElementById(triggerId);

        if (!trigger?.contains(target)) {
          setOpen(false);
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);

        document.getElementById(triggerId)?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, setOpen, triggerId]);

  if (!open) return null;

  const alignmentClass = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }[align];

  const sideClass = side === "top" ? "bottom-full mb-2" : "top-full mt-2";

  const content = (
    <div
      ref={contentRef}
      id={contentId}
      role="menu"
      aria-labelledby={triggerId}
      {...props}
      className={clsx(
        "absolute z-50 min-w-40 overflow-hidden rounded-lg border border-border bg-popover p-1 text-popover-foreground outline-none animate-in fade-in zoom-in-95",
        alignmentClass,
        sideClass,
        className,
      )}
    >
      {children}
    </div>
  );

  return createPortal(content, document.body);
};
