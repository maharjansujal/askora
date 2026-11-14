import { db } from "@/src/db";
import { notifications } from "@/src/db/schema";
import { getCurrentUser } from "@/src/lib/auth/session";
import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notifications.userId, currentUser.id),
          isNull(notifications.readAt),
        ),
      );

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("POST /api/notifications/read-all failed", err);
    return NextResponse.json(
      {
        message:
          err instanceof Error ? err.message : "Could not update notifications",
      },
      { status: 500 },
    );
  }
}
