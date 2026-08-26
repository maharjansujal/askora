import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import {
  adminActionTypeEnum,
  moderationActionTypeEnum,
  reportStatusEnum,
  reportTargetTypeEnum,
  roleEnum,
} from "./enums";
import { users } from "./users";
import { pointTransactions } from "./points";

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id),
    targetType: reportTargetTypeEnum("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    reason: text("reason").notNull(),
    description: text("description"),
    status: reportStatusEnum("status").notNull().default("PENDING"),
    resolvedBy: uuid("resolved_by").references(() => users.id),
    resolvedAt: timestamp("resolved_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("reports_status_idx").on(table.status),

    index("reports_target_idx").on(table.targetType, table.targetId),

    index("reports_reporter_idx").on(table.reporterId),
  ],
);

export const moderationActions = pgTable(
  "moderation_actions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    moderatorId: uuid("moderator_id")
      .notNull()
      .references(() => users.id),
    action: moderationActionTypeEnum("action").notNull(),
    targetType: reportTargetTypeEnum("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    reason: text("reason").notNull(),
    pointTransactionId: uuid("point_transaction_id").references(
      () => pointTransactions.id,
    ),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("moderation_actions_target_idx").on(table.targetType, table.targetId),

    index("moderation_actions_moderator_idx").on(table.moderatorId),

    index("moderation_actions_created_at_idx").on(table.createdAt),
  ],
);

export const adminActions = pgTable(
  "admin_actions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => users.id),
    targetUserId: uuid("target_user_id")
      .notNull()
      .references(() => users.id),
    action: adminActionTypeEnum("action").notNull(),
    previousRole: roleEnum("previous_role"),
    newRole: roleEnum("new_role"),

    reason: text("reason"),

    suspensionUntil: timestamp("suspension_until", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("admin_actions_target_user_idx").on(table.targetUserId),

    index("admin_actions_admin_idx").on(table.adminId),

    index("admin_actions_created_at_idx").on(table.createdAt),
  ],
);
