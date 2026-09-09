import { Sidebar } from "@/src/features/public/components/Navbar/Sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <main className="flex h-full bg-background">
    <Sidebar />
    <div className="w-full max-w-360 p-10">{children}</div>
  </main>
);

export default Layout;
