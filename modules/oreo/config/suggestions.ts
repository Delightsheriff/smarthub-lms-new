export type OreoSuggestionMode = "student" | "instructor" | "both";

export const OREO_SUGGESTIONS: Record<
  OreoSuggestionMode,
  Array<{ prompt: string; category: string }>
> = {
  student: [
    { prompt: "What is my current cohort progress?", category: "Progress" },
    { prompt: "When is my next assignment due?", category: "Deadlines" },
    { prompt: "How do I request SIWES placement support?", category: "Internships" },
    { prompt: "What are the rules for late submissions?", category: "Policy" },
  ],
  instructor: [
    { prompt: "Which submissions currently need grading?", category: "Grading" },
    { prompt: "How do I mark attendance for a live session?", category: "Teaching" },
    { prompt: "What is the average progress of my cohorts?", category: "Analytics" },
  ],
  both: [
    { prompt: "What is my current cohort progress?", category: "Progress" },
    { prompt: "Which submissions currently need grading?", category: "Grading" },
    { prompt: "How do I update my profile details?", category: "Account" },
  ],
};
