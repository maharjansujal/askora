"use server";

import { db } from "@/src/db";
import { rankRequirements, ranks, users, userStats } from "@/src/db/schema";
import { eq, gt } from "drizzle-orm";
import { ProfileDto, RankRequirementProgressDto } from "../types/profileDto";
import { labelForRequirement, statsFor } from "../store/utils";

export const getUserProfile = async (username: string) => {
  // User with their current rank
  const row = await db
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
    .where(eq(users.username, username))
    .limit(1)
    .then((r) => r[0]);

  if (!row) return null;

  const stats = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, row.id))
    .limit(1)
    .then((r) => r[0]);

  // Finding out the next rank
  const nextRankRow = await db
    .select({ id: ranks.id, name: ranks.name, level: ranks.level })
    .from(ranks)
    .where(gt(ranks.level, row.rankLevel ?? 0))
    .orderBy(ranks.level)
    .limit(1)
    .then((r) => r[0]);

  let nextRank: ProfileDto["nextRank"] = null;

  if (nextRankRow && stats) {
    const reqs = await db
      .select()
      .from(rankRequirements)
      .where(eq(rankRequirements.rankId, nextRankRow.id));

    const requirements: RankRequirementProgressDto[] = reqs.map((r) => {
      const current = statsFor(r.type, stats);
      return {
        type: r.type,
        label: labelForRequirement(r.type),
        current,
        required: r.requiredValue,
        met: current >= r.requiredValue,
      };
    });

    nextRank = {
      id: nextRankRow.id,
      name: nextRankRow.name,
      level: nextRankRow.level,
      requirements,
    };
  }
  return {
    id: row.id,
    username: row.username,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    bio: row.bio,
    role: row.role,
    status: row.status,
    createdAt: row.createdAt,
    lastSeenAt: row.lastSeenAt,
    pointsBalance: row.pointsBalance,
    rank:
      row.rankId && row.rankName && row.rankLevel != null
        ? { id: row.rankId, name: row.rankName, level: row.rankLevel }
        : null,
    nextRank,
    stats: stats
      ? {
          questionsAsked: stats.questionsAsked,
          answersGiven: stats.answersGiven,
          acceptedAnswers: stats.acceptedAnswers,
          bestAnswers: stats.bestAnswers,
          upvotesReceived: stats.upvotesReceived,
          downvotesReceived: stats.downvotesReceived,
          pointsEarned: stats.pointsEarned,
          pointsSpent: stats.pointsSpent,
          currentStreak: stats.currentStreak ?? 0,
          longestStreak: stats.longestStreak ?? 0,
        }
      : {
          questionsAsked: 0,
          answersGiven: 0,
          acceptedAnswers: 0,
          bestAnswers: 0,
          upvotesReceived: 0,
          downvotesReceived: 0,
          pointsEarned: 0,
          pointsSpent: 0,
          currentStreak: 0,
          longestStreak: 0,
        },
  };
};
