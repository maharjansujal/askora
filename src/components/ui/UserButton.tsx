"use client";

import { User } from "@/src/db/schema";
import { logout } from "@/src/features/auth/actions/logout";
import { clsx } from "clsx";
import {
  LogOut,
  LucideIcon,
  Settings,
  Trophy,
  User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

export const UserButton = ({ user }: { user: User }) => {
  const [isOpen, setIsOpen] = useState(false);
  const userButtonRef = useRef<HTMLDivElement>(null);
  const [_, logoutAction, isPending] = useActionState(logout, undefined);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userButtonRef.current &&
        !userButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const router = useRouter();

  return (
    <div ref={userButtonRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center cursor-pointer"
      >
        <div
          className={`h-8 w-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-primary-foreground transition-all duration-150 ${
            isOpen
              ? "ring-2 ring-border ring-offset-2 ring-offset-background"
              : "ring-1 ring-border"
          }`}
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            user.displayName.charAt(0)
          )}
        </div>
      </button>
      <div
        className={clsx(
          "absolute right-0 mt-2 w-64 rounded-sm border border-border bg-card text-card-foreground shadow-lg overflow-hidden z-50",
          "origin-top-right transition-all duration-150 ease-out",
          isOpen
            ? "translate-y-0 opacity-100 scale-100"
            : "pointer-events-none -translate-y-2 opacity-0 scale-95",
        )}
      >
        {/* Menu items */}
        <nav className="py-1">
          <MenuItem
            icon={UserIcon}
            label="Your profile"
            onClick={() => {
              setIsOpen(false);
              router.push("/profile");
            }}
          />

          <MenuItem icon={Trophy} label="Your questions & answers" />
          <MenuItem icon={Settings} label="Account settings" />
        </nav>

        {/* Logout */}
        <div className="border-t border-border py-1">
          <form action={logoutAction}>
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              {isPending ? "Logging out..." : "Log out"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

type MenuItemProps = {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
};

const MenuItem = ({ icon: Icon, label, onClick }: MenuItemProps) => (
  <button
    type="button"
    onClick={() => onClick?.()}
    className={clsx(
      "flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors",
      "hover:bg-muted",
      "text-foreground hover:text-primary",
    )}
  >
    <Icon className="h-4 w-4" />
    {label}
  </button>
);
