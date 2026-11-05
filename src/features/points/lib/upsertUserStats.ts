// See [Engineering Decision](@/docs/engineering-decisions/user-stats-initialization.md)

import { db } from "@/src/db";
import { userStats } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { Tx } from "./types";

export async function upsertUserStats(tx: Tx, userId: string) {
  // Check if this user already as a states record
  const existing = await tx
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  // If a record already exists, return it.
  if (existing[0]) return existing[0];

  //   If no record exists, create one. All stats will start with their default values (0)
  await tx
    .insert(userStats)
    .values({ userId })
    .onConflictDoNothing({ target: userStats.userId }); // If another request creates the same record at the same time, do nothing instead of creating a duplicate

  // Get the stats record again regardless we created it or another request did
  const [row] = await tx
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  if (!row) {
    throw new Error(
      `upsertUserStats: failed to create or find userStats for user ${userId}`,
    );
  }

  return row;
}
