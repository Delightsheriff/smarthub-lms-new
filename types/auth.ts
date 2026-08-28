/**
 * The smarthub-api `User` projection the LMS actually uses. Real payload
 * has more fields (`isVerified`, `roles[]`, `phone`, etc.); we pick the
 * ones the UI renders, plus the ones the auth store needs to make
 * routing decisions. Server can grow without UI churn as long as these
 * stay backward-compatible.
 *
 * Mirrored from the legacy module; the live `/auth/me` projection lands
 * at Plan 012. During the UI-first/mock phase the store is seeded from
 * `lib/api/mock/mockDatabase.ts` users.
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
