import { notFound } from "next/navigation";
import { ProfileHeader } from "@/src/features/profile/components/ProfileHeader";
import { getCurrentUser } from "@/src/lib/auth/session";
import { getUserProfile } from "@/src/features/public/actions/getUserProfile";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const [profile, currentUser] = await Promise.all([
    getUserProfile(username),
    getCurrentUser(),
  ]);

  if (!profile) {
    notFound();
  }

  const isOwner = currentUser?.id === profile.id;

  return <ProfileHeader isOwner={isOwner} profile={profile} />;
}
