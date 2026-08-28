"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";

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

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="rounded-full"
    >
      {!mounted ? (
        <span className="h-[18px] w-[18px]" aria-hidden />
      ) : isDark ? (
        <Sun className="h-[18px] w-[18px]" />
      ) : (
        <Moon className="h-[18px] w-[18px]" />
      )}
    </Button>
  );
}
