/**
 * Classify a recording URL into the shape needed to render it inline.
 * Extracted so the recording-player dialog and any future embed surface
 * share one understanding of what each URL kind means and how to embed
 * it. Pure classifier — unit-tested directly.
 */

export type VideoSource =
  | { kind: "video"; src: string }
  | { kind: "youtube"; src: string }
  | { kind: "vimeo"; src: string }
  | { kind: "drive"; src: string }
  | { kind: "external"; src: string };

const VIDEO_FILE_RE = /\.(mp4|webm|m4v|mov|ogv)(\?.*)?$/i;

/** Vimeo: turn /video/123 or /123 URL into player.vimeo.com/video/123. */
function toVimeoEmbed(url: string): string {
  const id = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
  return id ? `https://player.vimeo.com/video/${id}` : url;
}

/** Drive: /file/d/<id>/view → /file/d/<id>/preview. Returns null when
 *  the URL doesn't match the expected shape (so we punt to "open in a
 *  new tab" instead of trying to embed an arbitrary Drive page). */
function toDrivePreview(url: string): string | null {
  const id = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/)?.[1];
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}

/** Turn a regular YouTube URL into an embeddable one. Returns null if
 *  we can't extract a video id — caller should treat that as a
 *  non-embeddable link.
 *
 *  Uses youtube-nocookie.com to avoid the third-party cookie blocks
 *  that some browsers / privacy extensions trip on the regular
 *  domain. */
function toYouTubeEmbed(url: string): string | null {
  const existing = url.match(/\/embed\/([\w-]{11})/)?.[1];
  if (existing) return `https://www.youtube-nocookie.com/embed/${existing}`;
  const id = url.match(
    /(?:v=|youtu\.be\/|\/shorts\/|\/live\/|\/v\/)([\w-]{11})/,
  )?.[1];
  return id
    ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
    : null;
}

export function classifyVideoUrl(url: string): VideoSource {
  if (/(?:youtube\.com|youtu\.be)/i.test(url)) {
    const embed = toYouTubeEmbed(url);
    return embed
      ? { kind: "youtube", src: embed }
      : { kind: "external", src: url };
  }
  if (/vimeo\.com/i.test(url)) {
    return { kind: "vimeo", src: toVimeoEmbed(url) };
  }
  if (/drive\.google\.com/i.test(url)) {
    const embed = toDrivePreview(url);
    return embed
      ? { kind: "drive", src: embed }
      : { kind: "external", src: url };
  }
  if (VIDEO_FILE_RE.test(url) || /\/video\/upload\//.test(url)) {
    return { kind: "video", src: url };
  }
  return { kind: "external", src: url };
}
