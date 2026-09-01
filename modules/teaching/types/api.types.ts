export interface ApiTeachingCohort {
  _id: string;
  startDate: string;
  endDate?: string;
  duration?: string;
  applicationIsOpen?: boolean;
  applicationEndDate?: string;
  studentCount: number;
  progress?: number;
  course?: {
    _id: string;
    name: string;
    nameSlug?: string;
    mode?: string;
    imageUrl?: string;
    description?: string;
  };
}

export interface ApiTeachingCohortDetail extends ApiTeachingCohort {
  instructors?: Array<{ _id: string; firstName?: string; lastName?: string }>;
  modules?: Array<{
    _id: string;
    title?: string;
    titleSlug?: string;
    description?: string;
    learningObjectives?: string[];
    estimatedDuration?: string;
    order?: number;
    assignmentCount?: number;
    recordingCount?: number;
    materialCount?: number;
  }>;
}
