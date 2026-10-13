import { db } from "@/src/db";
import { ranks, users } from "@/src/db/schema";
import { requireAdminApi } from "@/src/lib/auth/requireAdminApi";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function GET(_req: NextRequest, params: Promise<{ id: string }>) {
  const { id } = await params;
  const authResponse = await requireAdminApi();
  if (authResponse) return authResponse;

  try {
    const user = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        role: users.role,
        status: users.status,
        createdAt: users.createdAt,
        lastSeenAt: users.lastSeenAt,
        pointsBalance: users.pointsBalance,
        rankId: users.rankId,
        rankName: ranks.name,
        rankLevel: ranks.level,
      })
      .from(users)
      .leftJoin(ranks, eq(users.rankId, ranks.id))
      .where(eq(users.id, id))
      .limit(1)
      .then((r) => r[0]);

    if (!user) return null;

    return NextResponse.json(
      { message: "User retrieved successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

const updateSchema = z.object({
  role: z.enum(["USER", "MODERATOR", "ADMIN"]).default("USER").optional(),
  status: z
    .enum(["ACTIVE", "SUSPENDED", "BANNED"])
    .default("ACTIVE")
    .optional(),
  suspendedUntil: z.date().optional(),
});

export async function PATCH(req: NextRequest, params: Promise<{ id: string }>) {
  const { id } = await params;

  try {
    const body = await req.json();
    const payload = updateSchema.safeParse(body);

    if (!payload.success) {
      return NextResponse.json({
        message: payload.error.issues[0].message ?? "Invalid Input",
      });
    }

    const [existingUser] = await db
      .select({
        role: users.role,
        status: users.status,
        suspendedUntil: users.suspendedUntil,
      })
      .from(users)
      .where(eq(users.id, id));

    const { role, status, suspendedUntil } = payload.data;

    const [updatedUser] = await db
      .update(users)
      .set({
        role: role ? role : existingUser.role,
        status: status ? status : existingUser.status,
        suspendedUntil,
      })
      .returning({
        username: users.username,
        displayName: users.displayName,
        role: users.role,
        status: users.status,
      });

    return NextResponse.json(
      {
        message: "User updated successfully",
        user: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
