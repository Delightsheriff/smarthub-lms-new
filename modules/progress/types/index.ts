/**
 * UI shapes for the LMS gamification surface.
 */

export type AchievementTone =
  | "primary"
  | "accent"
  | "emerald"
  | "blue"
  | "amber"
  | "violet";

export type AchievementIcon =
  | "rocket"
  | "check-circle"
  | "flame"
  | "medal"
  | "trophy"
  | "sparkles"
  | "star";

export interface ProgressSnapshot {
  totalSubmissions: number;
  onTimeSubmissions: number;
  onTimePct: number | null;
  currentStreak: number;
  masteryAvgPct: number | null;
  pendingAssignments: number;
  gradedCount: number;
}

export interface Achievement {
  type: string;
  label: string;
  description: string;
  icon: AchievementIcon;
  tone: AchievementTone;
  cohortScoped: boolean;
  earned: boolean;
  awardedAt?: string;
  meta?: Record<string, unknown>;
}

export interface CohortPulse {
  scheduleId: string;
  courseId: string;
  courseName?: string;
  cohortSize: number;
  publishedAssignments: number;
  submissionsThisWeek: number;
  latestSubmissionPct: number | null;
  cohortAvgGradePct: number | null;
}
