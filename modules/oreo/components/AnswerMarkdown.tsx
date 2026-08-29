"use client";
import {
  type InlineToken,
  type MdBlock,
  parseMarkdown,
  tokenizeInline,
} from "../api/markdown";

/** Render a `<pre>`-style code run or inline code token. */
function Code({ code }: { code: string }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">
      {code}
    </code>
  );
}

/** Render the inline tokens of one line. Links only open http(s). */
function Inline({ text }: { text: string }) {
  const tokens: InlineToken[] = tokenizeInline(text);
  return (
    <>
      {tokens.map((t, i) => {
        switch (t.type) {
          case "bold":
            return <strong key={i}>{t.text}</strong>;
          case "italic":
            return <em key={i}>{t.text}</em>;
          case "code":
            return <Code key={i} code={t.text} />;
          case "link":
            return (
              <a
                key={i}
                href={t.url}
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-primary underline underline-offset-2"
              >
                {t.text}
              </a>
            );
          default:
            return <span key={i}>{t.text}</span>;
        }
      })}
    </>
  );
}

function Table({ block }: { block: Extract<MdBlock, { kind: "table" }> }) {
  return (
    <div className="overflow-x-auto">
      <table className="my-3 w-full border-collapse text-sm">
        <thead>
          <tr>
            {block.headers.map((h, i) => (
              <th
                key={i}
                className="border-b border-border px-3 py-1.5 text-left font-semibold"
              >
                <Inline text={h} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="border-b border-border/50 px-3 py-1.5 align-top text-muted-foreground"
                >
                  <Inline text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Renders the safe markdown subset Oreo answers with. Block-level only;
 *  the page wraps this in its own message bubble. */
export function AnswerMarkdown({ source }: { source: string }) {
  const blocks = parseMarkdown(source);
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "heading": {
            const Tag =
              block.level === 1
                ? "h4"
                : block.level === 2
                  ? "h5"
                  : "h6";
            return (
              <Tag key={i} className="font-semibold">
                <Inline text={block.text} />
              </Tag>
            );
          }
          case "paragraph":
            return (
              <p key={i}>
                <Inline text={block.text} />
              </p>
            );
          case "list":
            if (block.ordered) {
              return (
                <ol key={i} className="list-decimal space-y-1 pl-5">
                  {block.items.map((item, j) => (
                    <li key={j}>
                      <Inline text={item} />
                    </li>
                  ))}
                </ol>
              );
            }
            return (
              <ul key={i} className="list-disc space-y-1 pl-5">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Inline text={item} />
                  </li>
                ))}
              </ul>
            );
          case "table":
            return <Table key={i} block={block} />;
          case "code":
            return (
              <pre className="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-[0.85em]">
                {block.code}
              </pre>
            );
          case "hr":
            return <hr key={i} className="border-border" />;
        }
      })}
    </div>
  );
}