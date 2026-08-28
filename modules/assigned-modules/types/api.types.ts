import type {
  ApiMaterial,
  ApiRecording,
} from "@/modules/learning/types/api.types";

/** Assignments here are surfaced read-only — standalone modules have
 *  no course slug, so there's no submission route to link to. */
export interface ApiAssignedAssignment {
  _id: string;
  title: string;
  description?: string;
  module: string;
  dueDate?: string;
  totalPoints?: number;
  type?: string;
}

export interface ApiAssignedModule {
  _id: string;
  title: string;
  titleSlug?: string;
  description?: string;
  estimatedDuration?: string;
  learningObjectives: string[];
  /** When the instructor granted this module to the student. */
  assignedAt: string;
  /** Optional instructor note attached to the grant. */
  note?: string;
  recordings: ApiRecording[];
  materials: ApiMaterial[];
  assignments: ApiAssignedAssignment[];
}
