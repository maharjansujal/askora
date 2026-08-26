import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { roleEnum, userStatusEnum } from "./enums";
import { sql } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    username: text("username").notNull(),
    email: text("email").notNull(),

    passwordHash: text("password_hash").notNull(),

    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),

    role: roleEnum("role").notNull().default("USER"),
    rankId: uuid("rank_id"),
    pointsBalance: integer("points_balance").notNull().default(0),

    status: userStatusEnum("status").notNull().default("ACTIVE"),

    suspendedUntil: timestamp("suspended_until", {
      withTimezone: true,
    }),

    emailVerifiedAt: timestamp("email_verified_at", {
      withTimezone: true,
    }),

    passwordChangedAt: timestamp("password_changed_at", {
      withTimezone: true,
    }),

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

    lastSeenAt: timestamp("last_seen_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    uniqueIndex("users_username_unique").on(sql`lower(${table.username})`),

    uniqueIndex("users_email_unique").on(sql`lower(${table.email})`),

    index("users_role_idx").on(table.role),

    index("users_status_idx").on(table.status),
  ],
);
