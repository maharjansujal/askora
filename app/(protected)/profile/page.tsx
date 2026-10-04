import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth/session";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  redirect(`/profile/${user.username}`);
}
