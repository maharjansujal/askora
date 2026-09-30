import { ProfileHeader } from "@/src/features/public/components/profile/ProfileHeader";
import { getCurrentUser } from "@/src/lib/auth/session";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return;

  return <ProfileHeader isOwner profile={user} />;
}
