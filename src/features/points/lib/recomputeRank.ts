import { db } from "@/src/db";
import {
  notifications,
  rankRequirements,
  RankRequirementType,
  ranks,
  users,
  userStats,
} from "@/src/db/schema";
import { eq, inArray } from "drizzle-orm";
import { Tx } from "./types";

export async function recomputeRank(tx: Tx, userId: string) {
  // Current rank level (0 if null)
  const [current] = await tx
    .select({ rankId: users.rankId, level: ranks.level })
    .from(users)
    .leftJoin(ranks, eq(users.rankId, ranks.id))
    .where(eq(users.id, userId))
    .limit(1);

  if (!current) throw new Error(`User ${userId} not found`);

  const currentLevel = current.level ?? 0;

  //   Load user's stats
  const [stats] = await tx
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1);

  if (!stats) throw new Error(`userStats missing for ${userId}`);

  //   Load all ranks with their requirements
  const allRanks = await tx
    .select({ id: ranks.id, name: ranks.name, level: ranks.level })
    .from(ranks);

  if (allRanks.length === 0) return { changed: false };
  const rankIds = allRanks.map((r) => r.id);
  const reqs = await tx
    .select()
    .from(rankRequirements)
    .where(inArray(rankRequirements.rankId, rankIds));

  // Group requirements by rankId
  const reqsByRank = new Map<string, typeof reqs>();
  for (const r of reqs) {
    const list = reqsByRank.get(r.rankId) ?? [];
    list.push(r);
    reqsByRank.set(r.rankId, list);
  }

  //   Find highest qualifying rank
  const statValue = (type: RankRequirementType) => {
    switch (type) {
      case "POINTS_EARNED":
        return stats.pointsEarned;
      case "ANSWERS":
        return stats.answersGiven;
      case "ACCEPTED_ANSWERS":
        return stats.acceptedAnswers;
      case "BEST_ANSWERS":
        return stats.bestAnswers;
      case "UPVOTES_RECEIVED":
        return stats.upvotesReceived;
      default:
        return 0;
    }
  };

  let best: { id: string; level: number; name: string } | null = null;

  for (const rank of allRanks) {
    const rankReqs = reqsByRank.get(rank.id) ?? [];

    // A rank with no requirements is only valid at level 1 (starting rank).
    // Otherwise require at least one requirement to qualify.
    const qualifies =
      rankReqs.length === 0
        ? rank.level <= 1
        : rankReqs.every((r) => statValue(r.type) >= r.requiredValue);

    if (qualifies && (!best || rank.level > best.level)) {
      best = rank;
    }
  }

  if (!best) return { changed: false };

  //   Only promote, no demote
  if (best.level <= currentLevel) return { changed: false };

  //   Update the user
  await tx
    .update(users)
    .set({ rankId: best.id, updatedAt: new Date() })
    .where(eq(users.id, userId));

  // Fire a notification
  await tx.insert(notifications).values({
    userId,
    type: "ROLE_CHANGED",
    title: `You reached ${best.name}!`,
    message: `Your new rank is ${best.name}. Keep contributing to climb higher.`,
    referenceType: "rank",
    referenceId: best.id,
  });

  return {
    changed: true,
    previousRankId: current.rankId,
    newRankId: best.id,
    newRankName: best.name,
  };
}
