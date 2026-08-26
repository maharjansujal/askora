import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const attachments = pgTable(
  "attachments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    uploadedBy: uuid("uploaded_by")
      .notNull()
      .references(() => users.id),
    storageKey: text("storage_key").notNull(),
    url: text("url").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    originalFilename: text("original_filename"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("attachments_storage_key_unique").on(table.storageKey),
    index("attachments_uploaded_by_idx").on(table.uploadedBy),
  ],
);
