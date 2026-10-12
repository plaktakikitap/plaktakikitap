"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Quote,
  Code,
  Undo,
  Redo,
  Minus,
} from "lucide-react";

const btn = (active?: boolean) =>
  `flex h-8 w-8 items-center justify-center rounded-md transition-colors
   ${
     active
       ? "bg-[#b8934a] text-[#1a1612] shadow-sm"
       : "text-[#1a1612] hover:bg-[#1a1612]/8"
   }`;

const divider = "mx-0.5 w-px self-stretch bg-[#1a1612]/15";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  /** Eski çağrılar derlensin diye duruyor; araç çubuğu her yerde aynı. */
  variant?: "default" | "admin";
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "İçerik yazın…",
  minHeight = "12rem",
  variant: _variant = "default",
}: RichTextEditorProps) {
  void _variant;
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
    editorProps: {
      attributes: {
        class: "focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

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

  const toolbar = (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={btn() + " disabled:opacity-30"}
        title="Geri al (⌘Z)"
      >
        <Undo className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={btn() + " disabled:opacity-30"}
        title="Yinele (⌘⇧Z)"
      >
        <Redo className="h-3.5 w-3.5" />
      </button>

      <span className={divider} />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btn(editor.isActive("heading", { level: 2 }))}
        title="Büyük başlık"
      >
        <Heading2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btn(editor.isActive("heading", { level: 3 }))}
        title="Küçük başlık"
      >
        <Heading3 className="h-4 w-4" />
      </button>

      <span className={divider} />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive("bold"))}
        title="Kalın (⌘B)"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive("italic"))}
        title="İtalik (⌘I)"
      >
        <Italic className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btn(editor.isActive("underline"))}
        title="Altı çizgili (⌘U)"
      >
        <UnderlineIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btn(editor.isActive("strike"))}
        title="Üstü çizgili"
      >
        <Strikethrough className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={btn(editor.isActive("code"))}
        title="Satır içi kod"
      >
        <Code className="h-4 w-4" />
      </button>

      <span className={divider} />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive("bulletList"))}
        title="Madde listesi"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btn(editor.isActive("orderedList"))}
        title="Numaralı liste"
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btn(editor.isActive("blockquote"))}
        title="Alıntı"
      >
        <Quote className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={btn()}
        title="Yatay çizgi"
      >
        <Minus className="h-4 w-4" />
      </button>

      <span className={divider} />

      {showLinkInput ? (
        <span className="flex items-center gap-1">
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setLink();
              }
              if (e.key === "Escape") setShowLinkInput(false);
            }}
            placeholder="https://..."
            className="h-7 w-36 rounded border border-[var(--card-border)] bg-[var(--background)] px-2 text-xs focus:border-[var(--accent)] focus:outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={setLink}
            className="rounded bg-[var(--accent)] px-2 py-1 text-xs font-medium text-white"
          >
            Ekle
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="text-xs text-[#6b6158] hover:text-[#1a1612]"
          >
            İptal
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setShowLinkInput(true)}
          className={btn(editor.isActive("link"))}
          title="Bağlantı ekle (⌘K)"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
      <div
        ref={toolbarRef}
        className="sticky top-14 z-30 border-b border-[#1a1612]/10 bg-white lg:top-0"
      >
        {toolbar}
      </div>

      <BubbleMenu
        editor={editor}
        options={{ placement: "top", offset: 8 }}
        className="flex items-center gap-0.5 rounded-lg border border-[#1a1612]/10 bg-white p-1 shadow-lg"
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btn(editor.isActive("bold"))}
          title="Kalın"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btn(editor.isActive("italic"))}
          title="İtalik"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btn(editor.isActive("underline"))}
          title="Alt çizgi"
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </button>
        <span className={divider} />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={btn(editor.isActive("heading", { level: 2 }))}
          title="H2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={btn(editor.isActive("heading", { level: 3 }))}
          title="H3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </button>
        <span className={divider} />
        <button
          type="button"
          onClick={() => setShowLinkInput(true)}
          className={btn(editor.isActive("link"))}
          title="Link"
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </button>
      </BubbleMenu>

      <EditorContent
        editor={editor}
        style={{ minHeight }}
        className={`
          max-w-none px-4 py-4 text-sm text-[var(--foreground)]
          [&_.ProseMirror]:min-h-[8rem]
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:mt-4 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold
          [&_.ProseMirror_h3]:mb-1.5 [&_.ProseMirror_h3]:mt-3 [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold
          [&_.ProseMirror_p]:my-2 [&_.ProseMirror_p]:leading-relaxed
          [&_.ProseMirror_blockquote]:my-3 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-[#b8934a] [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-[#6b6158]
          [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5
          [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5
          [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:bg-[var(--secondary)] [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-xs
          [&_.ProseMirror_hr]:my-4 [&_.ProseMirror_hr]:border-[var(--card-border)]
          [&_.ProseMirror_a]:text-[var(--accent)] [&_.ProseMirror_a]:underline
          [&_.ProseMirror_.is-editor-empty:first-child:before]:pointer-events-none
          [&_.ProseMirror_.is-editor-empty:first-child:before]:float-left
          [&_.ProseMirror_.is-editor-empty:first-child:before]:h-0
          [&_.ProseMirror_.is-editor-empty:first-child:before]:text-[#6b6158]
          [&_.ProseMirror_.is-editor-empty:first-child:before]:content-[attr(data-placeholder)]
        `}
      />
    </div>
  );
}
