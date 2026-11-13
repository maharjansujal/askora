import { emptyDoc, safeParseContent } from "@/src/lib/editor/json";
import { ProseMirrorDoc } from "@/src/lib/editor/types";
import { z } from "zod";

const nonEmptyContent = z
  .unknown()
  .superRefine((val, ctx) => {
    let parsed: unknown = val;
    if (typeof val === "string") {
      try {
        parsed = JSON.parse(val);
      } catch {
        ctx.addIssue({ code: "custom", message: "Content is not valid JSON" });
        return;
      }
    }
    const result = safeParseContent(parsed);
    if (!result.success) {
      ctx.addIssue({ code: "custom", message: "Content has an invalid shape" });
      return;
    }
    if (JSON.stringify(result.data) === JSON.stringify(emptyDoc())) {
      ctx.addIssue({ code: "custom", message: "Content cannot be empty" });
    }
  })
  .transform((val): ProseMirrorDoc => {
    const parsed = typeof val === "string" ? JSON.parse(val) : val;
    return parsed as ProseMirrorDoc;
  });

export const createAnswerSchema = z.object({
  content: nonEmptyContent,
});

export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;
