import type { AuthUser } from "@/types/auth";

/**
 * Maps a raw smarthub-api user document to the app's AuthUser shape.
 * Deliberately NOT in store/slices/authStore.ts (a "use client" file,
 * for the Zustand hook it also exports) — auth.ts calls this
 * server-side inside NextAuth's `authorize()`, and a plain function
 * imported from a "use client" module becomes an opaque client
 * reference across that boundary; calling it throws "Attempted to
 * call toAuthUser() from the server but toAuthUser is on the client."
 * This file has no "use client" directive, so it's safely callable
 * from both sides — `authStore.ts` re-exports it for its existing
 * client-side importers.
 */
export function toAuthUser(u: {
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
  birthDay?: number;
  birthMonth?: number;
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
}): AuthUser {
  const roles = u.roles || [];
  const isStudent = roles.includes("student") || roles.includes("student_free");
  const isInstructor = roles.includes("instructor") || roles.includes("lead") || roles.includes("co-instructor");

  const derivedRole: "student" | "instructor" | "both" =
    isStudent && isInstructor
      ? "both"
      : isStudent
        ? "student"
        : isInstructor
          ? "instructor"
          : "student";

  return {
    _id: u._id,
    email: u.email,
    firstName: u.firstName,
    middleName: u.middleName,
    lastName: u.lastName,
    imageUrl: u.imageUrl,
    phone: u.phone,
    roles: u.roles,
    isVerified: u.isVerified,
    gender: u.gender,
    birthDay: u.birthDay,
    birthMonth: u.birthMonth,
    country: u.country,
    state: u.state,
    city: u.city,
    address: u.address,
    createdAt: u.createdAt,
    isITStudent: u.isITStudent,
    itVerificationStatus: u.itVerificationStatus,
    siwesYear: u.siwesYear,
    institution: u.institution,
    department: u.department,
    studentCode: u.studentCode,
    jobTitle: u.jobTitle,
    bio: u.bio,
    altPhone: u.altPhone,
    timeZone: u.timeZone,
    lmsRole: u.lmsRole !== undefined ? u.lmsRole : derivedRole,
    referralEligible: u.referralEligible !== undefined ? u.referralEligible : true,
  };
}
