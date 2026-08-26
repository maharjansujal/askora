import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pointTransactionTypeEnum } from "./enums";
import { users } from "./users";
import { sql } from "drizzle-orm";

export const pointTransactions = pgTable(
  "point_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),

    amount: integer("amount").notNull(),

    type: pointTransactionTypeEnum("type").notNull(),
    referenceType: text("reference_type"),
    referenceId: uuid("reference_id"),

    description: text("description"),
    performedBy: uuid("performed_by").references(() => users.id),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("point_transactions_user_idx").on(table.userId),
    index("point_transactions_reference_idx").on(
      table.referenceType,
      table.referenceId,
    ),
    index("point_transactions_created_at_idx").on(table.createdAt),
    check("point_transaction_nonzero_check", sql`${table.amount} <> 0`),
  ],
);

export const userStats = pgTable("user_stats", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  questionsAsked: integer("questions_asked").notNull().default(0),
  answersGiven: integer("answers_given").notNull().default(0),
  acceptedAnswers: integer("accepted_answers").notNull().default(0),
  bestAnswers: integer("best_answers").notNull().default(0),
  upvotesReceived: integer("upvotes_received").notNull().default(0),
  downvotesReceived: integer("downvotes_received").notNull().default(0),
  pointsEarned: integer("points_earned").notNull().default(0),
  pointsSpent: integer("points_spent").notNull().default(0),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
