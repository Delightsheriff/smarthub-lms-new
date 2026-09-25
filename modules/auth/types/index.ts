export interface AuthUser {
  _id: string;
  email: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  imageUrl?: string;
  phone?: string;
  roles?: string[];
  isVerified?: boolean;
  gender?: "Male" | "Female";
  country?: { isoCode?: string; name?: string } | string;
  state?: { isoCode?: string; name?: string } | string;
  city?: string;
  address?: string;
  createdAt?: string;
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
  password?: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export interface VerifyInvitationResponse {
  email: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  message?: string;
  expiresAt?: string;
  userExists?: boolean;
  status?: string;
  valid?: boolean;
}

export interface AcceptInvitationPayload {
  token: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
