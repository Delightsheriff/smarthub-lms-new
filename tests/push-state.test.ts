import { describe, expect, it } from "vitest";
import {
  classifyPushEnvironment,
  isPromptSnoozed,
  PUSH_PROMPT_SNOOZE_MS,
  type PushEnvironment,
} from "@/modules/push/lib/push-state";

const env = (over: Partial<PushEnvironment> = {}): PushEnvironment => ({
  supported: true,
  ios: false,
  standalone: false,
  permission: "default",
  ...over,
});

const config = { enabled: true, publicKey: "BKey" };

describe("classifyPushEnvironment", () => {
  it("offers the install path to an iOS Safari tab", () => {
    expect(classifyPushEnvironment(env({ supported: false, ios: true }), config)).toBe(
      "needs-install",
    );
  });

  it("is unsupported off iOS, or on iOS when already installed", () => {
    expect(classifyPushEnvironment(env({ supported: false }), config)).toBe("unsupported");
    expect(
      classifyPushEnvironment(env({ supported: false, ios: true, standalone: true }), config),
    ).toBe("unsupported");
  });

  it("is disabled when the server has no key or push is off", () => {
    expect(classifyPushEnvironment(env(), undefined)).toBe("disabled");
    expect(classifyPushEnvironment(env(), { enabled: false, publicKey: "k" })).toBe("disabled");
    expect(classifyPushEnvironment(env(), { enabled: true, publicKey: null })).toBe("disabled");
  });

  it("maps the browser permission", () => {
    expect(classifyPushEnvironment(env({ permission: "denied" }), config)).toBe("denied");
    expect(classifyPushEnvironment(env({ permission: "default" }), config)).toBe("prompt");
    expect(classifyPushEnvironment(env({ permission: "granted" }), config)).toBe(
      "check-subscription",
    );
  });
});

describe("isPromptSnoozed", () => {
  const now = 1_700_000_000_000;

  it("is not snoozed with no stored dismissal", () => {
    expect(isPromptSnoozed(null, now)).toBe(false);
    expect(isPromptSnoozed("garbage", now)).toBe(false);
  });

  it("honours a dismissal for 30 days", () => {
    expect(isPromptSnoozed(String(now - 1000), now)).toBe(true);
    expect(isPromptSnoozed(String(now - PUSH_PROMPT_SNOOZE_MS + 1), now)).toBe(true);
    expect(isPromptSnoozed(String(now - PUSH_PROMPT_SNOOZE_MS), now)).toBe(false);
  });
});
