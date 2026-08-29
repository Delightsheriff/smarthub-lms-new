import { describe, expect, it } from "vitest";
import { groupByCategory } from "@/modules/help/api/help.queries";
import type { ApiHelpResource } from "@/modules/help/types/api.types";

const res = (
  _id: string,
  category: string,
  order: number,
): ApiHelpResource => ({
  _id,
  title: _id,
  type: "document",
  url: `/mock/${_id}.pdf`,
  category,
  audience: "all",
  order,
  createdAt: "2026-08-01",
});

describe("groupByCategory", () => {
  it("groups in first-seen category order, preserving per-category order", () => {
    const groups = groupByCategory([
      res("h5", "Teaching tools", 1),
      res("h1", "Getting started", 1),
      res("h2", "Getting started", 2),
      res("h6", "Teaching tools", 2),
    ]);
    expect(groups.map((g) => g.name)).toEqual([
      "Teaching tools",
      "Getting started",
    ]);
    expect(groups[1].resources.map((r) => r._id)).toEqual(["h1", "h2"]);
  });

  it("is empty for an empty feed", () => {
    expect(groupByCategory([])).toEqual([]);
  });
});