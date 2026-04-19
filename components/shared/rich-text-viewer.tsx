"use client";
import "../../app/rte-styles.css";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Typography from "@tiptap/extension-typography";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { useEffect } from "react";

interface RichTextViewerProps {
  content: string;
  /**
   * Optional extra Tailwind / CSS classes applied to the outer wrapper div.
   * Useful for controlling max-width, padding, background, etc. at the call site.
   * e.g. className="max-w-3xl mx-auto px-4 bg-[#f5f0e8]"
   */
  className?: string;
}

export function RichTextViewer({ content, className }: RichTextViewerProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: { languageClassPrefix: "language-" },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      LinkExtension.configure({
        // Links are clickable in the viewer
        openOnClick: true,
        HTMLAttributes: {
          // Keep the same class as the editor so link styles apply
          class: "rte-link",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: { class: "rte-image" },
      }),
      TextStyle,
      Color,
      TaskList,
      // Checkboxes are read-only in the viewer
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      Typography,
      Subscript,
      Superscript,
    ],
    content,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        /**
         * THE KEY FIX: use "rte-editor" here, exactly as the editor does.
         * This activates all the shared styles from rte-styles.css so the
         * viewer renders identically to the editor.
         *
         * Previously this was "prose dark:prose-invert …" which had NO
         * overlap with the .rte-editor scoped CSS, causing all formatting
         * to be lost on the view page.
         */
        class: "rte-editor",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
}
