"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

/**
 * Top-bar appearance toggle. Reads `resolvedTheme` so a `system` user
 * clicking it flips to the *opposite* of what they currently see.
 *
 * Renders a sized placeholder until `mounted` flips client-side, which
 * avoids the hydration mismatch `next-themes` warns about (the server
 * doesn't know the user's preference; only the client does).
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    // Suppress transitions across the DOM during the theme flip to prevent color smearing (better-ui)
    const css = document.createElement("style");
    css.appendChild(
      document.createTextNode("*,*::before,*::after{transition:none !important}")
    );
    document.head.appendChild(css);

    setTheme(isDark ? "light" : "dark");

    // Force reflow
    void window.getComputedStyle(document.body).opacity;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.head.removeChild(css);
      });
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label={!mounted ? "Toggle theme" : isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 active:scale-[0.96] transition-[transform,background-color] relative"
    >
      {!mounted ? (
        <span className="h-4 w-4" aria-hidden />
      ) : (
        <div className="relative h-4 w-4">
          <Sun
            className={cn(
              "absolute inset-0 h-4 w-4 transition-[transform,opacity] duration-200 ease-out",
              isDark ? "scale-100 opacity-100 rotate-0" : "scale-50 opacity-0 rotate-90 pointer-events-none"
            )}
          />
          <Moon
            className={cn(
              "absolute inset-0 h-4 w-4 transition-[transform,opacity] duration-200 ease-out",
              isDark ? "scale-50 opacity-0 -rotate-90 pointer-events-none" : "scale-100 opacity-100 rotate-0"
            )}
          />
        </div>
      )}
    </Button>
  );
}
