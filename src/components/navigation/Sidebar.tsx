"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useActionState } from "react";

import { logout } from "@/src/features/auth/actions/logout";
import type { NavGroup } from "@/src/components/navigation/nav";
import { LogOut } from "lucide-react";

type SidebarProps = {
  navItems: NavGroup[];
};

const itemBase = [
  "group flex h-9 items-center gap-2.5 rounded-sm px-2.5",
  "text-[13.5px] font-medium transition-colors",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
].join(" ");

const activeClass = "bg-secondary text-secondary-foreground";

const inactiveClass =
  "text-muted-foreground hover:bg-muted hover:text-foreground";

const formatCount = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n);

export const Sidebar = ({ navItems }: SidebarProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [, logoutAction, isPending] = useActionState(logout, undefined);

  const queryKeys = new Set(
    navItems.flatMap((section) =>
      section.items.flatMap((item) => {
        if (!item.href) return [];

        const [, query] = item.href.split("?");

        return query ? [...new URLSearchParams(query).keys()] : [];
      }),
    ),
  );

  const isActive = (href?: string) => {
    if (!href) return false;

    const [path, query] = href.split("?");

    if (pathname !== path) return false;

    if (query) {
      const wanted = new URLSearchParams(query);

      return [...wanted].every(
        ([key, value]) => searchParams.get(key) === value,
      );
    }
    return ![...queryKeys].some((key) => searchParams.has(key));
  };

  return (
    <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-border bg-background lg:flex">
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {navItems.map((section) => {
          if (section.items.length === 0) return null;

          return (
            <div key={section.category} className="mb-5 last:mb-0">
              <div className="mb-1.5 px-2.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
                {section.category}
              </div>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href ?? "#"}
                      className={[
                        itemBase,
                        active ? activeClass : inactiveClass,
                      ].join(" ")}
                    >
                      {item.icon && <item.icon className="size-4 shrink-0" />}

                      <span className="truncate">{item.label}</span>

                      {item.count !== undefined && (
                        <span className="ml-auto text-[11px] font-medium text-muted-foreground">
                          {formatCount(item.count)}
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

      {/* Footer: logout */}
      <div className="border-t border-border px-3 py-3">
        <form action={logoutAction}>
          <button
            type="submit"
            disabled={isPending}
            className={[
              itemBase,
              "w-full cursor-pointer text-left",
              "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
              isPending && "pointer-events-none opacity-50",
            ].join(" ")}
          >
            <LogOut className="size-4 shrink-0" />

            <span className="truncate">
              {isPending ? "Signing out…" : "Logout"}
            </span>
          </button>
        </form>
      </div>
    </aside>
  );
};
