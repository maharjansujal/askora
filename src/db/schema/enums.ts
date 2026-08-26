import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["USER", "MODERATOR", "ADMIN"]);

export const userStatusEnum = pgEnum("user_status", [
  "ACTIVE",
  "SUSPENDED",
  "BANNED",
]);

export const questionStatusEnum = pgEnum("question_status", [
  "OPEN",
  "CLOSED",
  "DELETED",
]);

export const answerStatusEnum = pgEnum("answer_status", ["ACTIVE", "DELETED"]);

export const reportStatusEnum = pgEnum("report_status", [
  "PENDING",
  "RESOLVED",
  "REJECTED",
]);

export const reportTargetTypeEnum = pgEnum("report_target_type", [
  "QUESTION",
  "ANSWER",
  "COMMENT",
]);

export const voteValueEnum = pgEnum("vote_value", ["UPVOTE", "DOWNVOTE"]);

export const pointTransactionTypeEnum = pgEnum("point_transaction_type", [
  "QUESTION_COST",
  "ACCEPTED_ANSWER_REWARD",
  "REWARD_REVOKED",
  "ADMIN_ADJUSTMENT",
]);

export const rankRequirementTypeEnum = pgEnum("rank_requirement_type", [
  "POINTS_EARNED",
  "ANSWERS",
  "ACCEPTED_ANSWERS",
  "BEST_ANSWERS",
  "UPVOTES_RECEIVED",
]);

export const moderationActionTypeEnum = pgEnum("moderation_action_type", [
  "DELETE_QUESTION",
  "DELETE_ANSWER",
  "DELETE_COMMENT",
  "RESTORE_QUESTION",
  "RESTORE_ANSWER",
  "RESTORE_COMMENT",
  "REVOKE_REWARD",
]);

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

export const verificationCodePurposeEnum = pgEnum("verification_code_purpose", [
  "EMAIL_VERIFY",
  "PASSWORD_RESET",
]);
