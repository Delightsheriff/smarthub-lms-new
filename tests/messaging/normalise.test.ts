import { describe, expect, it } from "vitest";
import { normaliseMessage } from "@/modules/messaging/api/normalise";
import type { ApiMessage } from "@/modules/messaging/types/api.types";

describe("normaliseMessage", () => {
  it("computes mine = true for messages sent by the current auth user", () => {
    const wire: ApiMessage = {
      _id: "msg_1",
      conversationId: "conv_1",
      sender: { _id: "usr_1", firstName: "Ade", lastName: "Balogun" },
      content: "Here is my updated work.",
      createdAt: "2026-09-01T10:00:00.000Z",
    };

    const ui = normaliseMessage(wire, "usr_1");

    expect(ui.mine).toBe(true);
    expect(ui.senderId).toBe("usr_1");
    expect(ui.senderName).toBe("You");
    expect(ui.content).toBe("Here is my updated work.");
  });

  it("computes mine = false and parses sender name for peer senders", () => {
    const wire: ApiMessage = {
      _id: "msg_2",
      conversationId: "conv_1",
      sender: { _id: "usr_2", firstName: "Ngozi", lastName: "Okonkwo" },
      content: "Reviewed and approved!",
      createdAt: "2026-09-01T10:05:00.000Z",
    };

    const ui = normaliseMessage(wire, "usr_1");

    expect(ui.mine).toBe(false);
    expect(ui.senderId).toBe("usr_2");
    expect(ui.senderName).toBe("Ngozi Okonkwo");
  });
});
