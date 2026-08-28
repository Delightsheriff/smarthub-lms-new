"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Subtle, reusable fade-and-rise entrance.
 *
 * Respects reduced-motion (renders the child without animation) and
 * honours the "proper, subtle, not many" animation directive: a short
 * fade plus a gentle upward drift, fired once when the element scrolls
 * into view.
 */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 8,
}: {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before starting (used with staggered sequences). */
  delay?: number;
  /** Vertical distance to travel (px). 0 = pure fade. */
  y?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
