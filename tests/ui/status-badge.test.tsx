// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

afterEach(cleanup);
import { StatusBadge } from "@/components/ui/status-badge";
import { Check } from "lucide-react";

describe("StatusBadge", () => {
  it("renders a known status with registry label and tone variant class", () => {
    render(<StatusBadge status="graded" />);
    const badge = screen.getByText("Graded");
    expect(badge).toBeDefined();
    // "graded" tone is success -> bg-success/10 text-success
    expect(badge.className).toContain("text-success");
  });

  it("falls back to neutral tone and raw status string for unknown status", () => {
    render(<StatusBadge status="custom_unknown_status" />);
    const badge = screen.getByText("custom_unknown_status");
    expect(badge).toBeDefined();
    // neutral tone maps to outline variant
    expect(badge.className).toContain("border-border");
  });

  it("supports overriding the label while preserving resolved tone", () => {
    render(<StatusBadge status="defaulted" label="Needs review" />);
    const badge = screen.getByText("Needs review");
    expect(badge).toBeDefined();
    // "defaulted" tone is destructive -> text-destructive
    expect(badge.className).toContain("text-destructive");
  });

  it("renders qualified in the solid accent tone", () => {
    render(<StatusBadge status="qualified" />);
    const badge = screen.getByText("Qualified");
    expect(badge.className).toContain("bg-accent");
    expect(badge.className).toContain("text-accent-foreground");
  });

  it("renders an optional leading icon", () => {
    const { container } = render(<StatusBadge status="paid" icon={Check} />);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(screen.getByText("Paid")).toBeDefined();
  });
});
