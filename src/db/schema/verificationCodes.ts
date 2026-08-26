import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { verificationCodePurposeEnum } from "./enums";

export const verificationCodes = pgTable(
  "verification_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    purpose: verificationCodePurposeEnum("purpose")
      .notNull()
      .default("EMAIL_VERIFY"),

    // sha256 hash of the 6-digit code, never store the plaintext code
    codeHash: text("code_hash").notNull(),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    consumedAt: timestamp("consumed_at", { withTimezone: true }),

    attempts: integer("attempts").notNull().default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("verification_codes_lookup_idx").on(
      table.userId,
      table.purpose,
      table.consumedAt,
      table.createdAt,
    ),
  ],
);
