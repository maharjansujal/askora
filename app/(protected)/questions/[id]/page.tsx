import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/src/lib/auth/session";
import { loadQuestionDetail } from "@/src/features/questions/lib/queries";
import { QuestionDetail } from "@/src/features/questions/components/QuestionDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuestionDetailPage({ params }: PageProps) {
  const { id } = await params;

  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login?clear_session=1");

  const result = await loadQuestionDetail({
    questionId: id,
    currentUserId: currentUser.id,
  });

  if (!result) notFound();

  return (
    <QuestionDetail
      question={result.question}
      answers={result.answers}
      currentUserId={currentUser.id}
    />
  );
}
