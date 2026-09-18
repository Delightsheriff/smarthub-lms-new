"use client";
import DOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";

interface RichTextProps {
  /** HTML string. Stored upstream by Quill (admin) and arrives raw on
   *  course / module / assignment fields. We sanitize aggressively
   *  before injecting — admin authors are trusted but the chain
   *  stretches all the way back to user-controlled SIWES form input
   *  in some places, so DOMPurify is non-negotiable. */
  html?: string | null;
  className?: string;
}

/**
 * Render server-stored HTML safely. Use this anywhere course /
 * module / assignment description fields are surfaced — they're
 * Quill output (paragraphs, bold, italic, lists, links, etc.) and
 * `<p>{description}</p>` paints raw tags as text.
 *
 * Falls back to nothing when `html` is empty so callers can render
 * unconditionally without checking.
 */
export function RichText({ html, className }: RichTextProps) {
  if (!html) return null;

  // Tight allowlist — Quill's default toolbar produces bold/italic/
  // underline, headers, paragraphs, lists, blockquotes, code, links,
  // images, and basic alignment. Anything else is stripped.
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "a",
      "img",
      "div",
      "span",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title", "class"],
  });

  return (
    <div
      // Tailwind prose-y defaults so the output reads like body
      // copy, not like an HTML test page. Tight at the edges so
      // it slots into existing card layouts.
      className={cn(
        "text-sm leading-relaxed text-foreground/90 break-words [overflow-wrap:anywhere]",
        "[&_p]:mb-2 [&_p:last-child]:mb-0",
        "[&_strong]:font-semibold [&_b]:font-semibold",
        "[&_a]:text-primary [&_a]:underline-offset-2 [&_a:hover]:underline [&_a]:break-all",
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:break-all",
        "[&_pre]:overflow-x-auto [&_pre]:max-w-full [&_img]:max-w-full [&_img]:h-auto [&_table]:overflow-x-auto [&_table]:block",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
