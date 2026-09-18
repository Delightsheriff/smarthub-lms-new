// @vitest-environment happy-dom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";

afterEach(cleanup);
import { useState } from "react";
import { SegmentedControl, type SegmentedControlItem } from "@/components/ui/segmented-control";

const items: SegmentedControlItem<"student" | "instructor">[] = [
  { value: "student", label: "Student" },
  { value: "instructor", label: "Instructor" },
];

function ControlledSegmentedControl({
  initial = "student",
  onChange,
  hideLabelsBelowSm,
}: {
  initial?: "student" | "instructor";
  onChange?: (val: "student" | "instructor") => void;
  hideLabelsBelowSm?: boolean;
}) {
  const [val, setVal] = useState<"student" | "instructor">(initial);
  return (
    <SegmentedControl
      ariaLabel="Role switch"
      items={items}
      value={val}
      hideLabelsBelowSm={hideLabelsBelowSm}
      onChange={(next) => {
        setVal(next);
        onChange?.(next);
      }}
    />
  );
}

describe("SegmentedControl", () => {
  it("renders items with active item marked aria-selected='true' and inactive as 'false'", () => {
    render(<ControlledSegmentedControl initial="student" />);
    const studentTab = screen.getByRole("tab", { name: /student/i });
    const instructorTab = screen.getByRole("tab", { name: /instructor/i });

    expect(studentTab.getAttribute("aria-selected")).toBe("true");
    expect(instructorTab.getAttribute("aria-selected")).toBe("false");
  });

  it("fires onChange and flips aria-selected when an inactive item is clicked", () => {
    const handleChange = vi.fn();
    render(<ControlledSegmentedControl initial="student" onChange={handleChange} />);

    const instructorTab = screen.getByRole("tab", { name: /instructor/i });
    fireEvent.click(instructorTab);

    expect(handleChange).toHaveBeenCalledWith("instructor");

    const studentTab = screen.getByRole("tab", { name: /student/i });
    expect(instructorTab.getAttribute("aria-selected")).toBe("true");
    expect(studentTab.getAttribute("aria-selected")).toBe("false");
  });

  it("renders labels inside an accessible span with responsive hiding class when hideLabelsBelowSm is true", () => {
    render(<ControlledSegmentedControl initial="student" hideLabelsBelowSm />);
    const studentTab = screen.getByRole("tab", { name: /student/i });
    const labelSpan = studentTab.querySelector("span:not(.bg-foreground)");
    expect(labelSpan).not.toBeNull();
    expect(labelSpan?.className).toContain("hidden sm:inline");
    expect(screen.getByRole("tab", { name: /student/i })).toBeDefined();
  });
});
