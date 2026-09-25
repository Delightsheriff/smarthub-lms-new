export interface WebinarSummary {
  id: string;
  title: string;
  slug: string;
  description?: string;
  date?: string;
  speakers: string[];
  posterUrl?: string;
  /** Best link to attend (upcoming) — liveLink || watchLink. */
  joinLink?: string;
  /** Best link to rewatch (past) — recordingLink || watchLink. */
  watchLink?: string;
  isAvailable: boolean;
  reservationsOpen?: boolean;
}
