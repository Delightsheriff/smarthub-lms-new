import { describe, expect, it, vi } from "vitest";

vi.mock("@/store/slices/authStore", () => ({ useAuthStore: vi.fn() }));

import { resolveSocketUrl } from "@/lib/socket/socket-provider";

describe("resolveSocketUrl", () => {
  it("prefers the explicit socket URL", () => {
    expect(
      resolveSocketUrl({
        NEXT_PUBLIC_SOCKET_URL: "https://ws.example.com",
        NEXT_PUBLIC_API_URL: "https://api.example.com/api/v1",
      }),
    ).toBe("https://ws.example.com");
  });

  it("uses the API origin in production-style config", () => {
    expect(resolveSocketUrl({ NEXT_PUBLIC_API_URL: "https://api.example.com/api/v1" })).toBe(
      "https://api.example.com",
    );
  });

  it("bypasses the dev /api-proxy rewrite and targets the API it proxies", () => {
    expect(resolveSocketUrl({ NEXT_PUBLIC_API_URL: "http://localhost:3000/api-proxy" })).toBe(
      "http://localhost:6001",
    );
  });
});
