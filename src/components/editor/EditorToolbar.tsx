"use client";

import { EditorState, type Command } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  SquareCode,
  Undo2,
} from "lucide-react";
import { redo, undo } from "prosemirror-history";
import { ToolbarButton } from "./ToolbarButton";
import {
  isInNodeType,
  isMarkActive,
  isNodeActive,
  setParagraph,
  toggleBlockquote,
  toggleBold,
  toggleBulletList,
  toggleCodeBlock,
  toggleCodeMark,
  toggleHeading,
  toggleItalic,
  toggleOrderedList,
} from "@/src/lib/editor/commands";
import { editorSchema } from "@/src/lib/editor/schema";

interface EditorToolbarProps {
  state: EditorState | null;
  view: EditorView | null;
  disabled?: boolean;
  onRequestLink?: () => void;
}

export const EditorToolbar = ({
  state,
  view,
  disabled = false,
  onRequestLink,
}: EditorToolbarProps) => {
  const run = (cmd: Command) => {
    if (!view) return;
    cmd(view.state, view.dispatch);
    view.focus();
  };

  // ---- Active-state helpers ------------------------------------------------

  const activeMark = (name: "bold" | "italic" | "code") =>
    state ? isMarkActive(state, editorSchema.marks[name]) : false;

  const activeHeading = (level: 1 | 2 | 3) =>
    state ? isNodeActive(state, editorSchema.nodes.heading, { level }) : false;

  const activeParagraph = () =>
    state ? isNodeActive(state, editorSchema.nodes.paragraph) : false;

  // `isInNodeType` walks *up* the ancestor chain, so it correctly reports
  // "we're inside a blockquote / list" even if the cursor sits 2+ levels deep.
  const activeBlockquote = () =>
    state ? isInNodeType(state, editorSchema.nodes.blockquote) : false;

  const activeBulletList = () =>
    state ? isInNodeType(state, editorSchema.nodes.bullet_list) : false;

  const activeOrderedList = () =>
    state ? isInNodeType(state, editorSchema.nodes.ordered_list) : false;

  const activeCodeBlock = () =>
    state ? isNodeActive(state, editorSchema.nodes.code_block) : false;

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 px-2 py-1.5">
      {/* ---- Inline marks ---- */}
      <ToolbarButton
        tooltip="Bold (Ctrl/Cmd+B)"
        disabled={disabled}
        active={activeMark("bold")}
        onClick={() => run(toggleBold)}
      >
        <Bold size={14} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Italic (Ctrl/Cmd+I)"
        disabled={disabled}
        active={activeMark("italic")}
        onClick={() => run(toggleItalic)}
      >
        <Italic size={14} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Inline code (Ctrl/Cmd+E)"
        disabled={disabled}
        active={activeMark("code")}
        onClick={() => run(toggleCodeMark)}
      >
        <Code size={14} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Insert link"
        disabled={disabled}
        onClick={onRequestLink}
      >
        <LinkIcon size={14} />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" />

      {/* Headings (toggle back to paragraph on second click) */}
      <ToolbarButton
        tooltip="Heading 1"
        disabled={disabled}
        active={activeHeading(1)}
        onClick={() => run(toggleHeading(1))}
      >
        <Heading1 size={14} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Heading 2"
        disabled={disabled}
        active={activeHeading(2)}
        onClick={() => run(toggleHeading(2))}
      >
        <Heading2 size={14} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Heading 3"
        disabled={disabled}
        active={activeHeading(3)}
        onClick={() => run(toggleHeading(3))}
      >
        <Heading3 size={14} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Paragraph"
        disabled={disabled}
        active={activeParagraph()}
        onClick={() => run(setParagraph)}
      >
        <span className="text-[11px] font-bold leading-none">¶</span>
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" />

      {/* Lists / blockquote / code block (each toggles) */}
      <ToolbarButton
        tooltip="Bullet list"
        disabled={disabled}
        active={activeBulletList()}
        onClick={() => run(toggleBulletList)}
      >
        <List size={14} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Numbered list"
        disabled={disabled}
        active={activeOrderedList()}
        onClick={() => run(toggleOrderedList)}
      >
        <ListOrdered size={14} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Blockquote"
        disabled={disabled}
        active={activeBlockquote()}
        onClick={() => run(toggleBlockquote)}
      >
        <Quote size={14} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Code block"
        disabled={disabled}
        active={activeCodeBlock()}
        onClick={() => run(toggleCodeBlock)}
      >
        <SquareCode size={14} />
      </ToolbarButton>

      <span className="mx-1 h-5 w-px bg-border" />

      {/* History */}
      <ToolbarButton
        tooltip="Undo (Ctrl/Cmd+Z)"
        disabled={disabled}
        onClick={() => run(undo)}
      >
        <Undo2 size={14} />
      </ToolbarButton>
      <ToolbarButton
        tooltip="Redo (Ctrl/Cmd+Shift+Z)"
        disabled={disabled}
        onClick={() => run(redo)}
      >
        <Redo2 size={14} />
      </ToolbarButton>
    </div>
  );
};
