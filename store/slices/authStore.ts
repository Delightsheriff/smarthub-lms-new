"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types/auth";

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
  const roles = u.roles || [];
  const isStudent = roles.includes("student") || roles.includes("student_free");
  const isInstructor = roles.includes("instructor") || roles.includes("lead") || roles.includes("co-instructor");

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
    lmsRole:
      isStudent && isInstructor
        ? "both"
        : isStudent
          ? "student"
          : isInstructor
            ? "instructor"
            : "student",
    referralEligible: true,
  };
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken?: string) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({
          user,
          token: token ?? null,
          isAuthenticated: true,
        }),
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "smarthub-lms-new.auth.v2",
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
);
