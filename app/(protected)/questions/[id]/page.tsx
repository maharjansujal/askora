import { RichTextViewer } from "@/src/components/editor/RichTextViewer";
import { Button } from "@/src/components/ui/Button";
import { getQuestionById } from "@/src/features/questions/lib/queries";
import Link from "next/link";
import { notFound } from "next/navigation";

interface QuestionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function QuestionDetailPage({
  params,
}: QuestionDetailPageProps) {
  const { id } = await params;

  const question = await getQuestionById(id);

  if (!question || question.status === "DELETED" || !question.content) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <Link
          href="/questions"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to feed
        </Link>
      </div>

      <article className="space-y-4 rounded-lg border border-border bg-card p-6">
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-accent/15 px-2 py-0.5 font-semibold text-accent">
              ✦ {question.pointsCost} pts
            </span>
            <span>·</span>
            <span>{question.subjectName}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {question.title}
          </h1>
        </header>

        <RichTextViewer doc={question.content} />

        {question.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-t border-border pt-4">
            {question.categories.map((cat) => (
              <span
                key={cat.id}
                className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}
      </article>

      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          Answers, votes, and comments coming in the next chunk.
        </p>
      </div>
    </div>
  );
}
