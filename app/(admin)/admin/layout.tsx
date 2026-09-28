import { Sidebar } from "@/src/features/admin/components/Navbar/Sidebar";
import { requireRole } from "@/src/lib/auth/rbac";
import { redirect } from "next/navigation";
import React from "react";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const { user, authorized } = await requireRole("ADMIN");

  if (!user) {
    redirect("/login");
  }

  if (!authorized) {
    redirect("/dashboard");
  }
  return (
    <main className="flex h-full bg-background">
      <Sidebar />
      <div className="w-full max-w-360 p-20">{children}</div>
    </main>
  );
};

export default Layout;
