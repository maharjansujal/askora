import { db } from "@/src/db";
import { ranks, users, userStats } from "@/src/db/schema";
import { hashPassword } from "@/src/lib/auth/password";
import { requireAdminApi } from "@/src/lib/auth/requireAdminApi";
import { AnyColumn, count, desc, eq, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const userSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password should be at least 8 characters")
    .max(128)
    .optional(),
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .max(50, "Display name cannot exceed 50 characters"),
  bio: z.string().trim().max(280).optional(),
  role: z.enum(["USER", "MODERATOR", "ADMIN"]).default("USER"),
  emailVerified: z.boolean().default(true),
});

const lower = (column: AnyColumn) => sql`lower(${column})`;

export async function GET(req: NextRequest) {
  const authResponse = await requireAdminApi();
  if (authResponse) return authResponse;

  try {
    const params = req.nextUrl.searchParams;
    const page = Math.max(1, Number(params.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.get("limit")) || 20));
    const rows = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        role: users.role,
        status: users.status,
        pointsBalance: users.pointsBalance,
        emailVerifiedAt: users.emailVerifiedAt,
        createdAt: users.createdAt,
        lastSeenAt: users.lastSeenAt,
        rank: ranks.name,
      })
      .from(users)
      .leftJoin(ranks, eq(users.rankId, ranks.id))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const [{ total }] = await db.select({ total: count() }).from(users);

    return NextResponse.json(
      {
        message: "Users retrieved successfully",
        users: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const authResponse = await requireAdminApi();
  if (authResponse) return authResponse;

  try {
    const body = await req.json();
    const parsed = userSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    const { password, bio, role, emailVerified, displayName } = parsed.data;
    const email = parsed.data.email.trim().toLowerCase();
    const username = parsed.data.username.toLowerCase();

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(
        or(eq(lower(users.email), email), eq(lower(users.username), username)),
      )
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        {
          message: "A user with this email or username already exists",
        },
        { status: 409 },
      );
    }

    const passwordHash = password ? await hashPassword(password) : null;

    const created = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          username,
          email,
          passwordHash,
          displayName,
          bio: bio || null,
          role,
          emailVerifiedAt: emailVerified ? new Date() : null,
        })
        .returning({
          id: users.id,
          displayName: users.displayName,
          role: users.role,
          username: users.username,
          email: users.email,
        });
      await tx.insert(userStats).values({ userId: user.id });
      return user;
    });

    return NextResponse.json(
      { message: "User created successfully", user: created },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
