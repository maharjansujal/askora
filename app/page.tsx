import { getCurrentUser } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";

export default async function Home() {
  // TODO: Get the current authenticated user
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // TODO: Replace this with your actual role check
  if (user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  redirect("/public/dashboard");
}
