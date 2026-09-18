// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

afterEach(cleanup);
import { IndexRow } from "@/components/ui/index-list";

describe("IndexRow accessibility", () => {
  it("hides padded visual index from screen readers while providing semantic sr-only index text", () => {
    render(<IndexRow index={1} title="UI Design Systems" href="/courses/ui-design" />);

    // The visual padded number should be aria-hidden
    const visualIndex = screen.getByText("01");
    expect(visualIndex.getAttribute("aria-hidden")).toBe("true");

    // The screen-reader-only element should be present with natural numbering
    const srText = screen.getByText("1.");
    expect(srText.className).toContain("sr-only");

    // Link is accessible by its title
    const link = screen.getByRole("link", { name: /UI Design Systems/i });
    expect(link).toBeDefined();
    expect(link.className).toContain("focus-visible:ring-ring");
  });
});
