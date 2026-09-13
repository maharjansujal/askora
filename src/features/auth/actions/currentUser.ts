"use server";

import { getCurrentUser } from "@/src/lib/auth/session";

export const getMe = async () => {
  const user = await getCurrentUser();
  if (!user) return { user: null, status: 404 };
  return {
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    status: 200,
  };
};
