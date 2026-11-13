"use client";

import { emptyDoc } from "@/src/lib/editor/json";
import { ProseMirrorDoc } from "@/src/lib/editor/types";
import React, { useState } from "react";
import { useCreateAnswer } from "../hooks/useCreateAnswer";
import { Button } from "@/src/components/ui/Button";
import { RichTextEditor } from "@/src/components/editor/RichTextEditor";

interface AnswerFormProps {
  questionId: string;
  disabled?: boolean;
  disabledReason?: string;
}

export function AnswerForm({
  questionId,
  disabled = false,
  disabledReason,
}: AnswerFormProps) {
  const [content, setContent] = useState<ProseMirrorDoc>(emptyDoc());
  const [error, setError] = useState<string | null>(null);

  const { createAnswer, isCreatingAnswer } = useCreateAnswer();

  const isEmpty = JSON.stringify(content) === JSON.stringify(emptyDoc());

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError(null);

    if (isEmpty) {
      setError("Please write your answer before submitting!");
      return;
    }

    try {
      await createAnswer({ questionId, content });
      setContent(emptyDoc());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post answer");
    }
  }

  if (disabled) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          {disabledReason ?? "You cannot answer this question right now."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Your answer</h2>

      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Explain your solution clearly. Include code, examples, or references where useful."
        minHeight={200}
        editable={!isCreatingAnswer}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-end">
        <Button
          type="submit"
          loading={isCreatingAnswer}
          disabled={isCreatingAnswer || isEmpty}
        >
          Post answer
        </Button>
      </div>
    </form>
  );
}
