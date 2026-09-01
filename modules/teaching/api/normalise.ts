import type { ApiTeachingCohort, ApiTeachingCohortDetail } from "../types/api.types";
import type { TeachingCohort, TeachingCohortDetail, TeachingModule } from "../types";

export function normaliseCohort(api: ApiTeachingCohort): TeachingCohort {
  const course = api.course
    ? {
        id: api.course._id,
        name: api.course.name || "Course",
        slug: api.course.nameSlug,
        mode: api.course.mode,
        imageUrl: api.course.imageUrl,
        description: api.course.description,
      }
    : {
        id: "course_unknown",
        name: "Untitled Course",
      };

  return {
    id: api._id,
    startDate: api.startDate || new Date().toISOString(),
    endDate: api.endDate,
    duration: api.duration || "6 months",
    studentCount: api.studentCount || 0,
    progress: api.progress ?? 0,
    course,
  };
}

export function normaliseCohortDetail(api: ApiTeachingCohortDetail): TeachingCohortDetail {
  const base = normaliseCohort(api);

  const modules: TeachingModule[] = (api.modules || []).map((m, idx) => ({
    id: m._id,
    title: m.title || `Module ${idx + 1}`,
    slug: m.titleSlug,
    description: m.description,
    learningObjectives: m.learningObjectives,
    estimatedDuration: m.estimatedDuration,
    order: m.order ?? idx + 1,
    assignmentCount: m.assignmentCount ?? 0,
    recordingCount: m.recordingCount ?? 0,
    materialCount: m.materialCount ?? 0,
  }));

  return {
    ...base,
    modules,
  };
}
