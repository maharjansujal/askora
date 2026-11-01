import {
  chainCommands,
  lift,
  setBlockType,
  toggleMark,
  wrapIn,
} from "prosemirror-commands";
import { editorSchema } from "./schema";
import {
  liftListItem,
  sinkListItem,
  wrapInList,
} from "prosemirror-schema-list";
import { Command, EditorState, NodeSelection } from "prosemirror-state";
import { MarkType, NodeType } from "prosemirror-model";

// Toggle bold/ italic/ code inline marks
export const toggleBold = toggleMark(editorSchema.marks.bold);
export const toggleItalic = toggleMark(editorSchema.marks.italic);
export const toggleCodeMark = toggleMark(editorSchema.marks.code);

// Block-level commands

const { nodes: schemaNodes } = editorSchema;

export const setParagraph = setBlockType(schemaNodes.paragraph);

export function toggleHeading(level: 1 | 2 | 3): Command {
  return function (state, dispatch) {
    const type = editorSchema.nodes.heading;
    const { $from } = state.selection;

    // Already this exact heading level? → back to paragraph
    if ($from.parent.type === type && $from.parent.attrs.level === level) {
      return setParagraph(state, dispatch);
    }

    // Any other block → just set heading
    return setBlockType(type, { level })(state, dispatch);
  };
}

export const toggleCodeBlock: Command = (state, dispatch) => {
  const type = editorSchema.nodes.code_block;
  const { $from } = state.selection;

  if ($from.parent.type === type) {
    return setParagraph(state, dispatch);
  }
  return setBlockType(type)(state, dispatch);
};

export const toggleBlockquote: Command = (state, dispatch) => {
  const type = editorSchema.nodes.blockquote;
  const { $from } = state.selection;

  // Already inside a blockquote? → lift out
  let inBlockquote = false;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type === type) {
      inBlockquote = true;
      break;
    }
  }

  if (inBlockquote) {
    return lift(state, dispatch);
  }

  const isParagraph = $from.parent.type === editorSchema.nodes.paragraph;
  if (!isParagraph) {
    return chainCommands(
      setBlockType(editorSchema.nodes.paragraph),
      wrapIn(type),
    )(state, dispatch);
  }

  return wrapIn(type)(state, dispatch);
};

function isInList(state: EditorState, listType: NodeType) {
  const { $from } = state.selection;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type === listType) return true;
  }
  return false;
}

const listItemType = editorSchema.nodes.list_item;

export const toggleBulletList: Command = (state, dispatch) => {
  const type = editorSchema.nodes.bullet_list;

  if (isInList(state, type)) {
    // Unwrap: lift all selected list items out of the list.
    return liftListItem(listItemType)(state, dispatch);
  }

  // Demote heading → paragraph first if needed
  const { $from } = state.selection;
  const isParagraph = $from.parent.type === editorSchema.nodes.paragraph;

  if (!isParagraph) {
    return chainCommands(
      setBlockType(editorSchema.nodes.paragraph),
      wrapInList(type),
    )(state, dispatch);
  }

  return wrapInList(type)(state, dispatch);
};

export const toggleOrderedList: Command = (state, dispatch) => {
  const type = editorSchema.nodes.ordered_list;

  if (isInList(state, type)) {
    return liftListItem(listItemType)(state, dispatch);
  }

  const { $from } = state.selection;
  const isParagraph = $from.parent.type === editorSchema.nodes.paragraph;

  if (!isParagraph) {
    return chainCommands(
      setBlockType(editorSchema.nodes.paragraph),
      wrapInList(type),
    )(state, dispatch);
  }

  return wrapInList(type)(state, dispatch);
};

export const sinkList = sinkListItem(schemaNodes.list_item);
export const liftList = liftListItem(schemaNodes.list_item);

// Check whether an inline mark is active at the current selection
export function isMarkActive(state: EditorState, mark: MarkType) {
  const { from, $from, to, empty } = state.selection;
  if (empty) return !!mark.isInSet(state.storedMarks || $from.marks());
  return state.doc.rangeHasMark(from, to, mark);
}

// Check whether a block node type is active at the current selection
export function isNodeActive(
  state: EditorState,
  type: NodeType,
  attrs?: Record<string, unknown>,
) {
  const { selection } = state;

  if (selection instanceof NodeSelection) {
    return selection.node.hasMarkup(type, attrs);
  }

  const { $from, to } = selection;

  return to <= $from.end() && $from.parent.hasMarkup(type, attrs);
}

export function isInNodeType(state: EditorState, type: NodeType) {
  const { $from } = state.selection;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type === type) return true;
  }
  return false;
}
