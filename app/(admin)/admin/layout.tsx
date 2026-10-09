import { adminNavItems, userNavItems } from "@/src/components/navigation/nav";
import { Sidebar } from "@/src/components/navigation/Sidebar";
import { requireRole } from "@/src/lib/auth/rbac";
import { redirect } from "next/navigation";
import React from "react";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const { user, authorized } = await requireRole("ADMIN");

  if (!user) {
    redirect("/login?clear_session=1");
  }

  if (!authorized) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-background lg:flex">
      <Sidebar navItems={adminNavItems} />

      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-360 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </main>
  );
};

export default Layout;
