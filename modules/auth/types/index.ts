/**
 * Auth wire shapes for the LMS portal. Mirrors the `smarthub-api` User
 * projection plus the sealed login/invitation contracts. During the
 * UI-first/mock phase only the projection is seeded; the login/reset/
 * invitation *flows* land with Plan 012. The types are defined now so
 * every consumer compiles against the sealed contract.
 */

export interface AuthUser {
  _id: string;
  email: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  imageUrl?: string;
  phone?: string;
  gender?: "Male" | "Female";
  country?: { isoCode?: string; name?: string } | string;
  state?: { isoCode?: string; name?: string } | string;
  city?: string;
  address?: string;
  createdAt?: string;
  isVerified?: boolean;
  roles?: string[];
  isITStudent?: boolean;
  itVerificationStatus?: string;
  siwesYear?: number;
  institution?: string;
  department?: string;
  studentCode?: string;
  jobTitle?: string;
  bio?: string;
  altPhone?: string;
  timeZone?: string;
  lmsRole?: "student" | "instructor" | "both" | null;
  referralEligible?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export type InvitationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "expired";

export interface VerifyInvitationResponse {
  code: string;
  email: string;
  status: InvitationStatus;
  token?: string;
}

export interface AcceptInvitationPayload {
  inviteCode: string;
  token: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}
