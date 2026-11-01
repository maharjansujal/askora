import { Node as PMNode } from "prosemirror-model";
import { z } from "zod";
import { ProseMirrorDoc, ProseMirrorNode } from "./types";
import { editorSchema } from "./schema";

const pmNodeSchema: z.ZodType<ProseMirrorNode> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.string(), z.unknown()).nullish(),
    content: z.array(pmNodeSchema).nullish(),
    marks: z
      .array(
        z.object({
          type: z.string(),
          attrs: z.record(z.string(), z.unknown()).nullish(),
        }),
      )
      .optional(),
    text: z.string().optional(),
  }),
);

export const proseMirrorDocSchema = z.object({
  type: z.literal("doc"),
  content: z.array(pmNodeSchema),
}) satisfies z.ZodType<ProseMirrorDoc>;

// Validate and coerce an untrusted value (form field, DB payload, network) into ProseMirrorDoc. Throws ZodError on Failure

export const parseContent = (value: unknown): ProseMirrorDoc =>
  proseMirrorDocSchema.parse(value);

export const safeParseContent = (value: unknown) => {
  const result = proseMirrorDocSchema.safeParse(value);
  if (!result.success) return { success: false, error: result.error };

  return { success: true, data: result.data };
};

// A fresh empty doc -  a single empty paragraph

export const emptyDoc = (): ProseMirrorDoc => ({
  type: "doc",
  content: [{ type: "paragraph" }],
});

// Build a real PMNode from JSON. Throws if the JSON is invalid per the schema

export const jsonToNode = (doc: ProseMirrorDoc): PMNode =>
  editorSchema.nodeFromJSON(doc);

// Convert ProseMirrorDoc to a plain-text string

export function toPlainText(doc: ProseMirrorDoc) {
  try {
    return jsonToNode(doc).textBetween(0, jsonToNode(doc).content.size, "");
  } catch {
    return "";
  }
}

export function isDocEmpty(doc: ProseMirrorDoc) {
  try {
    return jsonToNode(doc).textContent.trim().length === 0;
  } catch {
    return true;
  }
}
