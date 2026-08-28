import { Sidebar } from "@/src/features/admin/components/Navbar/Sidebar";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <main className="flex h-full bg-background">
    <Sidebar />
    {children}
  </main>
);

export default Layout;
