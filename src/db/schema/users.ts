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

    passwordHash: text("password_hash"),

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

export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    provider: text("provider").notNull(), // "google" | "github"
    providerAccountId: text("provider_account_id").notNull(), // the id Google/GitHub gives you

    email: text("email"), // from provider — for display only
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // composite unique: one account per provider per user
    uniqueIndex("oauth_accounts_provider_unique").on(
      table.provider,
      table.providerAccountId,
    ),

    index("oauth_accounts_user_idx").on(table.userId),
  ],
);
