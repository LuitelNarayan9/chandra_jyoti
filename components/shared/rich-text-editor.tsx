"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import UnderlineExtension from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  SplitSquareHorizontal,
  Quote,
  Underline,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  disabled,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4",
        },
      }),
      UnderlineExtension,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 prose dark:prose-invert max-w-none",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border bg-card">
      {/* Toolbar */}
      {!disabled && (
        <div className="flex items-center gap-1 border-b p-1">
          <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("underline")}
            onPressedChange={() =>
              editor.chain().focus().toggleUnderline().run()
            }
          >
            <Underline className="h-4 w-4" />{" "}
            {/* Lucide doesn't export UnderlineIcon directly, check imports */}
            {/* Wait, I imported `Underline` from extension, not icon. Let me check Lucide imports */}
          </Toggle>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Toggle
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={() =>
              editor.chain().focus().toggleBulletList().run()
            }
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Toggle
            size="sm"
            pressed={editor.isActive("blockquote")}
            onPressedChange={() =>
              editor.chain().focus().toggleBlockquote().run()
            }
          >
            <Quote className="h-4 w-4" />
          </Toggle>
        </div>
      )}
      <EditorContent editor={editor} className="p-2" />
    </div>
  );
}
