import { NextResponse } from "next/server";
import { getCurrentUser } from "./session";

export type Role = "USER" | "MODERATOR" | "ADMIN";

const ROLE_RANK: Record<Role, number> = {
  USER: 0,
  MODERATOR: 1,
  ADMIN: 2,
};

export const hasRole = (userRole: Role, minRole: Role) =>
  ROLE_RANK[userRole] >= ROLE_RANK[minRole];

export const requireRole = async (minRole: Role) => {
  const user = await getCurrentUser();
  if (!user) return { user: null, authorized: false };
  if (user.status !== "ACTIVE") return { user, authorized: false };
  return { user, authorized: hasRole(user.role, minRole) };
};

export const requireRoleForApi = async (minRole: Role) => {
  const user = await getCurrentUser();
  if (!user)
    return {
      user: null,
      response: NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 },
      ),
    };

  if (user.status !== "ACTIVE")
    return {
      user,
      response: NextResponse.json(
        { error: "This account is not active" },
        { status: 403 },
      ),
    };

  if (!hasRole(user.role, minRole))
    return {
      user,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  return { user, response: null };
};

export const canModifyContent = (
  currentUser: { id: string; role: Role },
  contentAuthorId: string,
) =>
  currentUser.id === contentAuthorId || hasRole(currentUser.role, "MODERATOR");
