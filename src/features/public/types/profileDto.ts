import { RankRequirementType, Role, UserStatus } from "@/src/db/schema";

export interface ProfileDto {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  lastSeenAt: Date | null;

  pointsBalance: number;

  rank: RankSummaryDto | null;
  nextRank: NextRankDto | null;

  stats: ProfileStatsDto;
}

export interface RankSummaryDto {
  id: string;
  name: string;
  level: number;
}

export type NextRankDto = RankSummaryDto & {
  requirements: RankRequirementProgressDto[];
};

export interface RankRequirementProgressDto {
  type: RankRequirementType;
  label: string; // human-readable, derived from `type` (see labelForRequirement)
  current: number;
  required: number;
  met: boolean;
}

export interface ProfileStatsDto {
  questionsAsked: number;
  answersGiven: number;
  acceptedAnswers: number;
  bestAnswers: number;
  upvotesReceived: number;
  downvotesReceived: number;
  pointsEarned: number;
  pointsSpent: number;
  currentStreak: number;
  longestStreak: number;
}

export interface AuthorSummaryDto {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  rankName: string | null;
}
