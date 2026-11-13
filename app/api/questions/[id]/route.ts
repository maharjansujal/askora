import { getCurrentUser } from "@/src/lib/auth/session";
import { loadQuestionDetail } from "@/src/features/questions/lib/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const currentUser = await getCurrentUser();

  try {
    const result = await loadQuestionDetail({
      questionId: id,
      currentUserId: currentUser?.id ?? null,
    });

    if (!result) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Question retrieved", ...result },
      { status: 200 },
    );
  } catch (err) {
    console.error("GET /api/questions/[id] failed", err);
    return NextResponse.json(
      { message: "Could not load question" },
      { status: 500 },
    );
  }
}
