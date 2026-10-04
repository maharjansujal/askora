import { getCurrentUser } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?clear_session=1");
  }

  // TODO: Replace this with your actual role check
  if (user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  redirect("/dashboard");
}
