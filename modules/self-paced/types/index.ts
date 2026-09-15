import type { ApiVideoSourceKind } from "./api.types";

export interface SelfPacedProgress {
  totalLessons: number;
  completedLessons: number;
  percent: number;
}

export interface SelfPacedCertificate {
  refNumber: string;
  url?: string;
}

export interface SelfPacedCourseSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  grantedAt?: string;
  completedAt?: string;
  /** Most recent lesson completion; undefined before the first. */
  lastActivityAt?: string;
  certificate?: SelfPacedCertificate;
  progress: SelfPacedProgress;
  nextLesson?: { id: string; title: string };
}

export interface SelfPacedLesson {
  id: string;
  title: string;
  description: string;
  order: number;
  durationSeconds: number;
  durationMinutes: number;
  isPreview: boolean;
  completed: boolean;
  assetCount: number;
}

export interface SelfPacedCourse {
  id: string;
  name: string;
  slug: string;
  description: string;
  overview: string;
  imageUrl?: string;
  difficulty?: string;
  whatsappGroupUrl?: string;
  cohortTrack?: { name: string; slug: string };
  lessons: SelfPacedLesson[];
  faqs: CourseFaq[];
  progress: SelfPacedProgress;
  nextLessonId?: string;
  completedAt?: string;
  certificate?: SelfPacedCertificate;
}

export interface CourseFaq {
  id: string;
  question: string;
  answer: string;
}

export interface LessonAsset {
  label: string;
  url: string;
  format?: string;
}

export interface LessonPlayback {
  kind: ApiVideoSourceKind;
  /** Absolute, tokenised stream URL for direct files. */
  streamUrl?: string;
  /** Hosted-player reference (YouTube / Vimeo / Drive / other). */
  url?: string;
  /** Epoch ms the stream token lapses. */
  expiresAt?: number;
  assets: LessonAsset[];
}

export interface LessonCompletionResult {
  lessonId: string;
  completed: boolean;
  /** Undefined when the response didn't say (older API on unmark) —
   *  callers keep what they already know rather than read it as false. */
  courseCompleted?: boolean;
  progress: SelfPacedProgress;
}

export interface SelfPacedNudge {
  id: string;
  kind: string;
  title: string;
  message: string;
  /** In-app destination, already translated to a `/learn` route. */
  href?: string;
  course?: { id: string; name: string; slug?: string };
  sentAt?: string;
}

/** An upgrade credit that can still be used. */
export interface UpgradeCredit {
  orderId: string;
  itemName: string;
  expiresAt?: string;
  valueMinor: number;
  currency: string;
  anyCohort: boolean;
  eligibleTracks: { id: string; name?: string; slug?: string }[];
}

export interface PassState {
  active: boolean;
  expiresAt?: string;
  renewalEndsAt?: string;
  excludes: string[];
}

export type EntitlementDenial = "none" | "revoked" | "expired";
