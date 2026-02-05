"use client";

import { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Heading2, Heading3, Link as LinkIcon } from "lucide-react";

const toolbarBtnClass =
  "flex h-8 w-8 items-center justify-center rounded border border-[var(--card-border)] bg-[var(--background)] text-[var(--muted)] transition hover:bg-[var(--secondary)] hover:text-[var(--foreground)] data-[active]:bg-[var(--accent-soft)] data-[active]:text-[var(--accent)] data-[active]:border-[var(--accent)]";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({ value, onChange, placeholder = "İçerik yazın…", minHeight = "12rem" }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "yazilarim-editor min-h-[8rem] px-3 py-2 text-sm focus:outline-none",
      },
    },
  });

  const syncContent = useCallback(() => {
    if (!editor) return;
    const html = editor.getHTML();
    if (html !== value) onChange(html);
  }, [editor, value, onChange]);

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    return () => {
      if (editor) syncContent();
    };
  }, [editor, syncContent]);

  const setLink = useCallback(() => {
    if (!editor) return;
    if (linkUrl.trim()) {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
      <div className="flex flex-wrap items-center gap-1 border-b border-[var(--card-border)] p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarBtnClass}
          data-active={editor.isActive("bold") ? "true" : undefined}
          title="Kalın"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarBtnClass}
          data-active={editor.isActive("italic") ? "true" : undefined}
          title="İtalik"
        >
          <Italic className="h-4 w-4" />
        </button>
        <span className="mx-1 w-px self-stretch bg-[var(--card-border)]" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={toolbarBtnClass}
          data-active={editor.isActive("heading", { level: 2 }) ? "true" : undefined}
          title="Başlık 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={toolbarBtnClass}
          data-active={editor.isActive("heading", { level: 3 }) ? "true" : undefined}
          title="Başlık 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>
        <span className="mx-1 w-px self-stretch bg-[var(--card-border)]" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarBtnClass}
          data-active={editor.isActive("bulletList") ? "true" : undefined}
          title="Madde işareti listesi"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={toolbarBtnClass}
          data-active={editor.isActive("orderedList") ? "true" : undefined}
          title="Numaralı liste"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <span className="mx-1 w-px self-stretch bg-[var(--card-border)]" />
        {showLinkInput ? (
          <span className="flex items-center gap-1">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), setLink())}
              placeholder="https://..."
              className="h-8 w-40 rounded border border-[var(--card-border)] px-2 text-sm"
              autoFocus
            />
            <button type="button" onClick={setLink} className="rounded bg-[var(--primary)] px-2 py-1 text-xs text-[var(--primary-foreground)]">
              Ekle
            </button>
            <button type="button" onClick={() => setShowLinkInput(false)} className="text-xs text-[var(--muted)]">
              İptal
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setShowLinkInput(true)}
            className={toolbarBtnClass}
            data-active={editor.isActive("link") ? "true" : undefined}
            title="Link ekle"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
        )}
      </div>
      <EditorContent
        editor={editor}
        style={{ minHeight }}
        className="yazilarim-editor-wrap [&_.ProseMirror]:min-h-[8rem] [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-2 [&_.ProseMirror]:outline-none [&_.ProseMirror.p-is-empty:before]:pointer-events-none [&_.ProseMirror.p-is-empty:before]:float-left [&_.ProseMirror.p-is-empty:before]:h-0 [&_.ProseMirror.p-is-empty:before]:text-[var(--muted)] [&_.ProseMirror.p-is-empty:before]:content-[attr(data-placeholder)]"
      />
    </div>
  );
}
