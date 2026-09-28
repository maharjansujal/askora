import { UserButton } from "@/src/components/ui/UserButton";
import { getCurrentUser } from "@/src/lib/auth/session";
import { Bell, Search } from "lucide-react";

export const Navbar = async () => {
  const pointsBalance = 240;
  const hasUnreadNotifications = true;

  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex max-w-360 items-center gap-5 px-5 py-3">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-1 text-lg font-extrabold tracking-tight text-foreground shrink-0"
        >
          <span className="text-primary">?</span>Askora
        </a>

        {/* Search */}
        <div className="relative hidden flex-1 max-w-md sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search questions, subjects, tags…"
            className="w-full rounded-lg border border-input bg-muted py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">
          {/* Points balance pill */}
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/15 px-2.5 py-1 text-xs font-bold text-accent">
            ✦ {pointsBalance} pts
          </span>
          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
          >
            <Bell className="h-4.75 w-4.75" />
            {hasUnreadNotifications && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
            )}
          </button>
          {/* User menu */}
          {user && <UserButton user={user} />}
        </div>
      </div>
    </header>
  );
};
