import {
  baseKeymap,
  chainCommands,
  createParagraphNear,
  exitCode,
  liftEmptyBlock,
  newlineInCode,
  setBlockType,
  splitBlock,
  toggleMark,
} from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import { history, redo, undo } from "prosemirror-history";
import {
  liftListItem,
  sinkListItem,
  splitListItem,
} from "prosemirror-schema-list";
import type { Plugin } from "prosemirror-state";
import { editorSchema } from "./schema";

const { marks, nodes } = editorSchema;

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iP(hone|ad|od)/.test(navigator.platform);

const modKey = isMac ? "Mod" : "Ctrl";

export const buildKeyMap = () => [
  keymap({
    [`${modKey}-b`]: toggleMark(marks.bold),
    [`${modKey}-i`]: toggleMark(marks.italic),
    [`${modKey}-e`]: toggleMark(marks.code),
    [`${modKey}-z`]: undo,
    [`${modKey}-Shift-z`]: redo,
    [`${modKey}-y`]: redo,

    Enter: chainCommands(
      newlineInCode,
      createParagraphNear,
      liftEmptyBlock,
      splitListItem(nodes.list_item),
      splitBlock,
    ),

    Tab: sinkListItem(nodes.list_item),
    "Shift-Tab": liftListItem(nodes.list_item),

    "Mod-Shift-1": setBlockType(nodes.heading, { level: 1 }),
    "Mod-Shift-2": setBlockType(nodes.heading, { level: 2 }),
    "Mod-Shift-3": setBlockType(nodes.heading, { level: 3 }),
    "Mod-Shift-0": setBlockType(nodes.paragraph),

    Backspace: chainCommands(exitCode, (state, dispatch) => {
      if (dispatch) dispatch(state.tr.deleteSelection());
      return true;
    }),
  }),

  // history (undo/redo stack) — must come after our own keybindings
  history(),

  // default ProseMirror bindings for arrows, selection, etc.
  keymap(baseKeymap),
];
