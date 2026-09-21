import { describe, expect, it } from "vitest";
import { shouldDismissSheet } from "@/components/ui/sheet";

describe("shouldDismissSheet", () => {
  it("dismisses after crossing the projected distance threshold", () => {
    expect(shouldDismissSheet({ distance: 139, velocity: 0, size: 400 })).toBe(false);
    expect(shouldDismissSheet({ distance: 141, velocity: 0, size: 400 })).toBe(true);
  });

  it("dismisses a quick flick before the distance threshold", () => {
    expect(shouldDismissSheet({ distance: 20, velocity: 0.12, size: 400 })).toBe(true);
  });

  it("does not dismiss a short slow drag", () => {
    expect(shouldDismissSheet({ distance: 80, velocity: 0.05, size: 400 })).toBe(false);
  });
});
