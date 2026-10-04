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
    redirect("/admin/dashboard");
  }

  return (
    <main className="flex h-full bg-background">
      <Sidebar navItems={adminNavItems} />
      <div className="w-full max-w-360 p-20">{children}</div>
    </main>
  );
};

export default Layout;
