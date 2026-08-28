import {
  normaliseMaterial,
  normaliseRecording,
} from "@/modules/learning/api/normalise";
import { formatDate } from "@/lib/utils";
import type {
  ApiAssignedAssignment,
  ApiAssignedModule,
} from "../types/api.types";
import type { AssignedAssignment, AssignedModule } from "../types";

function normaliseAssignment(
  api: ApiAssignedAssignment,
): AssignedAssignment {
  return {
    id: api._id,
    title: api.title,
    description: api.description,
    dueLabel: api.dueDate ? formatDate(api.dueDate) : undefined,
    type: api.type,
  };
}

export function normaliseAssignedModule(
  api: ApiAssignedModule,
): AssignedModule {
  return {
    id: api._id,
    title: api.title,
    description: api.description,
    estimatedDuration: api.estimatedDuration,
    learningObjectives: api.learningObjectives || [],
    assignedAt: api.assignedAt,
    note: api.note,
    recordings: (api.recordings || []).map(normaliseRecording),
    materials: (api.materials || []).map(normaliseMaterial),
    assignments: (api.assignments || []).map(normaliseAssignment),
  };
}
