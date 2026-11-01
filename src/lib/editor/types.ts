export type ProseMirrorMark = {
  type: string;
  attrs?: Record<string, unknown> | null;
};

export type ProseMirrorNode = {
  type: string;
  attrs?: Record<string, unknown> | null;
  content?: ProseMirrorNode[] | null;
  marks?: ProseMirrorMark[];
  text?: string;
};

export type ProseMirrorDoc = {
  type: "doc";
  content: ProseMirrorNode[];
};

// Editor's emit signature, always returns a valid ProseMirrorDoc
export type EditorChangeHandler = (doc: ProseMirrorDoc) => void;
