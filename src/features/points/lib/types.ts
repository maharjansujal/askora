import { db } from "@/src/db";
import { PointTransactionType } from "@/src/db/schema";
import { UserStatsDelta } from "./constants";

// Extracting the transation type directly from db.transation instead of importing a driver-specific Drizzle type
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type AwardPointsArgs = {
  userId: string;
  /** Must be > 0. */
  amount: number;
  type: PointTransactionType;
  referenceType?: string;
  referenceId?: string;
  description?: string;
  performedBy?: string;
  /** Counters to bump on userStats. Does NOT include pointsEarned/pointsSpent. */
  statsDelta?: UserStatsDelta;
  /** Skip the automatic rank recompute. */
  skipRankRecompute?: boolean;
};

export type SpendPointsArgs = {
  userId: string;
  /** Must be > 0. */
  amount: number;
  type: PointTransactionType;
  referenceType?: string;
  referenceId?: string;
  description?: string;
  performedBy?: string;
  /** If true, allow balance to go negative (moderator/admin adjustments only). */
  allowNegative?: boolean;
  statsDelta?: UserStatsDelta;
  skipRankRecompute?: boolean;
};
