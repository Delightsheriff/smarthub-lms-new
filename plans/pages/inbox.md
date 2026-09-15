# Inbox (`/inbox`)

Status: 🔴 Not started

## Current vs legacy

Current: `modules/conversations/components/InboxPageContent.tsx` (128) +
`ConversationListItemRow.tsx` (107), `modules/messaging/components/
AssignmentThread.tsx` (130).

Legacy: `InboxPageContent.tsx` (287, monolithic — list + thread + composer
inline), `AssignmentThread.tsx` (185).

## Concrete gaps

1. **Mark-as-read is completely missing.** Legacy calls
   `conversationsService.markRead(conversationId)` on thread open and
   invalidates the list query (legacy `InboxPageContent.tsx:152-157`).
   Current's `conversations.service.ts` has no `markRead` method at all —
   unread badges (`ConversationListItemRow.tsx:79-82`) can never clear.
   **This is a real, user-facing bug**, not a nice-to-have.
2. **Real-time scoping is coarser.** Legacy joins/leaves a socket room per
   conversation and appends incoming messages straight into the cache
   (legacy `InboxPageContent.tsx:161-173`). Current listens globally for
   `"message:created"` with no room join/leave and does a full `refetch()`
   instead of an optimistic append (`AssignmentThread.tsx:27-40`) — works,
   but every open thread refetches on every message anywhere, not just its
   own.
3. **Assignment deep-link chip dropped.** Legacy's thread header links back
   to the assignment ("About **Title** → Open", legacy
   `InboxPageContent.tsx:205-219`). Current's `AssignmentThread.tsx` shows
   plain title text only, line 79, no link back.
4. Type-filter tabs (All/Direct/Group/Assignment/Announcement/Support) are
   a net *addition* in current not present in legacy — keep them, but
   verify `c.type` values actually match what the API sends (unverified
   against real data by the audit).
5. Raw Tailwind colors: `ConversationListItemRow.tsx:25,27,29,31,91`.
6. No `PageHeader`/`EmptyState` adoption; both list-empty and thread-empty
   states are hand-rolled.

## Design direction

Fix #1 first — it's a real bug, not styling debt. #3 is small and valuable
(a student replying about an assignment should be able to jump back to it
in one click). #2 is an efficiency nit, lower priority. Then the usual
theme-token + shared-primitive pass.

## Acceptance criteria

- [ ] Opening a conversation marks it read server-side and the unread
      badge clears (add `markRead` to `conversations.service.ts`, call it
      on thread open, invalidate the list query).
- [ ] `AssignmentThread` header links back to the assignment it's scoped to.
- [ ] Raw Tailwind colors in `ConversationListItemRow.tsx` replaced with
      theme tokens.
- [ ] `PageHeader`/`EmptyState` adopted for list-empty and thread-empty
      states.
- [ ] `npx tsc --noEmit` and `npx eslint` clean.
- [ ] Verified in the browser: unread badge clears after opening a
      conversation.
