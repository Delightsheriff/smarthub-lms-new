import type { ContentLink } from "@/types/content-link";

/**
 * Wire shapes for module content (recordings / materials / assignments)
 * as emitted by `smarthub-api`. These are the raw backend records a
 * module's `normalise.ts` reads; screens consume the smaller UI types in
 * `index.ts` instead.
 */

export interface ApiRecording {
  _id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  links?: ContentLink[];
  duration?: number;
  durationLabel?: string;
  createdAt?: string;
  publishedAt?: string;
  watched?: boolean;
  isLockedForViewer?: boolean;
}

export interface ApiMaterial {
  _id: string;
  title: string;
  description?: string;
  fileUrl?: string;
  links?: ContentLink[];
  fileType?: string;
  fileSize?: number;
  category?: string;
}

export interface ApiAssignment {
  _id: string;
  title: string;
  description?: string;
  instructions?: string;
  assignmentLink?: string;
  links?: ContentLink[];
  dueDate?: string;
  totalPoints?: number;
  allowLateSubmission?: boolean;
  status?: string;
  type?: string;
  priority?: string;
  module?: string;
  course?: string;
}

export interface ApiContentCourseRef {
  _id: string;
  name?: string;
  nameSlug?: string;
  color?: string;
}

export interface ApiContentModuleRef {
  _id: string;
  title?: string;
  titleSlug?: string;
  order?: number;
}

export interface ApiRecordingWithContext {
  course: ApiContentCourseRef;
  module: ApiContentModuleRef;
  recording: ApiRecording;
}

export interface ApiMaterialWithContext {
  course: ApiContentCourseRef;
  module: ApiContentModuleRef;
  material: ApiMaterial;
}
