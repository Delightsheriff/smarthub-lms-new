/**
 * Auth wire shapes, re-exported from the `modules/auth` home so the
 * auth store and Foundation layers import a single stable projection.
 * Kept as a thin alias for backward compatibility.
 */
export type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  InvitationStatus,
  VerifyInvitationResponse,
  AcceptInvitationPayload,
} from "@/modules/auth/types";
