// src/components/admin/RichTextEditor.tsx
import { useEffect } from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  Heading2Icon,
  LinkIcon,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

function sanitizeHtml(input: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input || "", "text/html");

  // Remove dangerous nodes entirely
  doc
    .querySelectorAll("script, iframe, object, embed, link, meta, base")
    .forEach((el) => el.remove());

  // Strip event handlers and javascript: URLs
  doc.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();

      if (name.startsWith("on")) {
        el.removeAttribute(attr.name);
      }

      if (
        (name === "href" || name === "src") &&
        value.startsWith("javascript:")
      ) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return doc.body.innerHTML;
}

function normalizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
    ],
    content: sanitizeHtml(content),
    onUpdate: ({ editor }) => {
      onChange(sanitizeHtml(editor.getHTML()));
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg prose-invert max-w-none focus:outline-none min-h-[300px] p-4",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const safeContent = sanitizeHtml(content || "");
    if (safeContent !== editor.getHTML()) {
      editor.commands.setContent(safeContent, false);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    const safeUrl = normalizeUrl(url);
    if (!safeUrl) {
      alert("Please enter a valid http or https URL.");
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: safeUrl })
      .run();
  };

  return (
    <div className="border border-border rounded-md overflow-hidden bg-background">
      <div className="bg-surface border-b border-border p-2 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-surface-dark transition-colors ${
            editor.isActive("bold")
              ? "bg-primary/20 text-primary"
              : "text-muted"
          }`}
          title="Bold"
        >
          <BoldIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-surface-dark transition-colors ${
            editor.isActive("italic")
              ? "bg-primary/20 text-primary"
              : "text-muted"
          }`}
          title="Italic"
        >
          <ItalicIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-border mx-1 my-auto" />

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-2 rounded hover:bg-surface-dark transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-primary/20 text-primary"
              : "text-muted"
          }`}
          title="Heading 2"
        >
          <Heading2Icon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-border mx-1 my-auto" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-surface-dark transition-colors ${
            editor.isActive("bulletList")
              ? "bg-primary/20 text-primary"
              : "text-muted"
          }`}
          title="Bullet List"
        >
          <ListIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-surface-dark transition-colors ${
            editor.isActive("orderedList")
              ? "bg-primary/20 text-primary"
              : "text-muted"
          }`}
          title="Numbered List"
        >
          <ListOrderedIcon className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-border mx-1 my-auto" />

        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded hover:bg-surface-dark transition-colors ${
            editor.isActive("link")
              ? "bg-primary/20 text-primary"
              : "text-muted"
          }`}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
      </div>

      <EditorContent editor={editor} className="bg-background text-main" />
    </div>
  );
}
