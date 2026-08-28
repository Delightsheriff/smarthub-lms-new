import type { Assignment } from "@/modules/assignments/types";
import type { ContentLink } from "@/types/content-link";

/**
 * UI-shaped module content (recordings / materials / a module's lane).
 * These mirror what the source screens already consume when data came
 * from mocks — small shapes kept decoupled from the verbose wire types.
 */

export interface Recording {
  id: string;
  title: string;
  description?: string;
  durationLabel: string;
  publishedAt: string;
  watched: boolean;
  videoUrl?: string;
  /** Always populated by the normaliser. */
  links: ContentLink[];
  /** Tutor withheld this recording from this student in this cohort. */
  isLocked: boolean;
}

export interface Material {
  id: string;
  title: string;
  description?: string;
  type: "pdf" | "slide" | "exercise" | "link";
  size?: string;
  fileUrl?: string;
  /** Always populated by the normaliser. */
  links: ContentLink[];
  /** Precise mime / extension hint from our own storage. */
  fileType?: string;
  /** Admin-chosen category (guide / presentation / exercise / reference). */
  category?: string;
}

export interface ContentCourseRef {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface ContentModuleRef {
  id: string;
  title: string;
  slug: string;
  order?: number;
}

export interface RecordingWithContext {
  course: ContentCourseRef;
  module: ContentModuleRef;
  recording: Recording;
}

export interface MaterialWithContext {
  course: ContentCourseRef;
  module: ContentModuleRef;
  material: Material;
}

export type ModuleCohortStatus =
  | "not-started"
  | "in-progress"
  | "completed";

export interface Module {
  id: string;
  slug: string;
  courseId: string;
  order: number;
  title: string;
  summary: string;
  learningObjectives?: string[];
  estimatedDuration?: number;
  cohortStatus?: ModuleCohortStatus;
  cohortStartedAt?: string | null;
  cohortCompletedAt?: string | null;
  recordings: Recording[];
  materials: Material[];
  assignments: Assignment[];
}

export type {
  ApiRecording,
  ApiMaterial,
  ApiAssignment,
} from "./api.types";
