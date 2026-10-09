import { db } from "@/src/db";
import { subjects } from "@/src/db/schema";
import { requireAdmin } from "@/src/lib/auth/rbac";
import { requireAdminApi } from "@/src/lib/auth/requireAdminApi";
import { and, eq, ne, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateSubjectSchema = z.object({
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

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const authResponse = await requireAdminApi();

  if (authResponse) return authResponse;
  try {
    const body = await req.json();
    const parsed = updateSubjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0]?.message ?? "Invalid input",
        },
        { status: 400 },
      );
    }

    const { name, slug, description } = parsed.data;

    const [existingRecord] = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(eq(subjects.id, id))
      .limit(1);

    if (!existingRecord) {
      return NextResponse.json(
        { message: "Subject not found" },
        { status: 404 },
      );
    }
    const [existingSubject] = await db
      .select({ id: subjects.id })
      .from(subjects)
      .where(
        and(
          or(eq(subjects.slug, slug), eq(subjects.name, name)),
          ne(subjects.id, id),
        ),
      )
      .limit(1);
    if (existingSubject) {
      return NextResponse.json(
        {
          message: "A subject with this name or slug already exists",
        },
        { status: 409 },
      );
    }
    // Update only the requested subject.
    const [updatedSubject] = await db
      .update(subjects)
      .set({
        name,
        slug,
        description: description ?? null,
      })
      .where(eq(subjects.id, id))
      .returning({
        id: subjects.id,
        name: subjects.name,
        slug: subjects.slug,
        description: subjects.description,
      });

    if (!updatedSubject) {
      return NextResponse.json(
        { message: "Subject not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Subject updated successfully",
        subject: updatedSubject,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Failed to update subject:", err);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id } = await params;
  const authResponse = await requireAdminApi();

  if (authResponse) return authResponse;
  try {
    const [deletedSubject] = await db
      .delete(subjects)
      .where(eq(subjects.id, id))
      .returning({ id: subjects.id });

    if (!deletedSubject) {
      return NextResponse.json(
        { message: "Subject not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { message: "Subject deleted successfully", deletedSubject },
      { status: 200 },
    );
  } catch (err) {
    console.error("Failed to update subject:", err);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
};
