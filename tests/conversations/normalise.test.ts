import { describe, expect, it } from "vitest";
import { normaliseConversation } from "@/modules/conversations/api/normalise";
import type { ApiConversation } from "@/modules/conversations/types/api.types";

describe("normaliseConversation", () => {
  it("normalises direct conversation with peer name resolution", () => {
    const wire: ApiConversation = {
      _id: "conv_100",
      type: "direct",
      participants: [
        { _id: "usr_1", firstName: "Ade", lastName: "Balogun" },
        { _id: "usr_2", firstName: "Ngozi", lastName: "Okonkwo" },
      ],
      lastMessage: {
        _id: "msg_1",
        conversationId: "conv_100",
        sender: "usr_2",
        content: "Hello Ade!",
        createdAt: "2026-09-01T10:00:00.000Z",
      },
      unreadCount: { usr_1: 2 },
      updatedAt: "2026-09-01T10:00:00.000Z",
    };

    const ui = normaliseConversation(wire, "usr_1");

    expect(ui.id).toBe("conv_100");
    expect(ui.type).toBe("direct");
    expect(ui.otherName).toBe("Ngozi Okonkwo");
    expect(ui.title).toBe("Ngozi Okonkwo");
    expect(ui.unread).toBe(2);
    expect(ui.preview).toBe("Hello Ade!");
  });

  it("normalises assignment conversation with assignment chip metadata", () => {
    const wire: ApiConversation = {
      _id: "conv_200",
      type: "assignment",
      participants: [{ _id: "usr_1" }, { _id: "usr_2" }],
      unreadCount: 0,
      updatedAt: "2026-09-01T12:00:00.000Z",
      metadata: {
        assignmentId: { _id: "asgn_99", title: "Flexbox Layout Project" },
        courseId: { _id: "c_1", title: "Web Dev", slug: "web-dev" },
      },
    };

    const ui = normaliseConversation(wire, "usr_1");

    expect(ui.type).toBe("assignment");
    expect(ui.title).toBe("Flexbox Layout Project");
    expect(ui.assignment).toEqual({
      id: "asgn_99",
      title: "Flexbox Layout Project",
      courseSlug: "web-dev",
      moduleSlug: undefined,
    });
  });

  it("resolves unread count using real user ObjectId dictionary", () => {
    const realUserId = "64f8a123bc45de6789012345";
    const otherUserId = "64f8a123bc45de6789012399";
    const wire: ApiConversation = {
      _id: "conv_300",
      type: "direct",
      participants: [{ _id: realUserId }, { _id: otherUserId }],
      unreadCount: {
        [realUserId]: 5,
        [otherUserId]: 0,
      },
      updatedAt: "2026-09-01T15:00:00.000Z",
    };

    const ui = normaliseConversation(wire, realUserId);
    expect(ui.unread).toBe(5);
  });
});
