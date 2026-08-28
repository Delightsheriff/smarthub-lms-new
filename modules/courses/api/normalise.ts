import type {
  ApiEnrolledCourse,
  ApiEnrolledCourseDetails,
} from "../types/api.types";
import type { Course } from "../types";

/**
 * Map the verbose smarthub-api enrolment payload to the small UI
 * shape every screen consumes. Keeps API drift contained: when the
 * server adds fields the UI doesn't care about, only this file
 * needs touching.
 */
export function normaliseEnrolledCourse(
  api: ApiEnrolledCourse | ApiEnrolledCourseDetails,
): Course {
  const inst = api.instructor;
  const instructor = inst
    ? {
        id: inst._id,
        name: [inst.firstName, inst.lastName].filter(Boolean).join(" "),
        title: "Lead Instructor",
      }
    : { name: "TBD", title: "Instructor" };

  // Full contactable list (present on the course-detail payload only).
  const instructors = (
    "instructors" in api ? api.instructors : undefined
  )?.map((u, i) => ({
    id: u._id,
    name: [u.firstName, u.lastName].filter(Boolean).join(" "),
    title: u.jobTitle || (i === 0 ? "Lead Instructor" : "Instructor"),
    imageUrl: u.imageUrl || u.profilePicture,
    bio: u.bio,
    whatsapp: u.whatsapp ?? null,
  }));

  const status: Course["status"] =
    api.enrollment.status === "completed"
      ? "completed"
      : api.enrollment.progress > 0
        ? "in-progress"
        : "not-started";

  return {
    id: api._id,
    slug: api.nameSlug,
    name: api.name,
    category: api.category || "—",
    description: api.description || "",
    imageUrl: api.imageUrl || api.thumbnail,
    progress: Math.round(api.enrollment.progress || 0),
    durationLabel: "",
    startDate: api.enrollment.schedule.startDate,
    instructor,
    instructors,
    status,
    mode: api.mode,
    courseKind: api.courseKind,
  };
}
