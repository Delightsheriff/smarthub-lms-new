import { describe, expect, it } from "vitest";
import { filterContent, recordingKindOf } from "@/modules/learning/utils/content-filter";

type Row = { title: string; note?: string };
const rows: Row[] = [
  { title: "S3_Pandas joins", note: "live" },
  { title: "L28-Intro to SQL" },
  { title: "Window functions", note: "advanced sql" },
];
const opts = {
  getTitle: (r: Row) => r.title,
  getSubtitle: (r: Row) => r.note,
  getKind: (r: Row) => recordingKindOf(r.title),
};
const base = { query: "", kind: "all" as const, direction: "default" as const };

describe("recordingKindOf", () => {
  it("treats S<n> prefixes as live classes", () => {
    expect(recordingKindOf("S3_Pandas")).toBe("live");
    expect(recordingKindOf(" s 12 - review")).toBe("live");
    expect(recordingKindOf("L28-Intro")).toBe("recorded");
    expect(recordingKindOf(undefined)).toBe("recorded");
  });
});

describe("filterContent", () => {
  it("searches title and subtitle, case-insensitively", () => {
    expect(filterContent(rows, opts, { ...base, query: "SQL" }).map((r) => r.title)).toEqual([
      "L28-Intro to SQL",
      "Window functions",
    ]);
  });

  it("filters by kind", () => {
    expect(filterContent(rows, opts, { ...base, kind: "live" })).toHaveLength(1);
    expect(filterContent(rows, opts, { ...base, kind: "recorded" })).toHaveLength(2);
  });

  it("reverses without mutating the source", () => {
    const out = filterContent(rows, opts, { ...base, direction: "reversed" });
    expect(out[0].title).toBe("Window functions");
    expect(rows[0].title).toBe("S3_Pandas joins");
  });
});
