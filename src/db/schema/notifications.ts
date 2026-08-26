import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { notificationTypeEnum } from "./enums";
import { users } from "./users";

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    type: notificationTypeEnum("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    referenceType: text("reference_type"),
    referenceId: uuid("reference_id"),
    readAt: timestamp("read_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("notifications_user_idx").on(table.userId),
    index("notifications_unread_idx").on(table.userId, table.readAt),
    index("notifications_created_at_idx").on(table.createdAt),
  ],
);
