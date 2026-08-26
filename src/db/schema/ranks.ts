import {
  check,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { rankRequirementTypeEnum } from "./enums";
import { sql } from "drizzle-orm";

export const ranks = pgTable(
  "ranks",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: text("name").notNull(),
    level: integer("level").notNull(),

    description: text("description"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("ranks_name_unique").on(table.name),
    uniqueIndex("ranks_level_unique").on(table.level),
  ],
);

export const rankRequirements = pgTable(
  "rank_requirements",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    rankId: uuid("rank_id")
      .notNull()
      .references(() => ranks.id, {
        onDelete: "cascade",
      }),

    type: rankRequirementTypeEnum("type").notNull(),

    requiredValue: integer("required_value").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("rank_requirement_unique").on(table.rankId, table.type),

    check("rank_requirement_positive_check", sql`${table.requiredValue} >= 0`),
  ],
);
