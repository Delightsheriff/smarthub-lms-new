"use client";
import { mockDatabase } from "@/lib/api/mock/mockDatabase";
import { useAuthStore } from "@/store/slices/authStore";

/**
 * Total unread message count across the signed-in user's conversations,
 * used for the inbox badge in the side rail + bottom nav.
 *
 * UI-first: this reads the static mock conversations directly. When the
 * real messaging layer lands (Plan 008) this frees to a TanStack query
 * over the conversations API — callers only depend on the returned
 * number, so the swap is invisible to the chrome.
 */
export function useInboxUnreadCount(): number {
  const userId = useAuthStore((s) => s.user?._id);
  if (!userId) return 0;
  return mockDatabase.conversations.reduce(
    (sum, c) => sum + (c.unreadCount?.[userId] ?? 0),
    0
  );
}
