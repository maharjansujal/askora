import { NextResponse } from "next/server";
import { requireAdmin as checkAdmin } from "@/src/lib/auth/rbac";

export const requireAdminApi = async () => {
  const { user, authorized } = await checkAdmin();

  if (!user) {
    return NextResponse.json(
      { message: "User not authenticated" },
      { status: 401 },
    );
  }

  if (!authorized) {
    return NextResponse.json(
      { message: "You are not allowed to perform this operation" },
      { status: 403 },
    );
  }

  return null;
};
