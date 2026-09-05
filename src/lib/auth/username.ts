import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { sql } from "drizzle-orm";

export const generateUsername = async (name: string | null, email: string) => {
  const base = name
    ? name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "")
        .slice(0, 20)
    : email
        .split("@")[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .slice(0, 20);

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.username}) = ${base}`)
    .limit(1);

  if (!existing) return base;

  for (let i = 0; i < 5; i++) {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    const candidate = `${base}_${suffix}`;

    const [taken] = await db
      .select({ id: users.id })
      .from(users)
      .where(sql`lower(${users.username}) = ${candidate}`)
      .limit(1);

    if (!taken) return candidate;
  }
  return `${base}_${Date.now().toString(36)}`;
};
