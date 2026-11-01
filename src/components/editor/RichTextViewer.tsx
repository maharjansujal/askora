"use client";

import { jsonToNode } from "@/src/lib/editor/json";
import { ProseMirrorDoc } from "@/src/lib/editor/types";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { useEffect, useRef } from "react";

interface RichTextViewerProps {
  doc: ProseMirrorDoc;
  className?: string;
}

// Read-only ProseMirror renderer, uses the same schema as RichTextEditor so any authored content is guaranteed to render

export function RichTextViewer({ doc, className = "" }: RichTextViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    const state = EditorState.create({ doc: jsonToNode(doc) });
    const view = new EditorView(hostRef.current, {
      state,
      editable: () => false,
      attributes: {
        class: "rte-content",
      },
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [doc]);

  return <div ref={hostRef} className={`rte-viewer ${className}`} />;
}
