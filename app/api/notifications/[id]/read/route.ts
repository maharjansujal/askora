import { db } from "@/src/db";
import { notifications } from "@/src/db/schema";
import { getCurrentUser } from "@/src/lib/auth/session";
import { and, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

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
          eq(notifications.id, id),
          eq(notifications.userId, currentUser.id),
          isNull(notifications.readAt),
        ),
      );
  } catch (err) {
    console.error("POST /api/notifications/[id]/read failed", err);
    return NextResponse.json(
      {
        message:
          err instanceof Error ? err.message : "Could not update notification",
      },
      { status: 500 },
    );
  }
}
