import { db } from "@/src/db";
import { subjects } from "@/src/db/schema";
import { requireAdmin } from "@/src/lib/auth/rbac";
import { requireAdminApi } from "@/src/lib/auth/requireAdminApi";
import { eq, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const addSubjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Subject name is required")
    .max(100, "Subject name is too long"),

  slug: z
    .string()
    .trim()
    .min(1, "Subject slug is required")
    .max(100, "Subject slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens",
    ),

  description: z.string().trim().max(500, "Description is too long").optional(),
});

export const GET = async () => {
  const authResponse = await requireAdminApi();

  if (authResponse) return authResponse;

  try {
    const data = await db.select().from(subjects);
    return NextResponse.json(
      { message: "Subjects retrieved successfully", subjects: data },
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  const { user, authorized } = await requireAdmin();

  if (!user) {
    return NextResponse.json(
      { message: "User not authenticated" },
      { status: 401 },
    );
  }

  if (!authorized) {
    return NextResponse.json(
      { message: "You are not allowed to perform this operation" },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const parsed = addSubjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0]?.message ?? "Invalid input",
        },
        { status: 400 },
      );
    }

    const { name, slug, description } = parsed.data;

    const [existingSubject] = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(or(eq(subjects.slug, slug), eq(subjects.name, name)))
      .limit(1);

    if (existingSubject) {
      return NextResponse.json(
        { message: "A subject with this slug or name already exists" },
        { status: 409 },
      );
    }

    const [subject] = await db
      .insert(subjects)
      .values({
        name,
        slug,
        description: description || null,
      })
      .returning({
        id: subjects.id,
        name: subjects.name,
        slug: subjects.slug,
        description: subjects.description,
      });

    return NextResponse.json(
      {
        message: "Subject added successfully",
        subject,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
};
