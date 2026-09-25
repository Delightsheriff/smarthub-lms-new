"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extensions";
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Strikethrough,
  Code,
  Heading2,
  Quote,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  /** Controlled HTML value. Editor re-syncs only when this changes
   *  externally (e.g. RHF reset / edit-mode prefill) — typing doesn't
   *  bounce through this prop. */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  /** When set, shows a live character counter under the editor. Counts
   *  the HTML length (`value.length`) because that's exactly what the
   *  API validates — a text-only count would understate and let the
   *  saved HTML slip past the server cap. Over-limit turns the counter
   *  red; enforcement is left to the form's schema. */
  maxLength?: number;
}

/**
 * TipTap-backed rich-text editor. Output is sanitised HTML compatible
 * with the existing `RichText` reader (DOMPurify allowlist already
 * covers everything this toolbar produces — bold/italic/strike/lists/
 * links/headings/blockquote/code).
 *
 * Used wherever operators need formatted instructions: material guide
 * bodies, assignment briefs, announcements.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  maxLength,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Placeholder.configure({
        placeholder:
          placeholder || "Write your instructions, links, code snippets…",
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[140px] max-h-[400px] overflow-y-auto rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed",
          "focus:outline-none focus:ring-1 focus:ring-ring",
          "[&_p]:mb-2 [&_p:last-child]:mb-0",
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold",
          "[&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3",
          "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs font-mono",
          "[&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
          "[&_p.is-editor-empty:first-child]:before:text-muted-foreground",
          "[&_p.is-editor-empty:first-child]:before:float-left",
          "[&_p.is-editor-empty:first-child]:before:pointer-events-none",
          "[&_p.is-editor-empty:first-child]:before:h-0",
        ),
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // External value reset (RHF `reset` on edit-mode prefill). Skip
  // when the value already matches to avoid clobbering selection while
  // the user is typing.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div
        className={cn(
          "min-h-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground",
          className,
        )}
      >
        Loading editor…
      </div>
    );
  }

  const count = value?.length ?? 0;
  const over = typeof maxLength === "number" && count > maxLength;

  return (
    <div className={cn("space-y-2", className)}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      {typeof maxLength === "number" && (
        <p
          className={cn(
            "text-right text-xs tabular-nums font-mono",
            over ? "text-destructive font-medium" : "text-muted-foreground",
          )}
        >
          {count.toLocaleString()} / {maxLength.toLocaleString()}
          {over ? " — too long" : ""}
        </p>
      )}
    </div>
  );
}

function Toolbar({
  editor,
}: {
  editor: ReturnType<typeof useEditor>;
}) {
  if (!editor) return null;
  const isActive = (name: string, opts?: Record<string, unknown>) =>
    editor.isActive(name, opts) ? "bg-muted text-foreground" : "text-muted-foreground";

  const promptLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-md border border-border bg-card p-1">
      <ToolbarButton
        title="Bold"
        active={isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Strikethrough"
        active={isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Inline code"
        active={isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="h-3.5 w-3.5" />
      </ToolbarButton>

      <span className="mx-1 h-4 w-px bg-border" />

      <ToolbarButton
        title="Heading"
        active={isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        <Heading2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Bulleted list"
        active={isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Numbered list"
        active={isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Quote"
        active={isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-3.5 w-3.5" />
      </ToolbarButton>

      <span className="mx-1 h-4 w-px bg-border" />

      <ToolbarButton
        title="Add link"
        active={isActive("link")}
        onClick={promptLink}
      >
        <Link2 className="h-3.5 w-3.5" />
      </ToolbarButton>

      <span className="mx-1 h-4 w-px bg-border" />

      <ToolbarButton
        title="Undo"
        active=""
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 className="h-3.5 w-3.5" />
      </ToolbarButton>
      <ToolbarButton
        title="Redo"
        active=""
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 className="h-3.5 w-3.5" />
      </ToolbarButton>
    </div>
  );
}

function ToolbarButton({
  title,
  active,
  onClick,
  children,
}: {
  title: string;
  active: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-muted hover:text-foreground",
        active,
      )}
    >
      {children}
    </button>
  );
}
