"use client";

import { User } from "@/src/db/schema";
import {
  ChevronDown,
  LogOut,
  LucideIcon,
  Settings,
  Trophy,
  User as UserIcon,
} from "lucide-react";
import { useState } from "react";

export const UserButton = ({ user }: { user: User }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-border bg-transparent px-2 py-1.5 hover:bg-muted transition-colors"
      >
        <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary to-purple-300 flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            user.displayName.charAt(0)
          )}
        </div>

        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-card text-card-foreground shadow-lg overflow-hidden z-50">
          {/* Identity header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary to-purple-300 flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                user.displayName.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">
                {user.displayName}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                @{user.username}
              </div>
            </div>
          </div>

          {/* Points balance */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Points balance
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent">
              ✦ {user.pointsBalance}
            </span>
          </div>

          {/* Menu items */}
          <nav className="py-1">
            <MenuItem icon={UserIcon} label="Your profile" />
            <MenuItem icon={Trophy} label="Your questions & answers" />
            <MenuItem icon={Settings} label="Account settings" />
          </nav>

          <div className="border-t border-border py-1">
            <MenuItem icon={LogOut} label="Log out" destructive />
          </div>
        </div>
      )}
    </div>
  );
};

type MenuItemProps = {
  icon: LucideIcon;
  label: string;
  destructive?: boolean;
};

const MenuItem = ({
  icon: Icon,
  label,
  destructive = false,
}: MenuItemProps) => (
  <button
    type="button"
    className={
      "flex w-full items-center gap-2.5 px-4 py-2 text-sm text-left hover:bg-muted transition-colors " +
      (destructive ? "text-destructive" : "text-foreground")
    }
  >
    <Icon className="h-4 w-4" />
    {label}
  </button>
);
