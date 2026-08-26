import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    tokenHash: text("token_hash").notNull(),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    revokedAt: timestamp("revoked_at", {
      withTimezone: true,
    }),

    revokeReason: text("revoke_reason"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    lastUsedAt: timestamp("last_used_at", {
      withTimezone: true,
    }),

    userAgent: text("user_agent"),

    ipAddress: text("ip_address"),
  },
  (table) => [
    uniqueIndex("sessions_token_hash_unique").on(table.tokenHash),

    index("sessions_user_idx").on(table.userId),

    index("sessions_expires_idx").on(table.expiresAt),
  ],
);
