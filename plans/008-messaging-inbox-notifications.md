# PLAN 008 — Messaging + Inbox + Notifications

**Status:** Draft (awaiting confirmation)
**Owner:** SmartHub port
**Depends on:** 001 (mock seam, socket-provider/useSocket, `use-notification-chime`, `use-title-notifier`), 003 (bell trigger + `message-toast-listener` chrome mounted and waiting for a feed source), 002 (route stubs), 005 (courses — course/module slugs for the assignment chip), 006 (assignments — assignment titles for the chip + thread)

---

## 1. Goal

Port the three **conversational** surfaces that cluster around realtime: the
**inbox** (a conversation list of five types — direct, group, assignment,
announcement, support — with unread badges and assignment chips), a
**conversation thread** (`AssignmentThread`, the assignment-specific composer +
message feed), and **notifications** (a bell in the chrome with a live unread
count, an inbox-style notifications page that marks items read, plus the
repository's chime + title notifier). All of it is **UI-first against the
mock**: conversation/message/notification fixtures with unread counts and
`createdAt` are seeded in `mockDatabase.ts` and served through the same
API-client seam. Realtime rides the **socket seam from Foundation** — the mock
emits `message:created` events through its event emitter, so new messages and
unread-toggles update the open screens live, exactly like a real socket.

## 2. Scope

### In scope

**Conversations module (`modules/conversations/`, the inbox)**
- `types/` — `api.types.ts` (`ApiUser`, `ApiMessage`, `ApiAssignmentRef`,
  `ApiCourseRef`, `ApiModuleRef`, `ApiConversation` with its `type` literal
  set + `metadata`) and `index.ts` (`ConversationAssignmentRef`,
  `ConversationListItem`) — exact types in §4.
- `api/` — `conversations.service.ts` (list conversations), `normalise.ts`
  (`normaliseConversation` — wire → `ConversationListItem` incl. the `unread`
  flag, preview text, title/assignment-chip derivation), `conversations.queries.ts`
  (`useConversations`).
- `config/endpoints.ts` — `CONVERSATIONS_ENDPOINTS.LIST`.
- `components/` — `InboxPageContent` (conversation list, active-item
  selection, assignment chips, unread badges; tabs handle the type filter),
  `ConversationListItemRow`, `ConversationThread` successor that mounts the
  messaging module's thread when an `assignment`-type conversation is active.
- Mock collection (Foundation): conversations of **each of the five types**
  with messages and unread counts.
- Live updates: the mock's socket emitter reflects `message:created` (and the
  unread toggle), so the inbox list re-sorts and re-badges as the active
  thread changes.

**Messaging module (`modules/messaging/`, the thread)**
- `types/` — `api.types.ts` (`ApiConversation` with direct|group|assignment|
  announcement|course literal set + participants as id-or-object,
  `ApiMessageSender`, `ApiMessage` with `type: text|file|audio|video|system`
  and `isDeleted?`) and `index.ts` (`Conversation`, `ChatMessage` incl. the
  `mine` flag) — exact types in §4.
- `api/` — `messaging.service.ts` (fetch thread, send message — a **mutation
  behind the API seam**, appending to the mock), `normalise.ts`
  (`normaliseMessage` — the pure port that computes `mine` from the auth user
  id and `senderName`), `messaging.queries.ts` (`useThread`,
  `useSendMessage`).
- `config/endpoints.ts` — `MESSAGING_ENDPOINTS`.
- `components/` — `AssignmentThread` (message feed + `textarea` composer +
  send; optimistic append + socket-based live arrival), optionally small
  `MessageBubble` helpers.
- Mock emitter support: the send mutation appends to the mock and emits
  `message:created` so all open threads update live.

**Notifications module (`modules/notifications/`)**
- `types/index.ts` — `Notification` (read UI shape) + `ApiNotification`
  (wire) — exact types in §4.
- `api/` — `notifications.service.ts` (list, mark-one-read, mark-all-read),
  `normalise.ts`, `notifications.queries.ts` (`useNotifications`,
  `useUnreadCount`, `useMarkAllRead`).
- `config/endpoints.ts` — `NOTIFICATIONS_ENDPOINTS`.
- `components/` — `NotificationBell` (bell with live unread count + dropdown
  feed — the feed source the Plan 003 trigger waits on), `NotificationsPageContent`
  (inbox-style list that marks read on open/tap).
- Wire the Foundation `use-notification-chime` (audio) + `use-title-notifier`
  (unread count in the tab title) to the unread query.
- Mock collection (Foundation): notifications (several unread) with
  `createdAt`; the mock marks an item read via the seam + reflects the toggle
  through the emitter.

**Routes + chrome**
- Replace the Plan 002 stubs: `(app)/inbox/page.tsx` → `InboxPageContent`,
  `(app)/notifications/page.tsx` → `NotificationsPageContent`.
- Feed the Plan 003 bell trigger with `NotificationBell` and its unread query.

### Out of scope (explicitly deferred)

- **File / audio / video message bodies** — the composer supports the `text`
  wire path only; the richer `type` literals (`file|audio|video|system`) are
  mirrored in types but not built as upload/preview UI here (see §8).
- Group/announcement **management** (create, rename, add/remove participants,
  roles in group conversations) — list + read + send only.
- Any real transport — this slice rides the mock + its socket emitter seam;
  the live socket wiring is unchanged from Foundation.
- Admin/support reply triage, canned responses, or a dedicated support console.
- Notification **preference settings** and push registration (deferred to
  Plan 009 / 012; push module is a separate later slice).

## 3. Source reference

- `smarthub-core-lms/src/modules/conversations/{
  components/InboxPageContent.tsx,
  api/{conversations.service,conversations.queries,normalise}.ts,
  config/endpoints.ts, types/{api.types,index}.ts}`
- `smarthub-core-lms/src/modules/messaging/{
  components/AssignmentThread.tsx,
  api/{messaging.service,messaging.queries,normalise}.ts,
  config/endpoints.ts, types/{api.types,index}.ts}`
- `smarthub-core-lms/src/modules/notifications/{
  components/{NotificationBell,NotificationsPageContent}.tsx,
  api/{notifications.service,notifications.queries}.ts,
  config/endpoints.ts, types/index.ts}`
- `smarthub-core-lms/src/components/layout/message-toast-listener.tsx` — the
  chrome listener that consumes socket `message:created` events into a toast.
- `smarthub-core-lms/src/hooks/{use-notification-chime,use-title-notifier}.ts`
  (ported into Foundation; wired here).
- `smarthub-api/src/constants/index.ts` + `src/models/Conversation*.ts` /
  `Notification*.ts` — authoritative `conversation.type`/`message.type` literal
  sets and wire shapes.

> Behavior/contracts ported; design tokens, Radix and Tailwind-v3 components
> are **not** — every primitive is rebuilt from the `base-vega` preset.

## 4. Target files / structure

```
modules/
  conversations/
    api/
      conversations.service.ts    # list through the client seam
      conversations.queries.ts    # useConversations
      normalise.ts                # normaliseConversation — wire → UI
    components/
      InboxPageContent.tsx        # list, selection, filters, chips
      conversation-list-item-row.tsx
      inbox-thread.tsx            # routes active type → messaging AssignmentThread
    config/endpoints.ts
    types/
      api.types.ts                # wire shapes (below)
      index.ts                    # ConversationListItem, ConversationAssignmentRef
  messaging/
    api/
      messaging.service.ts        # getThread + sendMessage (mutation, append to mock)
      messaging.queries.ts        # useThread, useSendMessage
      normalise.ts                # normaliseMessage — the `mine` port
    components/
      AssignmentThread.tsx        # feed + textarea composer + optimistic send
      message-bubble.tsx
    config/endpoints.ts
    types/
      api.types.ts                # wire shapes (below)
      index.ts                    # Conversation, ChatMessage
  notifications/
    api/
      notifications.service.ts    # list, markRead, markAllRead
      notifications.queries.ts    # useNotifications, useUnreadCount, useMarkAllRead
      normalise.ts                # normaliseNotification
    components/
      NotificationBell.tsx        # live unread count + dropdown feed
      NotificationsPageContent.tsx# list + mark-read
    config/endpoints.ts
    types/
      api.types.ts                # ApiNotification
      index.ts                    # Notification (UI)
app/(app)/
  inbox/page.tsx                  # thin delegate → conversations InboxPageContent
  notifications/page.tsx          # thin delegate → notifications NotificationsPageContent
lib/api/mock/mockDatabase.ts      # EXTEND (Foundation): conversations ×5 types + messages + unread; notifications
```

### Exact types

**`conversations/types/api.types.ts`:**

```ts
export interface ApiUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  imageUrl?: string;
  role?: string;
}

export interface ApiMessage {
  _id: string;
  conversationId: string;
  sender: ApiUser | string;
  content: string;
  createdAt: string;
}

export interface ApiAssignmentRef {
  _id: string;
  title: string;
  courseSlug?: string;
  moduleSlug?: string;
}

export interface ApiCourseRef {
  _id: string;
  title: string;
  slug?: string;
}

export interface ApiModuleRef {
  _id: string;
  title: string;
  slug?: string;
}

export type ConversationType = "direct" | "group" | "assignment" | "announcement" | "support";

export interface ApiConversation {
  _id: string;
  type: ConversationType;
  participants: ApiUser[];
  lastMessage?: ApiMessage | null;
  unreadCount?: number;
  updatedAt: string;
  metadata?: {
    assignmentId?: string;
    courseId?: string;
    moduleId?: string;
  };
}
```

**`conversations/types/index.ts`:**

```ts
export interface ConversationAssignmentRef {
  id: string;
  title: string;
  courseSlug?: string;
  moduleSlug?: string;
}

export interface ConversationListItem {
  id: string;
  type: ConversationType;
  title: string;
  preview: string;
  updatedAt: string;
  unread: number;
  /** Resolved from metadata for `assignment` conversations. */
  assignment?: ConversationAssignmentRef;
  /** Display name of the peer in `direct`/`support` conversations. */
  otherName?: string;
  /** Course title lifted from metadata (assignment conversations). */
  courseName?: string;
}
```

**`messaging/types/api.types.ts`:**

```ts
export type ApiConversationType = "direct" | "group" | "assignment" | "announcement" | "course";

export interface ApiConversation {
  _id: string;
  type: ApiConversationType;
  /** Participants as ids OR inline objects (backend accepts both). */
  participants: Array<string | { _id: string; firstName?: string; lastName?: string; email?: string }>;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ApiMessageSender {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string;
}

export type ApiMessageType = "text" | "file" | "audio" | "video" | "system";

export interface ApiMessage {
  _id: string;
  conversationId: string;
  sender: string | ApiMessageSender;
  content: string;
  type?: ApiMessageType;
  createdAt: string;
  updatedAt?: string;
  isDeleted?: boolean;
}
```

**`messaging/types/index.ts`:**

```ts
export interface Conversation {
  id: string;
  participantIds: string[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  /** Computed by the normaliser from the current auth user id. */
  mine: boolean;
}
```

**`notifications/types/api.types.ts`:**

```ts
export type NotificationType = "grade" | "material" | "assignment" | "announcement";

export interface ApiNotification {
  _id: string;
  type: NotificationType;
  title: string;
  body?: string;
  message?: string;      // backend may send either body or message
  description?: string;  // or description — normaliser picks one
  createdAt: string;
  isRead?: boolean;
  read?: boolean;        // backend exposes either; normaliser coalesces
  actionUrl?: string;
}
```

**`notifications/types/index.ts`:**

```ts
import type { NotificationType } from "./api.types";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;          // coalesced body/message/description
  createdAt: string;
  read: boolean;         // coalesced isRead/read
  actionUrl?: string;
}
```

## 5. shadcn components to use (via MCP)

- `card` (inbox list + notifications page surfaces), `button`, `badge` (unread
  counts, conversation-type tags), `avatar` (participant/sender avatars —
  initials fallback when no `imageUrl`/`profilePicture`), `separator` (dividing
  list rows / feed), `textarea` (the composer), `skeleton` (inbox + thread +
  notifications loading), `tabs` (inbox type filters — All / Direct / Group /
  Assignments / Announcements / Support).
- A dropdown/menu primitive for the **bell** (popover/menu from the registry —
  pick whichever base-vega primitive fits the unread feed) — see §8.
- Icons from `lucide` (bell, bell-off, message-square, users, megaphone,
  life-buoy, paperclip/file/play for the message-type literals, corner-down-left
  send, check/check-check for read states).

## 6. Steps

1. **Extend the mock (Foundation's `mockDatabase.ts`)** — seed:
   - Conversations of all **five types** (direct with a peer, group, ≥1
     assignment conversation with `metadata.assignmentId`/`courseId`, an
     announcement, a support thread), each with seeded `ApiMessage` rows
     (varied senders, staggered `createdAt`, several unread) and
     `unreadCount`s.
   - Notifications (several `isRead: false`) with `createdAt` and a mix of
     `grade`/`material`/`assignment`/`announcement` types with `actionUrl`.
   - Wire the mock's emitter so `sendMessage` (and mark-read toggles) emit
     corresponding events the `useSocket` provider surfaces.
2. **Conversations module** — `api.types` + UI types → `normaliseConversation`
   (the deep port: title/other-name/preview derivation, `unread` lift,
   assignment-chip resolution from `metadata`) → service → queries →
   components (`ConversationListItemRow` → `InboxPageContent` with tabs +
   `inbox-thread` routing).
3. **Messaging module** — `api.types` + UI types → `normaliseMessage` (the
   `mine` flag from the auth user id, `senderName` from id-or-object) →
   service (`getThread`, `sendMessage` mutation appending to the mock) →
   queries (`useThread`, `useSendMessage` with optimistic append) →
   `MessageBubble` → `AssignmentThread` (feed + `textarea` composer; live
   arrival via `useSocket` `message:created`).
4. **Notifications module** — `ApiNotification` + `Notification` types →
   `normaliseNotification` (coalesce `body`/`message`/`description` and
   `isRead`/`read`) → service (list, markRead, markAllRead) → queries
   (`useNotifications`, `useUnreadCount`, `useMarkAllRead`) →
   `NotificationBell` (live count + dropdown feed) + `NotificationsPageContent`
   (lists + marks read on open/tap).
5. **Wire the chrome** — mount `NotificationBell` at the Plan 003 bell trigger;
   wire `use-notification-chime` + `use-title-notifier` to the unread count;
   confirm the `message-toast-listener` consumes `message:created` into a
   toast.
6. **Routes** — point the Plan 002 stubs: `(app)/inbox`, `(app)/notifications`.
7. Verify: `npm run typecheck`, `npm run lint`, dev-boot, then the acceptance
   behaviors in §7.

## 6.5 Architecture brief (see `ARCHITECTURE.md`)

1. **Deepen** — deletion-test each surface:
   - `conversations/normalise.ts` (`normaliseConversation`) is the genuine deep
     module of the inbox: all the **metadata threading and normalisation**
     (type → title/other-name, preview-from-`lastMessage`, `unread` lift,
     and the **assignment chip resolution** from `metadata` into
     `ConversationAssignmentRef`) behind a small pure-function interface. The
     list UI stays thin over it.
   - `messaging/normalise.ts` (`normaliseMessage`) owns the **`mine` flag
     logic** (computed from the auth user id) and the `senderName` derivation
     from the id-or-object `sender` — never duplicated in components.
   - Realtime is a first-class seam: the socket provider from Foundation is
     **reused, not re-abstracted**; the mock emitter already produces
     `message:created`, so both the inbox (re-sort/re-badge) and the open
     thread (live append) derive from the same subscription shape the real
     `useSocket` later provides.
   - The **composer is a mutation behind the API seam**: `useSendMessage`
     appends through the mock handler (which emits the event) with an
     optimistic `ChatMessage`, then reconciles with the socket-confirmed copy.
2. **Seams** — no *new* seam is warranted. Realtime transport already exists
   (socket-provider seam, Foundation); the message composer is just another
   mutation behind the established API-client/mock seam. One rule holds: no new
   abstraction beyond those seams. The bell + inbox aggregation both consume
   the notifications/conversations queries — aggregation is composition, not a
   new seam.
3. **Testability** — the value-adding logic is pure functions: `normaliseConversation`
   is tested against **mock wire fixtures** (copies of seeded conversation rows)
   asserting title/other-name/preview/unread derivation and the assignment-chip
   resolution; `normaliseMessage` asserts `mine` inverts correctly for the
   seeded auth user id and for other senders, plus the id-vs-object sender
   cases; `normaliseNotification` asserts the body/read coalescing. The
   **socket-event → state wiring is tested with a mock emitter** (a stub
   honoring the `useSocket` subscription shape) driving an inbox re-sort and a
   thread append, so the live path is proven without a real socket.
4. **ADR** — record **realtime-via-socket-seam + inbox aggregation**: all
   realtime flows (new message, unread toggle) flow through the Foundation
   socket seam fed by the mock's in-memory emitter — never bespoke
   polling/socket wiring per module — and the inbox is an **aggregation of the
   conversations query + messaging thread + live socket events**, all served
   through normalisers over the API-client seam.

## 7. Acceptance checks

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run dev` boots; `/inbox` and `/notifications` render in the shell
- [ ] Inbox renders the conversation list with **unread badges** and
      **assignment chips** (assignment conversations resolve their
      assignment/course from metadata); the tabs filter the five types
- [ ] Opening an `assignment` conversation shows the thread: messages render
      with `mine`/other styling; the composer **appends to the mock** and the
      new message appears live (in the thread and re-sorted in the inbox)
- [ ] The **bell shows the live unread count** (matching notifications);
      opening a notification / the notifications page marks it read and the
      count decrements
- [ ] Notifications page lists seeded items (several unread) with
      `body`/`read` coalesced from the wire
- [ ] Tab title + chime reflect unread state (`use-title-notifier` /
      `use-notification-chime` wired to the unread query)
- [ ] Pure helpers covered: `normaliseConversation` (mock wire fixtures,
      including assignment-chip resolution), `normaliseMessage` (`mine` + id-vs-
      object sender), `normaliseNotification` (coalescing); socket-event →
      state wiring tested with a **mock emitter**
- [ ] ADR recorded for realtime-via-socket-seam + inbox aggregation

## 8. Open questions / to confirm

- **Bell dropdown primitive** — use a `popover` or `dropdown-menu` from the
  base-vega registry for the bell feed? (Recommend `dropdown-menu`-style or a
  `popover` — confirm which reads better in the TopBar.)
- **`mine` flag source** — confirm the normaliser should compare the sender id
  against the **seeded auth user** (mock login user) as the foundation's
  `authStore` provides it.
- **Assignment chip link** — assignment conversations deep-link to
  `/courses/[...]/assignments/[id]`; confirm the exact route target given the
  Plan 005/006 course/module slug paths.
- **Unread semantics** — does opening a conversation (inbox) mark its messages
  read, or is read-state only per-message on view in the thread? (Source marks
  on thread view; confirm the list badge clears there.)
- **Message-type scope** — the `file|audio|video|system` literals are mirrored
  in types but only `text` is built as composer UI this slice. Confirm deferring
  the media send/preview (later plan).
- **Notifications mark-read granularity** — confirm open-on-tap marks read vs a
  separate "mark all read" affordance (source has both; recommend both).
- **Socket event names** — confirm the exact mock emitter event shapes
  (`message:created`, unread toggle) are whatever `useSocket` already surfaces,
  so the real socket swap at Plan 012 needs no component changes.
