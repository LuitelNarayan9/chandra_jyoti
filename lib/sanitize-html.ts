import sanitizeHtmlLib, { type IOptions } from "sanitize-html";

/**
 * Shared HTML sanitizer for user-generated rich text.
 *
 * IMPORTANT:
 * - Prefer persisting sanitized content to reduce stored-XSS risk.
 * - Also sanitize/normalize at render boundaries as a defense-in-depth measure.
 */
export function sanitizeRichTextHtml(input: string): string {
  const options: IOptions = {
    // Keep a conservative allowlist that matches what the editor/viewer supports.
    allowedTags: [
      "p",
      "br",
      "blockquote",
      "hr",
      "pre",
      "code",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "span",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "a",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "class"],
      img: ["src", "alt", "title", "width", "height", "class"],
      span: ["style", "class"],
      p: ["style", "class"],
      h1: ["style", "class"],
      h2: ["style", "class"],
      h3: ["style", "class"],
      table: ["class"],
      thead: ["class"],
      tbody: ["class"],
      tr: ["class"],
      th: ["colspan", "rowspan", "class"],
      td: ["colspan", "rowspan", "class"],
      code: ["class"],
      pre: ["class"],
      ul: ["class"],
      ol: ["class"],
      li: ["class"],
      blockquote: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https"],
    },
    allowProtocolRelative: false,
    // Hardening: strip anything we didn't allow.
    disallowedTagsMode: "discard",
    // Ensure links cannot inject JS via weird hrefs.
    transformTags: {
      a: (tagName: string, attribs: Record<string, string>) => {
        const href = attribs.href ?? "";

        return {
          tagName,
          attribs: {
            ...attribs,
            href,
            rel: "noopener noreferrer",
            target: "_blank",
          },
        };
      },
    },
    // Restrict inline styles. Tiptap uses inline styles for text-align/color.
    allowedStyles: {
      "*": {
        // Tiptap text align extension
        "text-align": [/^left$/, /^right$/, /^center$/, /^justify$/],
        // Tiptap color/highlight extensions
        color: [
          /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
        ],
        "background-color": [
          /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/,
        ],
      },
      img: {
        width: [/^\d+(px)?$/],
        height: [/^\d+(px)?$/],
      },
    },
  };

  return sanitizeHtmlLib(input, options);
}
