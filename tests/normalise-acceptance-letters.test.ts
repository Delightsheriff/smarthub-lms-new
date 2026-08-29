import { describe, expect, it } from "vitest";
import {
  dedupeAcceptanceLetters,
  normaliseAcceptanceLetter,
} from "@/modules/acceptance-letters/api/normalise";
import type { ApiAcceptanceLetter } from "@/modules/acceptance-letters/types/api.types";

const wire: ApiAcceptanceLetter = {
  registrationId: "reg_siwes_1",
  url: "https://res.cloudinary.com/mock/raw/upload/v1/letters/unilag-letter",
  refNumber: "SIWES-2026-00123",
  issuedAt: "2026-08-01T10:00:00.000Z",
  courseName: "Full-Stack Web Development",
  institutionName: "University of Lagos",
  durationMonths: 6,
  durationEditable: true,
};

describe("normaliseAcceptanceLetter", () => {
  it("turns the ISO issuedAt string into a Date", () => {
    const l = normaliseAcceptanceLetter(wire);
    expect(l.issuedAt).toBeInstanceOf(Date);
    expect(l.issuedAt.toISOString()).toBe("2026-08-01T10:00:00.000Z");
  });

  it("passes through the wire fields", () => {
    const l = normaliseAcceptanceLetter(wire);
    expect(l.registrationId).toBe("reg_siwes_1");
    expect(l.refNumber).toBe("SIWES-2026-00123");
    expect(l.url).toBe(wire.url);
    expect(l.courseName).toBe("Full-Stack Web Development");
    expect(l.institutionName).toBe("University of Lagos");
    expect(l.durationMonths).toBe(6);
    expect(l.durationEditable).toBe(true);
  });

  it("survives a missing durationEditable (treated locked)", () => {
    const l = normaliseAcceptanceLetter({
      registrationId: wire.registrationId,
      url: wire.url,
      refNumber: wire.refNumber,
      issuedAt: wire.issuedAt,
      courseName: wire.courseName,
      institutionName: wire.institutionName,
      durationMonths: wire.durationMonths,
    });
    expect(l.durationEditable).toBeUndefined();
  });
});

describe("dedupeAcceptanceLetters", () => {
  it("collapses duplicate rows sharing a refNumber into one", () => {
    const dup: ApiAcceptanceLetter = {
      ...wire,
      registrationId: "reg_siwes_1_dup",
      courseName: "Python for AI & Data",
    };
    const rows = dedupeAcceptanceLetters([
      normaliseAcceptanceLetter(wire),
      normaliseAcceptanceLetter(dup),
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].refNumber).toBe("SIWES-2026-00123");
  });

  it("falls back to url when refNumber is blank", () => {
    const a = normaliseAcceptanceLetter({ ...wire, refNumber: "" });
    const b = normaliseAcceptanceLetter({
      ...wire,
      refNumber: "",
      registrationId: "reg_2",
      url: wire.url,
    });
    const rows = dedupeAcceptanceLetters([a, b]);
    expect(rows).toHaveLength(1);
  });

  it("falls back to registrationId last so nothing is dropped", () => {
    const a = normaliseAcceptanceLetter({
      ...wire,
      refNumber: "",
      url: "",
      registrationId: "reg_a",
    });
    const b = normaliseAcceptanceLetter({
      ...wire,
      refNumber: "",
      url: "",
      registrationId: "reg_b",
    });
    const rows = dedupeAcceptanceLetters([a, b]);
    expect(rows).toHaveLength(2);
  });

  it("keeps distinct letters with different refNumbers", () => {
    const other: ApiAcceptanceLetter = {
      ...wire,
      registrationId: "reg_siwes_2",
      url: "https://res.cloudinary.com/mock/raw/upload/v1/letters/yaba-letter",
      refNumber: "SIWES-2026-00089",
    };
    const rows = dedupeAcceptanceLetters([
      normaliseAcceptanceLetter(wire),
      normaliseAcceptanceLetter(other),
    ]);
    expect(rows).toHaveLength(2);
  });
});