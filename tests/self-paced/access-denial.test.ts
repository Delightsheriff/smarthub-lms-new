import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/api";
import {
  apiErrorCode,
  entitlementDenial,
  isNotFound,
  shouldRetry,
} from "@/modules/self-paced/lib/access-denial";

describe("access-denial", () => {
  it("extracts errorCode from ApiError", () => {
    const error = new ApiError("Forbidden", 403, { errorCode: "ENTITLEMENT_REVOKED" });
    expect(apiErrorCode(error)).toBe("ENTITLEMENT_REVOKED");
    expect(entitlementDenial(error)).toBe("revoked");
  });

  it("handles fallback text when errorCode is missing", () => {
    const error = new ApiError("Your access has expired", 403);
    expect(entitlementDenial(error)).toBe("expired");

    const defaultNone = new ApiError("No access found", 403);
    expect(entitlementDenial(defaultNone)).toBe("none");
  });

  it("returns null for non-403 errors", () => {
    const error = new ApiError("Not found", 404);
    expect(entitlementDenial(error)).toBeNull();
    expect(isNotFound(error)).toBe(true);
  });

  it("determines retry strategy correctly", () => {
    const authErr = new ApiError("Unauthorized", 401);
    expect(shouldRetry(0, authErr)).toBe(false);

    const notFound = new ApiError("Not found", 404);
    expect(shouldRetry(0, notFound)).toBe(false);

    const serverErr = new ApiError("Internal server error", 500);
    expect(shouldRetry(0, serverErr)).toBe(true);
    expect(shouldRetry(1, serverErr)).toBe(true);
    expect(shouldRetry(2, serverErr)).toBe(false);
  });
});
