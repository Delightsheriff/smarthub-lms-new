export type AchievementIcon =
  | "rocket"
  | "check-circle"
  | "flame"
  | "medal"
  | "trophy"
  | "sparkles"
  | "star";

export interface Achievement {
  type: string;
  label: string;
  description: string;
  icon: AchievementIcon;
  tone: "primary" | "accent" | "emerald" | "blue" | "amber" | "violet";
  earned: boolean;
  awardedAt?: string;
}

export interface ProgressPulse {
  earnedCount: number;
  totalCount: number;
  nextMilestone?: string;
}
