"use client";

import { useTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateCommentSchema,
  CreateCommentValues,
} from "@/lib/validations/comment";
import { addComment } from "@/lib/actions/comment.actions";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2, Send, Bold, Italic, Link2, Smile } from "lucide-react";
import { cn } from "@/lib/utils";

// Tiptap
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

// ─── Toolbar button helper ─────────────────────────────────────

function ToolbarBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-all duration-150 hover:scale-110 active:scale-95",
        active
          ? "bg-primary/15 text-primary shadow-sm shadow-primary/10"
          : "hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

// ─── Mini Tiptap Toolbar ─────────────────────────────────────

function MiniToolbar({ editor }: { editor: any }) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-0.5 px-3 py-2">
      <ToolbarBtn
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold"
      >
        <Bold className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <ToolbarBtn
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic"
      >
        <Italic className="h-3.5 w-3.5" />
      </ToolbarBtn>
      <div className="mx-1.5 h-4 w-px bg-border/60 rounded-full" />
      <ToolbarBtn
        active={editor.isActive("link")}
        onClick={() => {
          const url = window.prompt("Enter URL");
          if (url) {
            // Validate URL protocol to prevent XSS
            try {
              const parsed = new URL(url, window.location.origin);
              if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
                return; // Reject non-safe protocols
              }
              editor.chain().focus().setLink({ href: parsed.href }).run();
            } catch {
              // If URL parsing fails, try prepending https://
              try {
                const parsed = new URL(`https://${url}`);
                editor.chain().focus().setLink({ href: parsed.href }).run();
              } catch {
                // Invalid URL, ignore
              }
            }
          } else if (url === "") {
            editor.chain().focus().unsetLink().run();
          }
        }}
        title="Link"
      >
        <Link2 className="h-3.5 w-3.5" />
      </ToolbarBtn>
    </div>
  );
}

// ─── Component ──────────────────────────────────────────────

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  /** Called immediately on submit for optimistic UI; returns rollback function */
  onOptimisticAdd?: (htmlContent: string) => (() => void) | void;
}

export function CommentForm({
  postId,
  parentId,
  onSuccess,
  onCancel,
  autoFocus = false,
  onOptimisticAdd,
}: CommentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isFocused, setIsFocused] = useState(autoFocus);
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 5000;

  const form = useForm<CreateCommentValues>({
    resolver: zodResolver(CreateCommentSchema),
    defaultValues: { content: "", postId, parentId },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "rte-link",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Placeholder.configure({
        placeholder: parentId ? "Write a reply..." : "Share your thoughts...",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[90px] px-4 py-3 text-sm leading-relaxed text-foreground",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      form.setValue("content", html, { shouldValidate: true });
      setCharCount(text.length);
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    autofocus: autoFocus ? "end" : false,
    immediatelyRender: false,
  });

  const isEmpty = charCount === 0;
  const isOverLimit = charCount > MAX_CHARS;

  function onSubmit(values: CreateCommentValues) {
    const textContent = editor?.getText().trim();
    if (!textContent) {
      toast.error("Comment cannot be empty.");
      return;
    }
    if (isOverLimit) {
      toast.error(`Comment exceeds ${MAX_CHARS} character limit.`);
      return;
    }

    let rollback: (() => void) | void;
    if (!parentId && onOptimisticAdd) {
      rollback = onOptimisticAdd(values.content);
    }

    startTransition(async () => {
      try {
        const result = await addComment(values);
        if (result.success) {
          toast.success(result.message);
          editor?.commands.clearContent();
          form.reset();
          setCharCount(0);
          onSuccess?.();
        } else {
          rollback?.();
          toast.error(result.error);
        }
      } catch {
        rollback?.();
        toast.error("Something went wrong.");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="content"
          render={() => (
            <FormItem>
              <FormControl>
                {/* ── Editor shell ── */}
                <div
                  className={cn(
                    "relative overflow-hidden rounded-2xl border bg-background transition-all duration-300",
                    isFocused
                      ? "border-primary/50 shadow-[0_0_0_3px_hsl(var(--primary)/0.12),0_1px_6px_hsl(0_0%_0%/0.06)]"
                      : "border-border/50 shadow-sm hover:border-border/80 hover:shadow-md"
                  )}
                >
                  {/* Subtle gradient top edge when focused */}
                  <div
                    className={cn(
                      "absolute inset-x-0 top-0 h-[2px] rounded-t-2xl transition-opacity duration-300 bg-linear-to-r from-primary/60 via-primary to-primary/60",
                      isFocused ? "opacity-100" : "opacity-0"
                    )}
                  />

                  {/* Editor area */}
                  <div
                    className="max-h-[280px] overflow-y-auto"
                    onClick={() => editor?.commands.focus()}
                  >
                    <EditorContent editor={editor} />
                  </div>

                  {/* ── Bottom bar: toolbar + char count ── */}
                  <div className="flex items-center justify-between border-t border-border/30 bg-muted/20 px-1">
                    <MiniToolbar editor={editor} />

                    {/* Character counter */}
                    <div className="pr-3">
                      <span
                        className={cn(
                          "text-[10px] tabular-nums font-medium transition-colors",
                          charCount > MAX_CHARS * 0.9
                            ? "text-destructive"
                            : "text-muted-foreground/50"
                        )}
                      >
                        {charCount}/{MAX_CHARS}
                      </span>
                    </div>
                  </div>
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {/* ── Action row ── */}
        <div className="flex items-center justify-between">
          {/* Hint text */}
          <p className="hidden sm:block text-[11px] text-muted-foreground/50 italic pl-0.5">
            {isFocused ? "Markdown-style formatting supported" : ""}
          </p>

          <div className="flex items-center gap-2 ml-auto">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={isPending}
                className="h-8 px-3 text-xs font-medium text-muted-foreground hover:text-foreground rounded-xl transition-all duration-150"
              >
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              size="sm"
              disabled={isPending || isEmpty || isOverLimit}
              className={cn(
                "group h-8 px-4 text-xs font-semibold gap-2 rounded-xl transition-all duration-200",
                "shadow-sm hover:shadow-md active:scale-[0.97]",
                (isEmpty || isOverLimit) && "opacity-40 cursor-not-allowed"
              )}
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-150",
                    !isEmpty && !isPending && "group-hover:translate-x-0.5"
                  )}
                />
              )}
              {parentId ? "Reply" : "Post"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
