"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { navItems } from "./nav";
import { useLogout } from "@/src/features/auth/hooks/useLogout";

export function Sidebar() {
  const pathname = usePathname();
  const { mutate: logout, isPending } = useLogout();

  const categories = [...new Set(navItems.map((item) => item.category))];

  // Shared classes extracted to avoid repetition
  const itemBase = [
    "group flex h-10 items-center gap-3 rounded-lg px-2.5",
    "text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  ].join(" ");

  const activeClass = "bg-primary/10 text-primary";
  const inactiveClass =
    "text-muted-foreground hover:bg-muted hover:text-foreground";

  return (
    <aside className="flex h-screen w-68 shrink-0 flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex h-18 items-center border-b border-border px-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="size-5" strokeWidth={2.2} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[18px] font-semibold tracking-tight text-foreground">
              Askora
            </span>
            <span className="rounded-md bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-accent-foreground">
              Admin
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {categories.map((category) => {
          const items = navItems.filter((item) => item.category === category);

          return (
            <div key={category} className="mb-6 last:mb-0">
              <div className="mb-2 px-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground/80">
                {category}
              </div>

              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;

                  // ── Logout button ──
                  if (item.isLogout) {
                    return (
                      <button
                        key="logout"
                        onClick={() => logout()}
                        disabled={isPending}
                        className={[
                          itemBase,
                          "w-full text-left cursor-pointer",
                          "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                          isPending && "pointer-events-none opacity-50",
                        ].join(" ")}
                      >
                        {Icon && (
                          <Icon
                            className="size-4.5 shrink-0 text-muted-foreground group-hover:text-destructive transition-colors"
                            strokeWidth={1.8}
                          />
                        )}
                        <span className="truncate">
                          {isPending ? "Signing out…" : item.label}
                        </span>
                      </button>
                    );
                  }

                  // ── Regular nav link ──
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href!));

                  return (
                    <Link
                      key={item.href}
                      href={item.href!}
                      className={[
                        itemBase,
                        isActive ? activeClass : inactiveClass,
                      ].join(" ")}
                    >
                      {Icon && (
                        <Icon
                          className={[
                            "size-4.5 shrink-0 transition-colors",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-foreground",
                          ].join(" ")}
                          strokeWidth={1.8}
                        />
                      )}
                      <span className="truncate">{item.label}</span>
                      {item.count !== undefined && (
                        <span
                          className={[
                            "ml-auto flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5",
                            "text-[11px] font-semibold leading-none",
                            item.label === "Flagged Content"
                              ? "bg-destructive text-destructive-foreground"
                              : "bg-accent text-accent-foreground",
                          ].join(" ")}
                        >
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
