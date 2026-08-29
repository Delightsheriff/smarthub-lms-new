/**
 * Renders the *safe subset* of Markdown that Oreo's answers may contain —
 * headings, bold/italic, inline code, fenced code blocks, bullet + ordered
 * lists, pipe tables, and links (http(s) only). Everything else falls back
 * to plain text. React elements out; no HTML string ever hits the DOM.
 */

export type MdBlock =
  | { kind: "heading"; level: 1 | 2 | 3 | 4; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "code"; lang?: string; code: string }
  | { kind: "hr" };

const CODE_FENCE = /^```(\w*)\s*$/;

/** Split a markdown string into blocks, preserving order. */
export function parseMarkdown(md: string): MdBlock[] {
  const rawLines = md.replace(/\r\n/g, "\n").split("\n");
  const lines = rawLines.map((l) => l.trimEnd());
  const blocks: MdBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const fence = line.match(CODE_FENCE);
    if (fence) {
      const lang = fence[1] || undefined;
      i += 1;
      const codeLines: string[] = [];
      while (i < lines.length && !CODE_FENCE.test(lines[i])) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1; // skip closing fence
      blocks.push({ kind: "code", lang, code: codeLines.join("\n") });
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      blocks.push({
        kind: "heading",
        level: heading[1].length as 1 | 2 | 3 | 4,
        text: heading[2].trim(),
      });
      i += 1;
      continue;
    }

    if (/^\s*---+\s*$/.test(line)) {
      blocks.push({ kind: "hr" });
      i += 1;
      continue;
    }

    const listMatch = line.match(/^(\s*)([-*]|\d+[.)])\s+(.*)$/);
    if (listMatch && !listMatch[3].includes("|")) {
      const ordered = /\d/.test(listMatch[2]);
      const items: string[] = [];
      const indent = listMatch[1].length;
      while (
        i < lines.length &&
        (() => {
          const m = lines[i].match(/^(\s*)([-*]|\d+[.)])\s+(.*)$/);
          return m && m[1].length === indent && !m[3].includes("|");
        })()
      ) {
        const m = lines[i].match(/^(\s*)([-*]|\d+[.)])\s+(.*)$/)!;
        items.push(m[3].trim());
        i += 1;
      }
      blocks.push({ kind: "list", ordered, items });
      continue;
    }

    if (line.startsWith("|") && lines[i + 1]?.startsWith("|")) {
      const headers = splitTableRow(line);
      const sep = splitTableRow(lines[i + 1]);
      if (headers.length > 0 && sep.every((s) => /^:?-{1,}:?$/.test(s.trim()))) {
        i += 2;
        const rows: string[][] = [];
        while (i < lines.length && lines[i].startsWith("|")) {
          rows.push(splitTableRow(lines[i]));
          i += 1;
        }
        blocks.push({ kind: "table", headers, rows });
        continue;
      }
    }

    if (line.trim()) {
      blocks.push({ kind: "paragraph", text: line.trim() });
    }
    i += 1;
  }

  return blocks;
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
}

/** Inline tokens: **bold**, *italic*, `code`, [link](url), plain text. */
export type InlineToken =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "italic"; text: string }
  | { type: "code"; text: string }
  | { type: "link"; text: string; url: string };

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/;

/** Tokenise a single inline string. Links whose URL isn't http(s) are
 *  dropped back to plain text — Oreo never emits `javascript:` and we
 *  refuse to open it for anyone who sneaks it in. */
export function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let rest = text;

  while (rest.length > 0) {
    const link = rest.match(LINK_RE);
    if (link && /^https?:\/\//i.test(link[2])) {
      if (link.index !== undefined && link.index > 0) {
        tokens.push(...tokenizeKeystrokes(rest.slice(0, link.index)));
      }
      tokens.push({ type: "link", text: link[1], url: link[2] });
      rest = rest.slice((link.index ?? 0) + link[0].length);
      continue;
    }
    const code = rest.match(/`([^`]+)`/);
    if (code && code.index !== undefined) {
      if (code.index > 0) {
        tokens.push(...tokenizeKeystrokes(rest.slice(0, code.index)));
      }
      tokens.push({ type: "code", text: code[1] });
      rest = rest.slice(code.index + code[0].length);
      continue;
    }
    tokens.push(...tokenizeKeystrokes(rest));
    rest = "";
  }
  return tokens;
}

/** Bold/italic/plain within a run. */
function tokenizeKeystrokes(text: string): InlineToken[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return { type: "bold", text: part.slice(2, -2) };
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return { type: "italic", text: part.slice(1, -1) };
    }
    return { type: "text", text: part };
  });
}