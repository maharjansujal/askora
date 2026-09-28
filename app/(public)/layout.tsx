import { Navbar } from "@/src/features/public/components/Navbar/Navbar";
import { Sidebar } from "@/src/features/public/components/Navbar/Sidebar";
import { requireRole } from "@/src/lib/auth/rbac";
import { redirect } from "next/navigation";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const { user, authorized } = await requireRole("USER");

  if (!user) {
    redirect("/login");
  }

  if (!authorized) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left sidebar */}
      <Sidebar />

      {/* Right side */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-360 p-10">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
