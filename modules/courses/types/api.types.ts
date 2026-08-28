import type {
  WireEnrolledCourse,
  WireInstructor,
  WireModule,
} from "@/lib/api/wire.types";

/**
 * smarthub-api shapes for the enrolled-courses surface. These are the
 * centralised `Wire*` records (see `lib/api/wire.types.ts`); re-exported
 * here so course-side code reads through the module seam only.
 */
export type ApiEnrolledCourse = WireEnrolledCourse;
export type ApiEnrolledCourseDetails = Omit<
  WireEnrolledCourse,
  "modules"
> & {
  modules: ApiModule[];
  resources?: {
    totalRecordings: number;
    totalMaterials: number;
    totalAssignments: number;
  };
};
export type ApiModule = WireModule;

export type ApiInstructor = WireInstructor;
