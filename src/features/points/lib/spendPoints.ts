import { pointTransactions, users, userStats } from "@/src/db/schema";
import { recomputeRank } from "./recomputeRank";
import { SpendPointsArgs, Tx } from "./types";
import { eq, sql } from "drizzle-orm";
import { InsufficientPointsError, InvalidPointsOperationError } from "./errors";
import { upsertUserStats } from "./upsertUserStats";

export async function spendPoints(tx: Tx, args: SpendPointsArgs) {
  if (!Number.isInteger(args.amount) || args.amount <= 0) {
    throw new InvalidPointsOperationError(
      "spendPoints amount must be a positive integer",
      {
        amount: args.amount,
      },
    );
  }

  await upsertUserStats(tx, args.userId);

  // Lock the user row and read the balance
  const [user] = await tx
    .select({ pointsBalance: users.pointsBalance })
    .from(users)
    .where(eq(users.id, args.userId))
    .for("update")
    .limit(1);

  if (!user)
    throw new InvalidPointsOperationError("User not found", {
      userId: args.userId,
    });

  const balance = user.pointsBalance;

  if (!args.allowNegative && balance - args.amount < 0) {
    throw new InsufficientPointsError(balance, args.amount);
  }

  // Ledger row (negative amount)
  const [row] = await tx
    .insert(pointTransactions)
    .values({
      userId: args.userId,
      amount: -args.amount,
      type: args.type,
      referenceType: args.referenceType,
      referenceId: args.referenceId,
      description: args.description,
      performedBy: args.performedBy,
    })
    .returning({ id: pointTransactions.id });

  // Decrement balance
  await tx
    .update(users)
    .set({
      pointsBalance: sql`${users.pointsBalance} - ${args.amount}`,
      updatedAt: new Date(),
    })
    .where(eq(users.id, args.userId));

  // Bump userStats.pointsSpent + any additional counters
  const extra = args.statsDelta ?? {};
  await tx
    .update(userStats)
    .set({
      pointsSpent: sql`${userStats.pointsSpent} + ${args.amount}`,
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

  // Rank recompute (in case statsDelta pushed them up)
  if (!args.skipRankRecompute) {
    await recomputeRank(tx, args.userId);
  }

  return { pointTransactionId: row.id, newBalance: balance - args.amount };
}
