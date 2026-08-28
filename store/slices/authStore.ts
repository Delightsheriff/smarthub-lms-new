"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockUser } from "@/lib/api/mock/mockDatabase";
import type { AuthUser } from "@/types/auth";

/** Map a wire user to the AuthUser projection the UI consumes. */
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
}): AuthUser {
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
    // Mock user is both a student and an instructor — hand the UI a
    // dual-role account so the mode toggle + both nav surfaces work.
    lmsRole:
      u.roles?.includes("student") && u.roles.includes("instructor")
        ? "both"
        : u.roles?.includes("student")
          ? "student"
          : u.roles?.includes("instructor")
            ? "instructor"
            : null,
    referralEligible: true,
  };
}

const seedUser = () => toAuthUser(mockUser);

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** Set the current user (e.g. after a login mutation / /auth/me). */
  setAuth: (user: AuthUser, _accessToken?: string, _refreshToken?: string) => void;
  /** Update the cached user (e.g. after `/auth/me` refresh). */
  setUser: (user: AuthUser) => void;
  /** Clear store + tokens. Caller is responsible for the redirect. */
  logout: () => void;
  /** Restore the seeded mock identity (UI-first phase helper). */
  seedDemo: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: seedUser(),
      isAuthenticated: true,
      setAuth: (user) => set({ user, isAuthenticated: true }),
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      seedDemo: () => set({ user: seedUser(), isAuthenticated: true }),
    }),
    {
      name: "smarthub-lms-new.auth.v1",
      partialize: (s) => ({
        user: s.user,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
