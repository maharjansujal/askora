"use client";

import { useEffect, useRef, useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
import { Bell } from "lucide-react";
import { NotificationDropdown } from "./NotificationDropdown";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoadingNotifications,
    markOneRead,
    markAllRead,
    isMarkingRead,
  } = useNotifications();

  //   Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted"
      >
        <Bell className="h-4.75 w-4.75" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2">
          <NotificationDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            isLoading={isLoadingNotifications}
            onMarkOneRead={markOneRead}
            onMarkAllRead={markAllRead}
            isMarkingRead={isMarkingRead}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
