import { QuestionFeed } from "@/src/features/questions/components/QuestionFeed";
import { getCurrentUser } from "@/src/lib/auth/session";
import { redirect } from "next/navigation";

export default async function QuestionsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login?clear_session=1");

  return <QuestionFeed pointsBalance={currentUser.pointsBalance} />;
}
