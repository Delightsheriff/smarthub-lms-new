import { describe, expect, it } from "vitest";
import {
  parseMarkdown,
  tokenizeInline,
} from "@/modules/oreo/api/markdown";

describe("parseMarkdown", () => {
  it("parses headings at all four levels", () => {
    const blocks = parseMarkdown("# H1\n## H2\n### H3\n#### H4");
    expect(blocks.map((b) => b.kind)).toEqual([
      "heading",
      "heading",
      "heading",
      "heading",
    ]);
    const [h1] = blocks;
    expect(h1).toMatchObject({ kind: "heading", level: 1, text: "H1" });
  });

  it("parses a pipe table with a separator row", () => {
    const blocks = parseMarkdown(
      "| A | B |\n| --- | --- |\n| 1 | 2 |",
    );
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({
      kind: "table",
      headers: ["A", "B"],
      rows: [["1", "2"]],
    });
  });

  it("does not treat a bar-less row as an early table terminator", () => {
    const blocks = parseMarkdown("plain text\n\nstill text");
    expect(blocks.every((b) => b.kind === "paragraph")).toBe(true);
  });

  it("parses fenced code blocks and carries the language", () => {
    const blocks = parseMarkdown("```ts\nconst x = 1;\n```");
    expect(blocks).toEqual([
      { kind: "code", lang: "ts", code: "const x = 1;" },
    ]);
  });

  it("parses bullet and ordered lists", () => {
    const blocks = parseMarkdown("- one\n- two\n\n1. first\n2. second");
    expect(blocks.find((b) => b.kind === "list")).toMatchObject({
      kind: "list",
      ordered: false,
      items: ["one", "two"],
    });
    expect(
      blocks.find((b) => b.kind === "list" && b.ordered),
    ).toMatchObject({
      kind: "list",
      ordered: true,
      items: ["first", "second"],
    });
  });

  it("parses an hr from a lone dash run", () => {
    expect(parseMarkdown("---")).toEqual([{ kind: "hr" }]);
  });
});

describe("tokenizeInline", () => {
  it("splits bold, italic, code and plain text", () => {
    expect(tokenizeInline("a **bold** b")).toEqual([
      { type: "text", text: "a " },
      { type: "bold", text: "bold" },
      { type: "text", text: " b" },
    ]);
    expect(tokenizeInline("*em* and `x`")).toEqual([
      { type: "italic", text: "em" },
      { type: "text", text: " and " },
      { type: "code", text: "x" },
    ]);
  });

  it("keeps http(s) links and drops non-http ones to text", () => {
    expect(tokenizeInline("[site](https://x.com)")).toEqual([
      { type: "link", text: "site", url: "https://x.com" },
    ]);
    expect(tokenizeInline("[bad](javascript:alert(1))")).toEqual([
      { type: "text", text: "[bad](javascript:alert(1))" },
    ]);
  });
});