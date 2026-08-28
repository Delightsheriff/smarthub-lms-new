import type { Material, Recording } from "@/modules/learning/types";

/** Read-only assignment row — no status, no link. */
export interface AssignedAssignment {
  id: string;
  title: string;
  description?: string;
  /** Pre-formatted due date, present only when the server set one. */
  dueLabel?: string;
  type?: string;
}

export interface AssignedModule {
  id: string;
  title: string;
  description?: string;
  /** Free-text hint from the admin (e.g. "2 hours"). */
  estimatedDuration?: string;
  learningObjectives: string[];
  assignedAt: string;
  note?: string;
  recordings: Recording[];
  materials: Material[];
  assignments: AssignedAssignment[];
}
