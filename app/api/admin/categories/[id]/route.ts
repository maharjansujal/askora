import { db } from "@/src/db";
import { categories } from "@/src/db/schema";
import { requireAdmin } from "@/src/lib/auth/rbac";
import { requireAdminApi } from "@/src/lib/auth/requireAdminApi";
import { and, eq, ne, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name is too long"),

  slug: z
    .string()
    .trim()
    .min(1, "Category slug is required")
    .max(100, "Category slug is too long")
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

    const body = await req.json();
    const parsed = updateCategorySchema.safeParse(body);

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
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!existingRecord) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 },
      );
    }
    const [existingCategory] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          or(eq(categories.slug, slug), eq(categories.name, name)),
          ne(categories.id, id),
        ),
      )
      .limit(1);
    if (existingCategory) {
      return NextResponse.json(
        {
          message: "A category with this name or slug already exists",
        },
        { status: 409 },
      );
    }
    // Update only the requested category.
    const [updatedCategory] = await db
      .update(categories)
      .set({
        name,
        slug,
      })
      .where(eq(categories.id, id))
      .returning({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      });

    if (!updatedCategory) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Category updated successfully",
        category: updatedCategory,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Failed to update category:", err);

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
    const [deletedCategory] = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });

    if (!deletedCategory) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { message: "Category deleted successfully", deletedCategory },
      { status: 200 },
    );
  } catch (err) {
    console.error("Failed to update category:", err);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
};
