"use client";

import { Bell, CheckCheck } from "lucide-react";
import { NotificationItem } from "../types/notificationTypes";
import { formatRelative } from "@/src/utils";

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  onMarkOneRead: (id: string) => void;
  onMarkAllRead: () => void;
  isMarkingRead: boolean;
  onClose: () => void;
}

export const NotificationDropdown = ({
  notifications,
  unreadCount,
  isLoading,
  onMarkOneRead,
  onMarkAllRead,
  isMarkingRead,
  onClose,
}: NotificationDropdownProps) => (
  <div className="w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
    {/* Header */}
    <div className="flex items-center justify-between border-b border-border px-4 py-3">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-foreground" />
        <span className="text-sm font-semibold text-foreground">
          Notifications
        </span>
        {unreadCount > 0 && (
          <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
            {unreadCount}
          </span>
        )}
      </div>
      {unreadCount > 0 && (
        <button
          type="button"
          onClick={onMarkAllRead}
          disabled={isMarkingRead}
          className="flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80 disabled:opacity-50"
        >
          <CheckCheck className="h-3 w-3" />
          Mark all read
        </button>
      )}
    </div>

    {/* List */}
    <div className="max-h-96 overflow-y-auto">
      {isLoading ? (
        <div className="p-4">
          <p className="text-center text-sm text-muted-foreground">Loading…</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-8 text-center">
          <Bell className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            You have no notifications yet.
          </p>
        </div>
      ) : (
        <ul>
          {notifications.map((n) => (
            <li
              key={n.id}
              className={[
                "border-b border-border last:border-0",
                !n.readAt && "bg-primary/5",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <NotificationRow
                notification={n}
                onMarkRead={() => onMarkOneRead(n.id)}
                onNavigate={onClose}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

function getNotificationHref(
  referenceType: string | null,
  referenceId: string | null,
): string | null {
  if (referenceType === "question" && referenceId) {
    return `/questions/${referenceId}`;
  }
  return null;
}

interface NotificationRowProps {
  notification: NotificationItem;
  onMarkRead: () => void;
  onNavigate: () => void;
}

function NotificationRow({
  notification,
  onMarkRead,
  onNavigate,
}: NotificationRowProps) {
  const { referenceType: rType, referenceId: rId } = notification;
  const href = getNotificationHref(rType, rId);

  return (
    <a
      href={href ?? "#"}
      onClick={(e) => {
        if (!href) {
          e.preventDefault();
        }
        onMarkRead();
        if (href) onNavigate();
      }}
      className="block cursor-pointer"
    >
      <div className="px-4 py-3 transition-colors hover:bg-muted/50">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground">
            {notification.title}
          </p>
          {!notification.readAt && (
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {notification.message}
        </p>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          {formatRelative(notification.createdAt)}
        </p>
      </div>
    </a>
  );
}
