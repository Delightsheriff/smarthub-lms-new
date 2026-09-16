import {
  BookOpen,
  ClipboardList,
  Layers,
  Library,
  Presentation,
  Search,
  Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Map the server's stable `iconHint` string to a lucide icon. Kept on
 * the client so the palette stays a thin, entity-agnostic renderer.
 * Unknown hints fall back to a neutral search glyph.
 */
const ICONS: Record<string, LucideIcon> = {
  "book-open": BookOpen,
  "layout-grid": Layers,
  "clipboard-list": ClipboardList,
  video: Video,
  library: Library,
  presentation: Presentation,
};

export const iconForHint = (hint?: string): LucideIcon =>
  (hint && ICONS[hint]) || Search;
