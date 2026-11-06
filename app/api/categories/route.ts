import { listCategories } from "@/src/features/questions/lib/queries";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await listCategories();
    return NextResponse.json(
      { message: "Categories retrieved", categories },
      { status: 200 },
    );
  } catch (err) {
    console.error("GET /api/categories failed", err);
    return NextResponse.json(
      { message: "Could not load categories" },
      { status: 500 },
    );
  }
}
