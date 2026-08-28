"use client";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
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
import { cn } from "@/lib/utils";
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
  onItemClick,
  basePath,
  assignmentHref,
  emptyHint,
}: CourseOutlineProps) {
  const pathname = usePathname();
  const params = useParams();
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
      <Link
        href={rootPath}
        onClick={onItemClick}
        className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
          pathname === rootPath
            ? "bg-primary/10 text-primary"
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
              <div className="flex items-stretch">
                <Link
                  href={moduleHref}
                  onClick={onItemClick}
                  className={cn(
                    "flex flex-1 items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors min-w-0",
                    isActiveModule && !activeHash
                      ? "bg-primary/10 text-primary"
                      : isActiveModule
                        ? "text-primary"
                        : "text-foreground hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold tabular-nums",
                      isActiveModule
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {mod.order.toString().padStart(2, "0")}
                  </span>
                  <span className="line-clamp-2 leading-snug text-left">
                    {mod.title}
                  </span>
                </Link>
                <AccordionTrigger className="px-2 hover:bg-muted rounded-lg" />
              </div>

              <AccordionContent className="pl-9 pr-2 pb-1 pt-1">
                <ul className="space-y-0.5">
                  {mod.recordings.map((r) => (
                    <OutlineItem
                      key={r.id}
                      label={r.title}
                      href={`${moduleHref}#recording-${r.id}`}
                      icon={r.watched ? CheckCircle2 : PlayCircle}
                      iconClassName={
                        r.watched ? "text-emerald-600" : "text-primary"
                      }
                      active={
                        isActiveModule && activeHash === `recording-${r.id}`
                      }
                      onClick={onItemClick}
                    />
                  ))}
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
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors",
          active
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
