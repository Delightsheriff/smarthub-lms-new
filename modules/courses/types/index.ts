/**
 * UI-friendly course shape consumed by every screen. The LMS keeps
 * these intentionally small; `api.types.ts` holds the verbose API
 * shapes and the `normalise.ts` helper converts between them.
 */
export interface Course {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
  /** 0–100 — already maps to enrollment.progress server-side. */
  progress: number;
  durationLabel: string;
  startDate: string; // ISO
  instructor: { id?: string; name: string; title: string };
  /** Full contactable instructor list (course detail only). */
  instructors?: CourseInstructor[];
  status: "in-progress" | "not-started" | "completed";
  mode?: string;
  courseKind?: string;
  /** Bought individual modules, not a full enrolment. */
  isModuleAddon?: boolean;
}

export interface CourseInstructor {
  id: string;
  name: string;
  title: string;
  imageUrl?: string;
  bio?: string;
  /** Shareable WhatsApp number, or null. */
  whatsapp?: string | null;
}

export type {
  ApiEnrolledCourse,
  ApiEnrolledCourseDetails,
  ApiModule,
} from "./api.types";
