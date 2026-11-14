import { UserButton } from "@/src/components/ui/UserButton";
import { NotificationBell } from "@/src/features/notifications/components/NotificationBell";
import { getCurrentUser } from "@/src/lib/auth/session";
import { Bell, Search } from "lucide-react";

export const Navbar = async () => {
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
          {/* Notifications */}
          <NotificationBell />
          {/* User menu */}
          {user && <UserButton user={user} />}
        </div>
      </div>
    </header>
  );
};
