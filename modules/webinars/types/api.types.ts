/**
 * Non-admin projection from getWebinarsService. Excluded fields:
 * groupLink, watchCount, isPublished, isDeleted, createdAt, updatedAt.
 */
export interface ApiWebinar {
  _id: string;
  title: string;
  nameSlug: string;
  description: string;
  date: string;
  speakers: string[];
  tags: string[];
  /** @deprecated Legacy link field — prefer liveLink / recordingLink. */
  watchLink?: string;
  /** Where students join the live event. */
  liveLink?: string;
  /** Where the recording lives after the event. */
  recordingLink?: string;
  posterUrl: string;
  isAvailable: boolean;
  reservationsOpen: boolean;
  externalResources?: Array<{
    title: string;
    description?: string;
    link: string;
  }>;
}

export interface PaginatedWebinarsResponse {
  statusCode: number;
  message: string;
  success: boolean;
  data: ApiWebinar[];
  meta: {
    total: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}
