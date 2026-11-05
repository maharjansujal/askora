import { pointTransactions, users, userStats } from "@/src/db/schema";
import { InvalidPointsOperationError } from "./errors";
import { AwardPointsArgs, Tx } from "./types";
import { upsertUserStats } from "./upsertUserStats";
import { eq, sql } from "drizzle-orm";
import { recomputeRank } from "./recomputeRank";

export async function awardPoints(tx: Tx, args: AwardPointsArgs) {
  if (!Number.isInteger(args.amount) || args.amount <= 0) {
    throw new InvalidPointsOperationError(
      "awardPoints amount must be a positive integer",
      {
        amount: args.amount,
      },
    );
  }

  await upsertUserStats(tx, args.userId);

  //   Insert ledger row
  const [tx_row] = await tx
    .insert(pointTransactions)
    .values({
      userId: args.userId,
      amount: args.amount,
      type: args.type,
      referenceType: args.referenceType,
      referenceId: args.referenceId,
      description: args.description,
      performedBy: args.performedBy,
    })
    .returning({ id: pointTransactions.id });

  // Bump user balance
  await tx
    .update(users)
    .set({
      pointsBalance: sql`${users.pointsBalance} + ${args.amount}`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, args.userId));

  // Bump userStats.pointsEarned + any additional counters
  const extra = args.statsDelta ?? {};
  await tx
    .update(userStats)
    .set({
      pointsEarned: sql`${userStats.pointsEarned} + ${args.amount}`,
      questionsAsked: extra.questionsAsked
        ? sql`${userStats.questionsAsked} + ${extra.questionsAsked}`
        : undefined,
      answersGiven: extra.answersGiven
        ? sql`${userStats.answersGiven} + ${extra.answersGiven}`
        : undefined,
      acceptedAnswers: extra.acceptedAnswers
        ? sql`${userStats.acceptedAnswers} + ${extra.acceptedAnswers}`
        : undefined,
      bestAnswers: extra.bestAnswers
        ? sql`${userStats.bestAnswers} + ${extra.bestAnswers}`
        : undefined,
      upvotesReceived: extra.upvotesReceived
        ? sql`${userStats.upvotesReceived} + ${extra.upvotesReceived}`
        : undefined,
      downvotesReceived: extra.downvotesReceived
        ? sql`${userStats.downvotesReceived} + ${extra.downvotesReceived}`
        : undefined,
      updatedAt: new Date(),
    })
    .where(eq(userStats.userId, args.userId));

  if (!args.skipRankRecompute) {
    await recomputeRank(tx, args.userId);
  }

  return { pointTransactionId: tx_row.id };
}
