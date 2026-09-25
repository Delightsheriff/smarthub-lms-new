"use client";
import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Link as LinkIcon,
  Notebook,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CircularProgress } from "@/components/ui/circular-progress";
import { cn } from "@/lib/utils";
import { useCourseProgress } from "@/modules/learning/api/content.queries";
import type { Material, Module } from "@/modules/learning/types";

const MATERIAL_ICON: Record<Material["type"], React.ElementType> = {
  pdf: FileText,
  slide: Notebook,
  exercise: Notebook,
  link: LinkIcon,
};

interface CourseOutlineProps {
  slug: string;
  modules: Module[];
  /** Course ID used to fetch completion ticks. */
  courseId?: string;
  /** Explicit completion set override. */
  completedIds?: Set<string>;
  /** Overall course completion (0–100) — shown as a ring at the top of
   *  the rail so "how far in am I" doesn't require scrolling to the
   *  overview page. Omitted on surfaces with no single progress number
   *  (e.g. the instructor's cohort-content view). */
  courseProgress?: number;
  /** Called when an item is selected — used by the mobile sheet to auto-close. */
  onItemClick?: () => void;
  /** Base path for every link the outline emits. Defaults to
   *  `/courses/${slug}` for the student surface. The instructor
   *  surface passes `/teach/cohorts/${scheduleId}`. */
  basePath?: string;
  /** Optional override for how assignment items link. */
  assignmentHref?: (moduleSlug: string, assignmentId: string) => string;
  /** Custom node rendered inside the accordion body when a module
   *  has no enumerated content. */
  emptyHint?: (mod: Module, moduleHref: string) => React.ReactNode;
}

/**
 * The course's table of contents. Used inline as a desktop rail and
 * inside a Sheet on mobile. Highlights the active module by URL and
 * the active item by location hash; updates on `hashchange` so manual
 * scroll + click both feel responsive.
 */
export function CourseOutline({
  slug,
  modules,
  courseId,
  completedIds,
  courseProgress,
  onItemClick,
  basePath,
  assignmentHref,
  emptyHint,
}: CourseOutlineProps) {
  const { data: progressSet } = useCourseProgress(courseId);
  const activeCompletedIds = completedIds ?? progressSet;
  const pathname = usePathname();
  const params = useParams();
  const linkedRecording = useSearchParams().get("recording");
  const activeModuleSlug =
    (params?.moduleSlug as string | undefined) ?? null;

  const rootPath = basePath || `/courses/${slug}`;

  const [activeHash, setActiveHash] = useState<string>("");
  useEffect(() => {
    const sync = () => setActiveHash(window.location.hash.slice(1));
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  if (modules.length === 0) {
    return (
      <div className="p-5 text-center">
        <BookOpen className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Modules will appear here once they&apos;re published.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 p-3">
      {typeof courseProgress === "number" && (
        <div className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2.5 mb-1">
          <CircularProgress value={courseProgress} size={42} strokeWidth={3.5}>
            <span className="text-xs font-bold tabular-nums">
              {Math.round(courseProgress)}
            </span>
          </CircularProgress>
          <div className="min-w-0">
            <p className="text-xs font-semibold leading-tight">
              {Math.round(courseProgress)}% complete
            </p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Keep going
            </p>
          </div>
        </div>
      )}

      <Link
        href={rootPath}
        onClick={onItemClick}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
          pathname === rootPath
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Sparkles className="h-4 w-4" />
        Overview
      </Link>

      <Accordion
        defaultValue={activeModuleSlug ? [activeModuleSlug] : []}
        className="space-y-1"
      >
        {modules.map((mod) => {
          const moduleHref = `${rootPath}/modules/${mod.slug}`;
          const isActiveModule = activeModuleSlug === mod.slug;

          return (
            <AccordionItem
              key={mod.id}
              value={mod.slug}
              className="border-0 bg-transparent"
            >
              <div className="flex items-center gap-1 min-w-0">
                <Link
                  href={moduleHref}
                  onClick={onItemClick}
                  className={cn(
                    "flex flex-1 items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors min-w-0",
                    isActiveModule && !activeHash
                      ? "bg-primary text-primary-foreground"
                      : isActiveModule
                        ? "text-primary"
                        : "text-foreground hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold tabular-nums",
                      isActiveModule && !activeHash
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : isActiveModule
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {mod.order.toString().padStart(2, "0")}
                  </span>
                  <span className="truncate leading-snug text-left flex-1 min-w-0">
                    {mod.title}
                  </span>
                </Link>
                <AccordionTrigger className="shrink-0 w-8 h-8 p-0 flex items-center justify-center hover:bg-muted rounded-lg border-0 py-0" />
              </div>

              <AccordionContent className="pl-9 pr-2 pb-1 pt-1">
                <ul className="space-y-0.5">
                  <OutlineRecordings
                    recordings={mod.recordings}
                    moduleHref={moduleHref}
                    activeId={isActiveModule ? linkedRecording : null}
                    completedIds={activeCompletedIds}
                    onItemClick={onItemClick}
                  />
                  {mod.materials.map((m) => (
                    <OutlineItem
                      key={m.id}
                      label={m.title}
                      href={`${moduleHref}#material-${m.id}`}
                      icon={MATERIAL_ICON[m.type]}
                      active={
                        isActiveModule && activeHash === `material-${m.id}`
                      }
                      onClick={onItemClick}
                    />
                  ))}
                  {mod.assignments.map((a) => {
                    const href = assignmentHref
                      ? assignmentHref(mod.slug, a.id)
                      : `${moduleHref}/assignments/${a.id}`;
                    return (
                      <OutlineItem
                        key={a.id}
                        label={a.title}
                        href={href}
                        icon={Notebook}
                        active={pathname.endsWith(`/assignments/${a.id}`)}
                        onClick={onItemClick}
                      />
                    );
                  })}
                  {mod.recordings.length === 0 &&
                    mod.materials.length === 0 &&
                    mod.assignments.length === 0 &&
                    (emptyHint ? (
                      <li>{emptyHint(mod, moduleHref)}</li>
                    ) : (
                      <li className="px-3 py-2 text-xs text-muted-foreground italic">
                        No content yet
                      </li>
                    ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

const OUTLINE_RECORDINGS_STEP = 8;

/**
 * A module's recordings in the rail, revealed 8 at a time ("Show more",
 * not a pager — this is navigation, and one module can hold 47). The
 * reveal never hides the recording the reader is on. Links carry
 * `?recording=<id>`, which the module page turns into the right page
 * and an open player; a `#hash` failed once the list was paged.
 */
function OutlineRecordings({
  recordings,
  moduleHref,
  activeId,
  completedIds,
  onItemClick,
}: {
  recordings: Module["recordings"];
  moduleHref: string;
  activeId: string | null;
  completedIds?: Set<string>;
  onItemClick?: () => void;
}) {
  const [shown, setShown] = useState(OUTLINE_RECORDINGS_STEP);
  const activeIndex = activeId ? recordings.findIndex((r) => r.id === activeId) : -1;
  const visibleCount = Math.max(shown, activeIndex + 1);
  const hidden = recordings.length - visibleCount;

  return (
    <>
      {recordings.slice(0, visibleCount).map((r) => {
        const isWatched = !!completedIds?.has(r.id);
        return (
          <OutlineItem
            key={r.id}
            label={r.title}
            href={`${moduleHref}?recording=${r.id}`}
            icon={isWatched ? CheckCircle2 : PlayCircle}
            iconClassName={isWatched ? "text-success" : "text-primary"}
            active={activeId === r.id}
            onClick={onItemClick}
          />
        );
      })}
      {hidden > 0 && (
        <li>
          <button
            type="button"
            onClick={() => setShown(visibleCount + OUTLINE_RECORDINGS_STEP)}
            className="w-full rounded-md px-3 py-1.5 text-left text-xs font-medium text-primary hover:bg-muted"
          >
            Show {Math.min(hidden, OUTLINE_RECORDINGS_STEP)} more of {hidden}
          </button>
        </li>
      )}
    </>
  );
}

function OutlineItem({
  label,
  href,
  icon: Icon,
  iconClassName,
  active,
  onClick,
}: {
  label: string;
  href: string;
  icon: React.ElementType;
  iconClassName?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 rounded-md border-l-2 px-3 py-1.5 text-xs transition-colors",
          active
            ? "border-primary bg-primary/10 text-primary font-semibold"
            : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            iconClassName || "text-muted-foreground",
          )}
        />
        <span className="truncate">{label}</span>
      </Link>
    </li>
  );
}
