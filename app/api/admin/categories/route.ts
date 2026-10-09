import { db } from "@/src/db";
import { categories } from "@/src/db/schema";
import { requireAdmin } from "@/src/lib/auth/rbac";
import { requireAdminApi } from "@/src/lib/auth/requireAdminApi";
import { eq, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const addCategorySchema = z.object({
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

export const GET = async () => {
  const authResponse = await requireAdminApi();

  if (authResponse) return authResponse;

  try {
    const data = await db.select().from(categories);
    return NextResponse.json(
      { message: "Categories retrieved successfully", categories: data },
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

  const authResponse = await requireAdminApi();

  if (authResponse) return authResponse;

  try {
    const body = await req.json();
    const parsed = addCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0]?.message ?? "Invalid input",
        },
        { status: 400 },
      );
    }

    const { name, slug, description } = parsed.data;

    const [existingCategory] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(or(eq(categories.slug, slug), eq(categories.name, name)))
      .limit(1);

    if (existingCategory) {
      return NextResponse.json(
        { message: "A category with this slug or name already exists" },
        { status: 409 },
      );
    }

    const [category] = await db
      .insert(categories)
      .values({
        name,
        slug,
      })
      .returning({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      });

    return NextResponse.json(
      {
        message: "Category added successfully",
        category,
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
