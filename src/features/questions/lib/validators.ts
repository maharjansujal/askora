import { emptyDoc, safeParseContent } from "@/src/lib/editor/json";
import { z } from "zod";
import {
  MAX_QUESTION_COST,
  MIN_QUESTION_COST,
} from "../../points/lib/constants";

const nonEmptyContent = z.unknown().superRefine((val, ctx) => {
  let parsed: unknown = val;

  // If it came in as a string (FormData), try to JSON.parse it.
  if (typeof val === "string") {
    try {
      parsed = JSON.parse(val);
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "Content is not valid JSON",
      });
      return;
    }
  }

  const result = safeParseContent(parsed);
  if (!result.success) {
    ctx.addIssue({ code: "custom", message: "Content has an invalid shape" });
    return;
  }

  // Reject docs that are just an empty paragraph
  const hasText = JSON.stringify(result.data) !== JSON.stringify(emptyDoc());
  if (!hasText) {
    ctx.addIssue({ code: "custom", message: "Content cannot be empty" });
  }
});

export const createQuestionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, "Title must be at least 10 characters")
    .max(150, "Title must be 150 characters or fewer"),

  content: nonEmptyContent,

  subjectId: z.uuid({ message: "Please pick a subject" }),

  categoryIds: z
    .array(z.uuid())
    .min(1, "Pick at least one category")
    .max(3, "You can pick up to 3 categories"),

  pointsCost: z.coerce
    .number()
    .int("Points must be a whole number")
    .min(MIN_QUESTION_COST, `Minimum is ${MIN_QUESTION_COST} points`)
    .max(MAX_QUESTION_COST, `Maximum is ${MAX_QUESTION_COST} points`),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
