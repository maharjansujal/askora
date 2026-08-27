import { getCurrentUser } from "@/src/lib/auth/session";
import { NextResponse } from "next/server";

export const GET = async () => {
  const user = await getCurrentUser();

  if (!user) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      emailVerifiedAt: user.emailVerifiedAt,
    },
  });
};
