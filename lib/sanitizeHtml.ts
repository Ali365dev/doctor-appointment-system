import "server-only";
import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "s", "u",
  "ul", "ol", "li", "a", "h2", "h3", "h4", "blockquote",
];

const ALLOWED_ATTRIBUTES = {
  a: ["href", "target", "rel"],
};

/**
 * Sanitizes rich-text HTML produced by the admin Tiptap editor before it's
 * persisted, stripping anything beyond the editor's own output (scripts,
 * event handlers, iframes, etc.) so stored content is always safe to render
 * with `dangerouslySetInnerHTML` on the public site.
 */
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
    },
  }).trim();
}
