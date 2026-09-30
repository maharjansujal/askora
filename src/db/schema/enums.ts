import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["USER", "MODERATOR", "ADMIN"]);
export type Role = (typeof roleEnum.enumValues)[number];

export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "SUSPENDED",
  "BANNED",
]);
export type UserStatus = (typeof userStatusEnum.enumValues)[number];

export const questionStatusEnum = pgEnum("question_status", [
  "OPEN",
  "CLOSED",
  "DELETED",
]);
export type QuestionStatus = (typeof questionStatusEnum.enumValues)[number];

export const answerStatusEnum = pgEnum("answer_status", ["ACTIVE", "DELETED"]);
export type AnswerStatus = (typeof answerStatusEnum.enumValues)[number];

export const reportStatusEnum = pgEnum("report_status", [
  "PENDING",
  "RESOLVED",
  "REJECTED",
]);
export type ReportStatus = (typeof reportStatusEnum.enumValues)[number];

export const reportTargetTypeEnum = pgEnum("report_target_type", [
  "QUESTION",
  "ANSWER",
  "COMMENT",
]);
export type ReportTargetType = (typeof reportTargetTypeEnum.enumValues)[number];

export const voteValueEnum = pgEnum("vote_value", ["UPVOTE", "DOWNVOTE"]);
export type VoteValue = (typeof voteValueEnum.enumValues)[number];

export const pointTransactionTypeEnum = pgEnum("point_transaction_type", [
  "QUESTION_COST",
  "ACCEPTED_ANSWER_REWARD",
  "REWARD_REVOKED",
  "ADMIN_ADJUSTMENT",
]);
export type PointTransactionType =
  (typeof pointTransactionTypeEnum.enumValues)[number];

export const rankRequirementTypeEnum = pgEnum("rank_requirement_type", [
  "POINTS_EARNED",
  "ANSWERS",
  "ACCEPTED_ANSWERS",
  "BEST_ANSWERS",
  "UPVOTES_RECEIVED",
]);
export type RankRequirementType =
  (typeof rankRequirementTypeEnum.enumValues)[number];

export const moderationActionTypeEnum = pgEnum("moderation_action_type", [
  "DELETE_QUESTION",
  "DELETE_ANSWER",
  "DELETE_COMMENT",
  "RESTORE_QUESTION",
  "RESTORE_ANSWER",
  "RESTORE_COMMENT",
  "REVOKE_REWARD",
]);
export type ModerationActionType =
  (typeof moderationActionTypeEnum.enumValues)[number];

export const adminActionTypeEnum = pgEnum("admin_action_type", [
  "PROMOTE_USER",
  "DEMOTE_USER",
  "SUSPEND_USER",
  "UNSUSPEND_USER",
  "BAN_USER",
  "UNBAN_USER",
  "REVOKE_ALL_SESSIONS",
  "ADMIN_POINT_ADJUSTMENT",
]);
export type AdminActionType = (typeof adminActionTypeEnum.enumValues)[number];

export const notificationTypeEnum = pgEnum("notification_type", [
  "QUESTION_ANSWERED",
  "ANSWER_ACCEPTED",
  "ANSWER_UNACCEPTED",
  "REWARD_REVOKED",
  "QUESTION_CLOSED",
  "MODERATION_ACTION",
  "ACCOUNT_SUSPENDED",
  "ACCOUNT_BANNED",
  "ROLE_CHANGED",
]);
export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];

export const verificationCodePurposeEnum = pgEnum("verification_code_purpose", [
  "EMAIL_VERIFY",
  "PASSWORD_RESET",
]);
export type VerificationCodePurpose =
  (typeof verificationCodePurposeEnum.enumValues)[number];
