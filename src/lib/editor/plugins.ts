import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
import {
  inputRules,
  wrappingInputRule,
  textblockTypeInputRule,
  smartQuotes,
  emDash,
  ellipsis,
} from "prosemirror-inputrules";
import type { Plugin } from "prosemirror-state";
import { editorSchema } from "./schema";

export function buildInputRules() {
  const { nodes } = editorSchema;

  const rules = [
    textblockTypeInputRule(/^(#{1,3})\s$/, nodes.heading, (match) => ({
      level: match[1].length,
    })),

    wrappingInputRule(/^\s*>\s$/, nodes.blockquote),

    textblockTypeInputRule(/^```(\S*)\s$/, nodes.code_block, (match) => ({
      params: match[1] ?? "",
    })),

    wrappingInputRule(/^\s*([-+*])\s$/, nodes.bullet_list),

    wrappingInputRule(/^(\d+)\.\s$/, nodes.ordered_list, (match) => ({
      order: Number(match[1]),
    })),
  ];

  return inputRules({
    rules: [...rules, smartQuotes, emDash, ellipsis].flat(),
  });
}

export function buildPlugins() {
  return [
    buildInputRules(),
    dropCursor({ color: "currentColor", width: 2 }),
    gapCursor(),
  ];
}
