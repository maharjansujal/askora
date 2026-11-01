"use client";

import { emptyDoc, jsonToNode } from "@/src/lib/editor/json";
import { buildKeyMap } from "@/src/lib/editor/keymap";
import { buildPlugins } from "@/src/lib/editor/plugins";
import { editorSchema } from "@/src/lib/editor/schema";
import { ProseMirrorDoc } from "@/src/lib/editor/types";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { useEffect, useRef, useState } from "react";
import { EditorToolbar } from "./EditorToolbar";

interface RichTextEditorProps {
  value?: ProseMirrorDoc | null;
  onChange: (doc: ProseMirrorDoc) => void;
  placeholder?: string;
  editable?: boolean;
  minHeight?: number;
  className?: string;
  autoFocus?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something",
  editable = true,
  minHeight = 200,
  className = "",
  autoFocus = false,
}: RichTextEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [state, setState] = useState<EditorState | null>(null);

  //   Keep the latest onChange in a ref so we never re-mount for a new callback
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!hostRef.current) return;
    const initialDoc = value
      ? jsonToNode(value)
      : editorSchema.nodeFromJSON(emptyDoc());

    const pmState = EditorState.create({
      doc: initialDoc,
      plugins: [...buildPlugins(), ...buildKeyMap()],
    });

    const view = new EditorView(hostRef.current, {
      state: pmState,
      editable: () => editable,
      attributes: {
        class: "rte-content prose-focus-none",
        style: `min-height: ${minHeight}px`,
        "data-placeholder": placeholder,
      },
      dispatchTransaction(tr) {
        const next = view.state.apply(tr);
        view.updateState(next);
        setState(next);
        if (tr.docChanged) {
          onChangeRef.current(next.doc.toJSON() as ProseMirrorDoc);
        }
      },
    });

    viewRef.current = view;
    setState(view.state);

    if (autoFocus) view.focus();

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Intentionally mount once; external 'value' changes are handled below.
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || !value) return;
    const current = view.state.doc.toJSON() as ProseMirrorDoc;
    if (JSON.stringify(current) === JSON.stringify(value)) return;

    const newDoc = jsonToNode(value);
    const tr = view.state.tr.replaceWith(
      0,
      view.state.doc.content.size,
      newDoc.content,
    );
    view.dispatch(tr);
  }, [value]);

  function handleRequestLink() {
    const view = viewRef.current;
    if (!view) return;
    const href = window.prompt("Enter URL (https://…)", "https://");
    if (!href) return;
    const { from, to, empty } = view.state.selection;
    const mark = editorSchema.marks.link.create({ href });
    if (empty) {
      // Insert the URL as the linked text
      view.dispatch(
        view.state.tr
          .insertText(href, from, to)
          .addMark(from, from + href.length, mark),
      );
    } else {
      view.dispatch(view.state.tr.addMark(from, to, mark));
    }
    view.focus();
  }

  return (
    <div
      className={`overflow-hidden rounded-md border border-input bg-background focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 ${className}`}
    >
      {editable && (
        <EditorToolbar
          state={state}
          view={viewRef.current}
          onRequestLink={handleRequestLink}
        />
      )}

      <div
        ref={hostRef}
        className="rte-host"
        // ProseMirror's contenteditable lives inside this div
      />
    </div>
  );
}
