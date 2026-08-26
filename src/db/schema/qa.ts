import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { answerStatusEnum, questionStatusEnum, voteValueEnum } from "./enums";
import { sql } from "drizzle-orm";

export const subjects = pgTable(
  "subjects",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: text("name").notNull(),
    slug: text("slug").notNull(),

    description: text("description"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("subjects_name_unique").on(table.name),
    uniqueIndex("subjects_slug_unique").on(table.slug),
  ],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: text("name").notNull(),
    slug: text("slug").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("categories_name_unique").on(table.name),
    uniqueIndex("categories_slug_unique").on(table.slug),
  ],
);

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),

    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id),

    title: text("title").notNull(),
    content: jsonb("content").notNull(),
    pointsCost: integer("points_cost").notNull(),

    status: questionStatusEnum("status").notNull().default("OPEN"),

    commentsEnabled: boolean("comments_enabled").notNull().default(true),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    closedAt: timestamp("closed_at", {
      withTimezone: true,
    }),

    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),

    deletedBy: uuid("deleted_by").references(() => users.id),
  },
  (table) => [
    index("questions_author_idx").on(table.authorId),
    index("questions_subject_idx").on(table.subjectId),
    index("questions_status_idx").on(table.status),
    index("questions_created_at_idx").on(table.createdAt),
    check(
      "question_points_cost_check",
      sql`${table.pointsCost} >= 5 AND ${table.pointsCost} <= 100`,
    ),
    check(
      "question_title_not_empty_check",
      sql`length(trim(${table.title})) > 0`,
    ),
  ],
);

export const questionCategories = pgTable(
  "question_categories",
  {
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, {
        onDelete: "cascade",
      }),

    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.questionId, table.categoryId],
    }),

    index("question_categories_category_idx").on(table.categoryId),
  ],
);

export const answers = pgTable(
  "answers",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id),

    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id),
    // Prose mirror json document
    content: jsonb("content").notNull(),
    status: answerStatusEnum("status").notNull().default("ACTIVE"),
    commentsEnabled: boolean("comments_enabled").notNull().default(true),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
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
    index("answers_question_idx").on(table.questionId),

    index("answers_author_idx").on(table.authorId),

    index("answers_status_idx").on(table.status),
  ],
);

export const answerAcceptances = pgTable(
  "answer_acceptances",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    answerId: uuid("answer_id")
      .notNull()
      .references(() => answers.id, {
        onDelete: "cascade",
      }),

    acceptedBy: uuid("accepted_by")
      .notNull()
      .references(() => users.id),

    acceptedAt: timestamp("accepted_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    revokedAt: timestamp("revoked_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    index("answer_acceptances_answer_idx").on(table.answerId),

    index("answer_acceptances_accepted_by_idx").on(table.acceptedBy),
  ],
);

export const questionVotes = pgTable(
  "question_votes",
  {
    questionId: uuid("question_id")
      .notNull()
      .references(() => questions.id, {
        onDelete: "cascade",
      }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    value: voteValueEnum("value").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.questionId, table.userId],
    }),

    index("question_votes_user_idx").on(table.userId),
  ],
);

export const answerVotes = pgTable(
  "answer_votes",
  {
    answerId: uuid("answer_id")
      .notNull()
      .references(() => answers.id, {
        onDelete: "cascade",
      }),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    value: voteValueEnum("value").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.answerId, table.userId],
    }),

    index("answer_votes_user_idx").on(table.userId),
  ],
);
