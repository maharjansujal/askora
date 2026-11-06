import { listSubjects } from "@/src/features/questions/lib/queries";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const subjects = await listSubjects();
    return NextResponse.json(
      { message: "Subjects retrieved", subjects },
      { status: 200 },
    );
  } catch (err) {
    console.error("GET /api/subjects failed", err);
    return NextResponse.json(
      { message: "Could not load subjects" },
      { status: 500 },
    );
  }
}
