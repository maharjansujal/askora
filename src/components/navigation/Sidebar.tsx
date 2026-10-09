"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

import { logout } from "@/src/features/auth/actions/logout";
import type { NavGroup } from "@/src/components/navigation/nav";

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

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          aria-expanded={mobileOpen}
          aria-controls="app-sidebar"
          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-dvh flex-col",
          "border-r border-border bg-background",
          "transition-[width,transform] duration-200 ease-in-out",
          "w-60 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0",
          collapsed ? "lg:w-17" : "lg:w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Sidebar header */}
        <div
          className={[
            "flex h-14 shrink-0 items-center border-b border-border px-3",
            collapsed ? "lg:justify-center" : "justify-between",
          ].join(" ")}
        >
          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="hidden size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:inline-flex cursor-pointer"
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </button>

          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close navigation"
            className="inline-flex size-9 cursor-pointer shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5">
          {navItems.map((section) => {
            if (section.items.length === 0) return null;

            return (
              <div key={section.category} className="mb-5 last:mb-0">
                <div
                  className={[
                    "mb-1.5 truncate px-2.5 text-[11px] font-bold",
                    "uppercase tracking-wider text-muted-foreground/70",
                    collapsed ? "lg:hidden" : "",
                  ].join(" ")}
                >
                  {section.category}
                </div>

                {collapsed && (
                  <div className="mb-2 hidden h-px bg-border lg:block" />
                )}

                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href ?? item.label}
                        href={item.href ?? "#"}
                        onClick={closeMobile}
                        title={collapsed ? item.label : undefined}
                        aria-current={active ? "page" : undefined}
                        className={[
                          itemBase,
                          "w-full",
                          active ? activeClass : inactiveClass,
                          collapsed ? "lg:justify-center lg:px-0" : "",
                        ].join(" ")}
                      >
                        {item.icon && <item.icon className="size-4 shrink-0" />}

                        <span
                          className={[
                            "truncate",
                            collapsed ? "lg:hidden" : "",
                          ].join(" ")}
                        >
                          {item.label}
                        </span>

                        {item.count !== undefined && (
                          <span
                            className={[
                              "ml-auto text-[11px] font-medium text-muted-foreground",
                              collapsed ? "lg:hidden" : "",
                            ].join(" ")}
                          >
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

        {/* Logout */}
        <div className="shrink-0 border-t border-border px-3 py-3">
          <form action={logoutAction}>
            <button
              type="submit"
              disabled={isPending}
              title={collapsed ? "Logout" : undefined}
              onClick={closeMobile}
              className={[
                itemBase,
                "w-full cursor-pointer text-left",
                "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
                "disabled:pointer-events-none disabled:opacity-50",
                collapsed ? "lg:justify-center lg:px-0" : "",
              ].join(" ")}
            >
              <LogOut className="size-4 shrink-0" />

              <span className={collapsed ? "lg:hidden" : ""}>
                {isPending ? "Signing out…" : "Logout"}
              </span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
};
