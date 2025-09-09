"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor as TipTapEditor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import sanitizeHtml from "sanitize-html";
import { useState } from "react";
import { useEffect } from "react";

type Props = {
  value?: string; // HTML
  onChange?: (html: string) => void;
};

export default function RichEditor({ value, onChange }: Props) {
  const [showPreview, setShowPreview] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      TaskList,
      TaskItem,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "<p>Start typing…</p>",
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none min-h-40 rounded-2xl border border-black/10 dark:border-white/15 p-4 focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value && value !== editor.getHTML()) editor.commands.setContent(value, { emitUpdate: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const previewHtml = sanitizeHtml(value || editor.getHTML());

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Toolbar editor={editor} />
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" className="accent-brand" checked={showPreview} onChange={(e) => setShowPreview(e.target.checked)} />
          Preview
        </label>
      </div>
      {showPreview ? (
        <div className="prose dark:prose-invert max-w-none rounded-2xl border border-black/10 dark:border-white/15 p-4" dangerouslySetInnerHTML={{ __html: previewHtml }} />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  );
}

function Btn({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1 text-xs transition-colors " +
        (active
          ? "border-brand bg-brand text-white"
          : "border-black/10 dark:border-white/15 hover:border-brand/60")
      }
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: TipTapEditor }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-black/10 dark:border-white/15 p-2">
      <Btn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>B</Btn>
      <Btn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        I
      </Btn>
      <Btn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        U
      </Btn>
      <Btn active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        Code
      </Btn>
      <Btn active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        Code Block
      </Btn>
      <Btn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        Quote
      </Btn>
      <Btn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • List
      </Btn>
      <Btn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. List
      </Btn>
      <Btn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </Btn>
      <Btn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </Btn>
      <Btn onClick={() => editor.chain().focus().undo().run()}>Undo</Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()}>Redo</Btn>
      <ImageUploadButton editor={editor} />
      <Btn onClick={() => editor.chain().focus().toggleTaskList().run()}>Checklist</Btn>
      <Btn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>Table 3x3</Btn>
      <Btn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>Clear</Btn>
    </div>
  );
}

function ImageUploadButton({ editor }: { editor: TipTapEditor }) {
  async function pickAndUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const alt = window.prompt('Alt text (optional):', file.name) || '';
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      const json = await res.json();
      if (res.ok && json.url) {
        editor.chain().focus().setImage({ src: json.url, alt }).run();
      } else {
        alert(json.error || 'Upload failed');
      }
    };
    input.click();
  }
  return (
    <Btn onClick={pickAndUpload}>Image</Btn>
  );
}
