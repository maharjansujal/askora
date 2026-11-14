import { db } from "@/src/db";
import { notifications } from "@/src/db/schema";
import { getCurrentUser } from "@/src/lib/auth/session";
import { desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const rows = await db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        referenceType: notifications.referenceType,
        referenceId: notifications.referenceId,
        readAt: notifications.readAt,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .where(eq(notifications.userId, currentUser.id))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    const [{ count: unreadCount }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(
        sql`${notifications.userId} = ${currentUser.id} and ${notifications.readAt} is null`,
      );

    return NextResponse.json(
      { message: "Notifications retrieved", notifications: rows, unreadCount },
      { status: 200 },
    );
  } catch (err) {
    console.error("GET /api/notifications failed", err);
    return NextResponse.json(
      {
        message:
          err instanceof Error ? err.message : "Could not load notifications",
      },
      { status: 500 },
    );
  }
}
