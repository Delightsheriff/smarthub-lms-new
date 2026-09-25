import type { ApiWebinar } from "../types/api.types";
import type { WebinarSummary } from "../types";

/**
 * Map the raw API shape to the small UI shape consumed by screens.
 * joinLink prefers liveLink, then falls through to the legacy watchLink.
 * watchLink (rewatch) prefers the dedicated recordingLink and also
 * falls back to the legacy watchLink field.
 */
export function normaliseWebinar(api: ApiWebinar): WebinarSummary {
  return {
    id: api._id,
    title: api.title,
    slug: api.nameSlug,
    description: api.description,
    date: api.date,
    speakers: api.speakers ?? [],
    posterUrl: api.posterUrl,
    joinLink: api.liveLink ?? api.watchLink,
    watchLink: api.recordingLink ?? api.watchLink,
    isAvailable: api.isAvailable !== false,
    reservationsOpen: api.reservationsOpen,
  };
}
