"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { UseModalReturn } from "./useModal";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  modalProps?: UseModalReturn;
  children: ReactNode;
  title?: string;
}

export const Modal = ({
  open,
  onClose,
  children,
  title,
  modalProps,
}: ModalProps) => {
  const isOpen = modalProps?.open ?? open ?? false;
  const handleClose = onClose ?? modalProps?.closeModal ?? (() => {});

  // Close when pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  // Prevent scrolling the page while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-999 flex items-center justify-center bg-background/40 p-4"
      onMouseDown={(event) => {
        // Close when clicking the backdrop
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-lg border border-border bg-surface text-primary shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface-hover px-4 py-3">
          {title ? (
            <h2 id="modal-title" className="font-semibold text-primary">
              {title}
            </h2>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer rounded-md p-1 text-secondary transition-colors hover:bg-background/5 hover:text-primary"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto bg-surface">{children}</div>
      </div>
    </div>
  );
};
