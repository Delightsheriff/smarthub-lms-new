import { z } from "zod";
import { cleanLinkRows } from "@/components/ui/link-rows-input";
import type { CreateAssignmentPayload } from "../../types";
import { isRichTextEmpty } from "./authoring-kit";

/** The API caps brief and instructions at 20k (HTML length). */
export const ASSIGNMENT_BRIEF_MAX = 20000;

export const ASSIGNMENT_KINDS = [
  { value: "assignment", label: "Assignment" },
  { value: "test", label: "Test" },
  { value: "module-project", label: "Module project" },
  { value: "course-project", label: "Course project" },
] as const;

export const ASSIGNMENT_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
] as const;

/** Fields of the canonical assignment, shared by single- and multi-cohort
 *  create and by edit. `totalPoints` stays a string in the form so an
 *  empty input can be validated instead of becoming NaN. */
export const assignmentBodySchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(200),
  type: z.enum(["assignment", "test", "module-project", "course-project"]),
  priority: z.enum(["low", "medium", "high"]),
  totalPoints: z
    .string()
    .regex(/^\d+$/, "Whole points only")
    .refine((v) => Number(v) <= 1000, "At most 1000 points"),
  allowLateSubmission: z.boolean(),
  isPublished: z.boolean(),
  description: z.string().max(ASSIGNMENT_BRIEF_MAX, "Brief cannot exceed 20,000 characters"),
  instructions: z
    .string()
    .max(ASSIGNMENT_BRIEF_MAX, "Instructions cannot exceed 20,000 characters"),
  links: z
    .array(z.object({ name: z.string().max(80), url: z.string() }))
    .refine(
      (rows) => rows.every((r) => !r.url.trim() || /^https?:\/\/\S+$/.test(r.url.trim())),
      "Every link must be a full https:// URL",
    ),
});

export type AssignmentBodyValues = z.infer<typeof assignmentBodySchema>;

/**
 * Form values → API payload (without `module`). On edit, an emptied
 * instructions editor must send "" so clearing actually persists;
 * omitting it would leave the old text in place.
 */
export function toAssignmentPayload(
  v: AssignmentBodyValues,
  { clearEmptyInstructions = false }: { clearEmptyInstructions?: boolean } = {},
): Omit<CreateAssignmentPayload, "module"> {
  return {
    title: v.title.trim(),
    type: v.type,
    priority: v.priority,
    totalPoints: Number(v.totalPoints),
    allowLateSubmission: v.allowLateSubmission,
    isPublished: v.isPublished,
    description: isRichTextEmpty(v.description) ? undefined : v.description,
    instructions: isRichTextEmpty(v.instructions)
      ? clearEmptyInstructions
        ? ""
        : undefined
      : v.instructions,
    links: cleanLinkRows(v.links),
  };
}
