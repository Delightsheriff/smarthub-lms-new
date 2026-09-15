/** smarthub-api response shapes for `/lms/self-paced/*`. */

export interface ApiSelfPacedProgress {
  totalLessons: number;
  completedLessons: number;
  percent: number;
  /** Present on the complete/uncomplete responses only. */
  completedLessonIds?: string[];
}

export interface ApiSelfPacedCertificate {
  refNumber: string;
  url?: string;
}

export interface ApiSelfPacedCourseSummary {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  format?: string;
  grantedAt?: string;
  completedAt?: string;
  /** Most recent lesson completion; absent before the first one. */
  lastActivityAt?: string;
  certificate?: ApiSelfPacedCertificate;
  progress: ApiSelfPacedProgress;
  nextLesson?: { _id: string; title: string };
}

export interface ApiSelfPacedLesson {
  _id: string;
  title: string;
  description?: string;
  order: number;
  durationSeconds: number;
  durationMinutes: number;
  isPreview: boolean;
  completed: boolean;
  assetCount: number;
}

/** Mirrors `PublicCourseFaq` in smarthub-api's course-faqs service. */
export interface ApiCourseFaq {
  _id: string;
  question: string;
  /** Plain text; line breaks are meaningful. */
  answer: string;
  order: number;
}

export interface ApiSelfPacedCourseDetail {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  overview?: string;
  imageUrl?: string;
  difficulty?: string;
  whatsappGroupUrl?: string;
  cohortTrack?: { name?: string; slug: string };
  lessons: ApiSelfPacedLesson[];
  /** Published FAQs, in order. Older API builds omit it. */
  faqs?: ApiCourseFaq[];
  progress: ApiSelfPacedProgress;
  nextLessonId?: string;
  completedAt?: string;
  certificate?: ApiSelfPacedCertificate;
}

/** Mirrors `VideoSourceKind` in smarthub-api's lesson-stream-token service. */
export type ApiVideoSourceKind =
  | "direct"
  | "youtube"
  | "vimeo"
  | "drive"
  | "unknown";

export interface ApiLessonAsset {
  label?: string;
  url: string;
  format?: string;
}

export interface ApiLessonPlayback {
  kind: ApiVideoSourceKind;
  /** Direct files only: a tokenised path relative to `/api/v1`. */
  streamPath?: string;
  /** Hosted players (and unclassified refs): the stored video reference. */
  url?: string;
  expiresAt?: string;
  assets: ApiLessonAsset[];
}

/**
 * `POST /lessons/:lessonId/download`. 200 for ready and failed, 202 for
 * processing. Refusals come back as errors with an `errorCode`:
 * DOWNLOADS_DISABLED (503), DOWNLOAD_UNAVAILABLE (409),
 * DOWNLOAD_RATE_LIMITED (429), ENTITLEMENT_* (403).
 */
export type ApiLessonDownload =
  | {
      state: "ready";
      /** Tokenised path relative to `/api/v1`: `/self-paced-download/:token`. */
      downloadPath: string;
      expiresAt: string;
      remainingToday: number;
    }
  | { state: "processing"; retryAfterSeconds: number }
  | { state: "failed"; retryable: boolean };

/** `GET /nudges` — sent, undismissed reminders, newest first. */
export interface ApiNudge {
  _id: string;
  /** "first-lessons" | "inactivity" today. */
  kind: string;
  course?: { _id: string; name?: string; slug?: string; imageUrl?: string };
  title?: string;
  message?: string;
  /** Written as `/self-paced/:slug?lesson=:id` — not an LMS route. */
  actionUrl?: string;
  sentAt?: string;
  dismissedAt?: string;
}

export type ApiUpgradeCreditState =
  | "available"
  | "expired"
  | "consumed"
  | "refunded"
  | "duplicate"
  | "no-track";

/** `GET /upgrade-credit` — every self-paced purchase, as a credit. */
export interface ApiUpgradeCredits {
  windowDays: number;
  credits: {
    orderId: string;
    reference: string;
    itemType: string;
    itemName: string;
    paidAt?: string;
    expiresAt?: string;
    state: ApiUpgradeCreditState;
    /** Price paid, minor units, order currency. */
    valueMinor: number;
    currency: string;
    /** Whole naira against a cohort fee; 0 for a non-NGN order. */
    valueNaira: number;
    /** A pass order credits any cohort course. */
    anyCohort: boolean;
    eligibleTracks: { _id: string; name?: string; slug?: string }[];
  }[];
}

/** `GET /pass` — the caller's all-access pass. */
export interface ApiPassState {
  active: boolean;
  expiresAt?: string;
  /** End of a renewal already bought, starting when this term ends. */
  renewalEndsAt?: string;
  /** Cohort capabilities a pass never includes. */
  excludes: string[];
}

export interface ApiLessonCompletion {
  lessonId: string;
  completed: boolean;
  /** On mark; on unmark too since the API reports whether a stamped
   *  completion survives. Optional for an API without the unmark field. */
  courseCompleted?: boolean;
  progress: ApiSelfPacedProgress;
}
