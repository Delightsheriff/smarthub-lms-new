"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { RichText } from "./rich-text";
import { cn } from "@/lib/utils";

interface Props {
  html?: string | null;
  className?: string;
  /** Maximum collapsed height in pixels. Anything taller gets the
   *  Show more / Show less toggle; shorter content renders inline
   *  with no toggle (no point hiding three lines). */
  maxHeight?: number;
}

/**
 * Course / module / assignment descriptions can run to multiple
 * paragraphs. Inline they push real content (CTAs, metadata, lists)
 * below the fold. This wrapper measures the rendered HTML once and
 * shows a Show more / Show less control when the content overflows
 * the collapsed window.
 *
 * Defaults to a 7em (~5 line) collapsed window; override per-site
 * if a tighter or looser limit reads better.
 */
export function CollapsibleRichText({
  html,
  className,
  maxHeight = 112,
}: Props) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!innerRef.current) return;
    // Measure the natural height of the rich-text body. If it's
    // taller than `maxHeight` we reveal the toggle; otherwise the
    // body always renders fully and we never show a control.
    setOverflows(innerRef.current.scrollHeight > maxHeight + 4);
  }, [html, maxHeight]);

  if (!html) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <motion.div
        animate={{
          height: overflows && !open ? maxHeight : "auto",
        }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden"
      >
        <div ref={innerRef}>
          <RichText html={html} />
        </div>

        {/* Soft fade at the bottom of the collapsed view so the
            cut-off doesn't look like a hard crop. Hidden when
            expanded or when the content fits without a toggle. */}
        <AnimatePresence>
          {overflows && !open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {overflows && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {open ? (
            <>
              Show less <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Show more <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
