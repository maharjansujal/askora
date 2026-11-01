"use client";

import { useState } from "react";
import { RichTextEditor } from "@/src/components/editor/RichTextEditor";
import { RichTextViewer } from "@/src/components/editor/RichTextViewer";
import { emptyDoc, toPlainText } from "@/src/lib/editor/json";
import type { ProseMirrorDoc } from "@/src/lib/editor/types";

export default function EditorTestPage() {
  const [doc, setDoc] = useState<ProseMirrorDoc>(emptyDoc());

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Editor test</h1>

      <RichTextEditor
        value={doc}
        onChange={setDoc}
        placeholder="Try typing… markdown shortcuts like # and - also work"
        minHeight={240}
      />

      <div className="rounded-md border border-border bg-muted p-4">
        <h2 className="mb-2 text-sm font-bold">Plain text output</h2>
        <pre className="whitespace-pre-wrap text-xs">{toPlainText(doc)}</pre>
      </div>

      <div className="rounded-md border border-border p-4">
        <h2 className="mb-2 text-sm font-bold">
          Raw JSON (this is what hits the DB)
        </h2>
        <pre className="max-h-72 overflow-auto text-xs">
          {JSON.stringify(doc, null, 2)}
        </pre>
      </div>

      <div className="rounded-md border border-border p-4">
        <h2 className="mb-2 text-sm font-bold">
          Read-only viewer (round-trip test)
        </h2>
        <RichTextViewer doc={doc} />
      </div>
    </div>
  );
}
