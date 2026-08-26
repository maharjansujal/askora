import {
  check,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { sql } from "drizzle-orm";
import { answers, questions } from "./qa";

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),

    questionId: uuid("question_id").references(() => questions.id, {
      onDelete: "cascade",
    }),

    answerId: uuid("answer_id").references(() => answers.id, {
      onDelete: "cascade",
    }),

    content: text("content").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),

    deletedBy: uuid("deleted_by").references(() => users.id),
  },
  (table) => [
    index("comments_question_idx").on(table.questionId),

    index("comments_answer_idx").on(table.answerId),

    check(
      "comment_single_parent_check",
      sql`(
        (${table.questionId} IS NOT NULL AND ${table.answerId} IS NULL)
        OR
        (${table.questionId} IS NULL AND ${table.answerId} IS NOT NULL)
      )`,
    ),
  ],
);
