import { toContentLinks } from "@/types/content-link";
import type { Assignment } from "@/modules/assignments/types";
import type { ApiModule } from "@/modules/courses/types/api.types";
import type {
  Module,
  Recording,
  Material,
  RecordingWithContext,
  MaterialWithContext,
  ContentCourseRef,
  ContentModuleRef,
} from "../types";
import type {
  ApiAssignment,
  ApiContentCourseRef,
  ApiContentModuleRef,
  ApiMaterial,
  ApiMaterialWithContext,
  ApiRecording,
  ApiRecordingWithContext,
} from "../types/api.types";

/**
 * Map an API recording to the UI shape. The server returns `duration`
 * (seconds); we render a friendly label here.
 */
export function normaliseRecording(api: ApiRecording): Recording {
  const seconds = api.duration;
  const durationLabel =
    api.durationLabel ||
    (typeof seconds === "number"
      ? seconds >= 60
        ? `${Math.round(seconds / 60)} min`
        : `${seconds} s`
      : "");

  return {
    id: api._id,
    title: api.title,
    description: api.description,
    durationLabel,
    publishedAt: api.publishedAt || api.createdAt || "",
    watched: !!api.watched,
    videoUrl: api.videoUrl,
    links: toContentLinks(api.links, api.videoUrl),
    isLocked: !!api.isLockedForViewer,
  };
}

const FILE_TYPE_BY_MIME: Record<string, Material["type"]> = {
  "application/pdf": "pdf",
  "application/vnd.ms-powerpoint": "slide",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "slide",
};

export function normaliseMaterial(api: ApiMaterial): Material {
  const ft = api.fileType || "";
  const guessed: Material["type"] =
    FILE_TYPE_BY_MIME[ft] ||
    (api.fileUrl?.startsWith("http") && !api.fileUrl.includes("res.cloudinary")
      ? "link"
      : "pdf");

  return {
    id: api._id,
    title: api.title,
    description: api.description,
    type: guessed,
    size:
      typeof api.fileSize === "number" ? formatBytes(api.fileSize) : undefined,
    fileUrl: api.fileUrl,
    links: toContentLinks(api.links, api.fileUrl),
    fileType: api.fileType,
    category: api.category,
  };
}

function normaliseCourseRef(api: ApiContentCourseRef): ContentCourseRef {
  return {
    id: api._id,
    name: api.name || "Course",
    slug: api.nameSlug || api._id,
    color: api.color,
  };
}

function normaliseModuleRef(api: ApiContentModuleRef): ContentModuleRef {
  return {
    id: api._id,
    title: api.title || "Module",
    slug: api.titleSlug || api._id,
    order: api.order,
  };
}

export function normaliseRecordingWithContext(
  api: ApiRecordingWithContext,
): RecordingWithContext {
  return {
    course: normaliseCourseRef(api.course),
    module: normaliseModuleRef(api.module),
    recording: normaliseRecording(api.recording),
  };
}

export function normaliseMaterialWithContext(
  api: ApiMaterialWithContext,
): MaterialWithContext {
  return {
    course: normaliseCourseRef(api.course),
    module: normaliseModuleRef(api.module),
    material: normaliseMaterial(api.material),
  };
}

export function normaliseAssignment(api: ApiAssignment): Assignment {
  return {
    id: api._id,
    title: api.title,
    description: api.description,
    instructions: api.instructions || "",
    assignmentLink: api.assignmentLink || undefined,
    links: toContentLinks(api.links, api.assignmentLink),
    dueAt: api.dueDate || "",
    allowLateSubmission: !!api.allowLateSubmission,
    totalPoints: api.totalPoints ?? 100,
    type: (api.type as Assignment["type"]) || "assignment",
    priority: (api.priority as Assignment["priority"]) || "medium",
    status: (api.status as Assignment["status"]) || "draft",
  };
}

/**
 * Build a UI Module out of the API's lightweight module record plus the
 * three child arrays we have at hand.
 */
export function normaliseModuleContent(
  api: ApiModule,
  courseId: string,
  recordings: ApiRecording[],
  materials: ApiMaterial[],
  assignments: ApiAssignment[],
  fallbackOrder = 0,
): Module {
  return {
    id: api._id,
    slug: api.titleSlug || api._id,
    courseId,
    order: api.order ?? fallbackOrder + 1,
    title: api.title,
    summary: api.description || "",
    learningObjectives: api.learningObjectives || [],
    estimatedDuration: api.estimatedDuration,
    cohortStatus: api.cohortStatus,
    cohortStartedAt: api.cohortStartedAt ?? null,
    cohortCompletedAt: api.cohortCompletedAt ?? null,
    recordings: recordings.map(normaliseRecording),
    materials: materials.map(normaliseMaterial),
    assignments: assignments.map(normaliseAssignment),
  };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
