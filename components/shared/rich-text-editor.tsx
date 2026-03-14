"use client";

import { useEffect, useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
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
import { cn } from "@/lib/utils";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code2,
  Link as LinkIcon,
  ImageIcon,
  Minus,
  Undo2,
  Redo2,
  Highlighter,
  Palette,
  Table as TableIcon,
  Subscript as SubIcon,
  Superscript as SupIcon,
  Type,
  ChevronDown,
  Check,
  X,
  Pilcrow,
} from "lucide-react";

import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── Constants ───────────────────────────────────────────────────────────────

const HIGHLIGHT_COLORS = [
  { color: "#FEF08A", label: "Yellow" },
  { color: "#BBF7D0", label: "Green" },
  { color: "#BAE6FD", label: "Blue" },
  { color: "#FCA5A5", label: "Red" },
  { color: "#DDD6FE", label: "Purple" },
  { color: "#FED7AA", label: "Orange" },
  { color: "#F9A8D4", label: "Pink" },
  { color: "transparent", label: "Clear" },
];

const TEXT_COLORS = [
  { color: "inherit", label: "Default" },
  { color: "#ef4444", label: "Red" },
  { color: "#f97316", label: "Orange" },
  { color: "#eab308", label: "Yellow" },
  { color: "#22c55e", label: "Green" },
  { color: "#3b82f6", label: "Blue" },
  { color: "#8b5cf6", label: "Purple" },
  { color: "#ec4899", label: "Pink" },
  { color: "#6b7280", label: "Gray" },
];

// ─── ToolbarButton ────────────────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  tooltip,
  children,
  className,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          size="sm"
          pressed={isActive}
          onPressedChange={onClick}
          disabled={disabled}
          className={cn(
            "h-8 w-8 p-0 rounded-md transition-all duration-150",
            "text-stone-500 hover:text-stone-800 hover:bg-stone-200/60",
            "data-[state=on]:bg-amber-100 data-[state=on]:text-amber-700 data-[state=on]:shadow-none",
            "disabled:opacity-30 disabled:cursor-not-allowed",
            className
          )}
        >
          {children}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="text-xs bg-stone-900 text-stone-100 border-stone-800"
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

function ToolbarSeparator() {
  return <Separator orientation="vertical" className="h-4 mx-1 bg-stone-200" />;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxChars?: number;
  minHeight?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your story…",
  maxChars,
  minHeight = 480,
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);

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
        openOnClick: false,
        HTMLAttributes: {
          class: "rte-link",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: { class: "rte-image" },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      CharacterCount.configure({ limit: maxChars }),
      TextStyle,
      Color,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Typography,
      Subscript,
      Superscript,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        // ↓ "rte-editor" activates all shared styles from rte-styles.css
        class: "rte-editor focus:outline-none",
        spellcheck: "true",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  // ─── Link handlers ────────────────────────────────────────────────────────

  const openLinkPopover = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href ?? "";
    setLinkUrl(prev);
    setLinkPopoverOpen(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    if (!linkUrl) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    }
    setLinkPopoverOpen(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
    setLinkPopoverOpen(false);
  }, [editor]);

  // ─── Image handler ────────────────────────────────────────────────────────

  const applyImage = useCallback(() => {
    if (!editor || !imageUrl) return;
    editor
      .chain()
      .focus()
      .setImage({ src: imageUrl, alt: imageAlt || undefined })
      .run();
    setImagePopoverOpen(false);
    setImageUrl("");
    setImageAlt("");
  }, [editor, imageUrl, imageAlt]);

  // ─── Table ────────────────────────────────────────────────────────────────

  const insertTable = useCallback(() => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  // ─── Heading label ────────────────────────────────────────────────────────

  const activeHeadingLabel = () => {
    if (!editor) return "Paragraph";
    if (editor.isActive("heading", { level: 1 })) return "Heading 1";
    if (editor.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor.isActive("heading", { level: 3 })) return "Heading 3";
    return "Paragraph";
  };

  // ─── Counts ───────────────────────────────────────────────────────────────

  const charCount = editor?.storage.characterCount?.characters?.() ?? 0;
  const wordCount = editor?.storage.characterCount?.words?.() ?? 0;
  const charLimitReached = maxChars ? charCount >= maxChars : false;

  if (!editor) return null;

  return (
    <TooltipProvider delayDuration={400}>
      <div className="rte-root flex flex-col bg-[#f5f0e8] border border-[#e0d4c0] rounded-2xl shadow-sm overflow-hidden w-full">
        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-0.5 px-4 py-2 border-b border-[#d9cfc0] bg-[#ede8df]/95 backdrop-blur-sm sticky top-0 z-10">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              tooltip="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              tooltip="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          {/* Heading Dropdown */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 px-2.5 text-xs font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 rounded-md"
                  >
                    <Type className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {activeHeadingLabel()}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="text-xs bg-stone-900 text-stone-100 border-stone-800"
              >
                Text style
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start" className="w-40 rounded-xl p-1">
              <DropdownMenuItem
                className="rounded-lg text-sm gap-2"
                onSelect={() => editor.chain().focus().setParagraph().run()}
              >
                <Pilcrow className="h-4 w-4 text-stone-400" />
                Paragraph
                {!editor.isActive("heading") && (
                  <Check className="h-3.5 w-3.5 ml-auto text-amber-600" />
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {([1, 2, 3] as const).map((level) => {
                const Icon =
                  level === 1 ? Heading1 : level === 2 ? Heading2 : Heading3;
                return (
                  <DropdownMenuItem
                    key={level}
                    className="rounded-lg text-sm gap-2"
                    onSelect={() =>
                      editor.chain().focus().toggleHeading({ level }).run()
                    }
                  >
                    <Icon className="h-4 w-4 text-stone-400" />
                    Heading {level}
                    {editor.isActive("heading", { level }) && (
                      <Check className="h-3.5 w-3.5 ml-auto text-amber-600" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <ToolbarSeparator />

          {/* Text Formatting */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              tooltip="Bold (Ctrl+B)"
            >
              <Bold className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              tooltip="Italic (Ctrl+I)"
            >
              <Italic className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              tooltip="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
              tooltip="Strikethrough"
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive("code")}
              tooltip="Inline code"
            >
              <Code className="h-3.5 w-3.5" />
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          {/* Text Color */}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200/60"
                  >
                    <Palette className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="text-xs bg-stone-900 text-stone-100 border-stone-800"
              >
                Text color
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-auto p-3 rounded-xl" align="start">
              <p className="text-xs font-semibold text-stone-400 mb-2 uppercase tracking-wide">
                Text Color
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {TEXT_COLORS.map(({ color, label }) => (
                  <Tooltip key={color}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() =>
                          color === "inherit"
                            ? editor.chain().focus().unsetColor().run()
                            : editor.chain().focus().setColor(color).run()
                        }
                        className={cn(
                          "h-7 w-7 rounded-lg border-2 transition-transform hover:scale-110 active:scale-95",
                          editor.isActive("textStyle", { color })
                            ? "border-amber-500"
                            : "border-stone-200"
                        )}
                        style={{
                          backgroundColor:
                            color === "inherit" ? "transparent" : color,
                        }}
                        aria-label={label}
                      >
                        {color === "inherit" && (
                          <X className="h-3.5 w-3.5 text-stone-400 mx-auto" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {label}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Highlight */}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 w-8 p-0 rounded-md transition-all duration-150 text-stone-500 hover:text-stone-800 hover:bg-stone-200/60",
                      editor.isActive("highlight") &&
                        "bg-amber-100 text-amber-700"
                    )}
                  >
                    <Highlighter className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="text-xs bg-stone-900 text-stone-100 border-stone-800"
              >
                Highlight
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-auto p-3 rounded-xl" align="start">
              <p className="text-xs font-semibold text-stone-400 mb-2 uppercase tracking-wide">
                Highlight
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {HIGHLIGHT_COLORS.map(({ color, label }) => (
                  <Tooltip key={color}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() =>
                          color === "transparent"
                            ? editor.chain().focus().unsetHighlight().run()
                            : editor
                                .chain()
                                .focus()
                                .setHighlight({ color })
                                .run()
                        }
                        className={cn(
                          "h-7 w-7 rounded-lg border-2 transition-transform hover:scale-110 active:scale-95",
                          editor.isActive("highlight", { color })
                            ? "border-amber-500"
                            : "border-stone-200"
                        )}
                        style={{
                          backgroundColor:
                            color === "transparent" ? "transparent" : color,
                        }}
                        aria-label={label}
                      >
                        {color === "transparent" && (
                          <X className="h-3.5 w-3.5 text-stone-400 mx-auto" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      {label}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <ToolbarSeparator />

          {/* Alignment */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              isActive={editor.isActive({ textAlign: "left" })}
              tooltip="Align left"
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              isActive={editor.isActive({ textAlign: "center" })}
              tooltip="Center"
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              isActive={editor.isActive({ textAlign: "right" })}
              tooltip="Align right"
            >
              <AlignRight className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
              isActive={editor.isActive({ textAlign: "justify" })}
              tooltip="Justify"
            >
              <AlignJustify className="h-3.5 w-3.5" />
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          {/* Lists */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              tooltip="Bullet list"
            >
              <List className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              tooltip="Numbered list"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              isActive={editor.isActive("taskList")}
              tooltip="Task list"
            >
              <ListChecks className="h-3.5 w-3.5" />
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          {/* Blocks */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
              tooltip="Blockquote"
            >
              <Quote className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive("codeBlock")}
              tooltip="Code block"
            >
              <Code2 className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              isActive={false}
              tooltip="Divider"
            >
              <Minus className="h-3.5 w-3.5" />
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          {/* Link */}
          <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Toggle
                    size="sm"
                    pressed={editor.isActive("link")}
                    onPressedChange={openLinkPopover}
                    className="h-8 w-8 p-0 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 data-[state=on]:bg-amber-100 data-[state=on]:text-amber-700"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                  </Toggle>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="text-xs bg-stone-900 text-stone-100 border-stone-800"
              >
                Insert link
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-72 p-3 rounded-xl" align="start">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
                Insert Link
              </p>
              <div className="space-y-2">
                <Input
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyLink()}
                  className="rounded-lg text-sm h-8"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={applyLink}
                    className="flex-1 h-8 rounded-lg text-xs bg-stone-900 hover:bg-stone-700 text-white"
                  >
                    Apply
                  </Button>
                  {editor.isActive("link") && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={removeLink}
                      className="h-8 rounded-lg text-xs px-3"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Image */}
          <Popover open={imagePopoverOpen} onOpenChange={setImagePopoverOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200/60"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="text-xs bg-stone-900 text-stone-100 border-stone-800"
              >
                Insert image
              </TooltipContent>
            </Tooltip>
            <PopoverContent className="w-72 p-3 rounded-xl" align="start">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">
                Insert Image
              </p>
              <div className="space-y-2">
                <Input
                  placeholder="https://example.com/image.png"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="rounded-lg text-sm h-8"
                  autoFocus
                />
                <Input
                  placeholder="Alt text (optional)"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyImage()}
                  className="rounded-lg text-sm h-8"
                />
                <Button
                  size="sm"
                  onClick={applyImage}
                  disabled={!imageUrl}
                  className="w-full h-8 rounded-lg text-xs bg-stone-900 hover:bg-stone-700 text-white"
                >
                  Insert Image
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Table */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={insertTable}
                className="h-8 w-8 p-0 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200/60"
              >
                <TableIcon className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="text-xs bg-stone-900 text-stone-100 border-stone-800"
            >
              Insert table
            </TooltipContent>
          </Tooltip>

          <ToolbarSeparator />

          {/* Sub / Super */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              isActive={editor.isActive("subscript")}
              tooltip="Subscript"
            >
              <SubIcon className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              isActive={editor.isActive("superscript")}
              tooltip="Superscript"
            >
              <SupIcon className="h-3.5 w-3.5" />
            </ToolbarButton>
          </div>
        </div>

        {/* ── Table context toolbar ── */}
        {editor.isActive("table") && (
          <div className="flex flex-wrap items-center gap-1 px-4 py-1.5 border-b border-amber-100 bg-amber-50/60">
            <span className="text-xs font-semibold text-amber-700/70 mr-1 uppercase tracking-wide">
              Table
            </span>
            {[
              {
                label: "Add col before",
                fn: () => editor.chain().focus().addColumnBefore().run(),
              },
              {
                label: "Add col after",
                fn: () => editor.chain().focus().addColumnAfter().run(),
              },
              {
                label: "Del col",
                fn: () => editor.chain().focus().deleteColumn().run(),
              },
              {
                label: "Add row before",
                fn: () => editor.chain().focus().addRowBefore().run(),
              },
              {
                label: "Add row after",
                fn: () => editor.chain().focus().addRowAfter().run(),
              },
              {
                label: "Del row",
                fn: () => editor.chain().focus().deleteRow().run(),
              },
              {
                label: "Del table",
                fn: () => editor.chain().focus().deleteTable().run(),
              },
            ].map(({ label, fn }) => (
              <Button
                key={label}
                variant="ghost"
                size="sm"
                type="button"
                onClick={fn}
                className="h-6 px-2 text-xs rounded-md text-amber-700 hover:bg-amber-100"
              >
                {label}
              </Button>
            ))}
          </div>
        )}

        {/* ── Editor area ── */}
        <EditorContent
          editor={editor}
          className="rte-content flex-1 overflow-y-auto px-8 py-6 md:px-16 lg:px-24"
          style={{ minHeight }}
        />

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-2.5 border-t border-[#d9cfc0] bg-[#ede8df]/80">
          <div className="flex items-center gap-3 text-xs text-stone-400 font-medium">
            <span>
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>
            <span className="text-stone-300">·</span>
            <span
              className={cn(charLimitReached && "text-red-500 font-semibold")}
            >
              {charCount}
              {maxChars ? ` / ${maxChars}` : " chars"}
            </span>
          </div>
          {maxChars && (
            <div className="h-1 w-28 bg-stone-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  charCount / maxChars > 0.9 ? "bg-red-400" : "bg-amber-400"
                )}
                style={{
                  width: `${Math.min((charCount / maxChars) * 100, 100)}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
