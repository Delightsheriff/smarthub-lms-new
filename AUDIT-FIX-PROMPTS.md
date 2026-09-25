# Fix prompts: legacy-parity audit (2026-09-25)

Every prompt below stands on its own: copy the whole fenced block and hand it
to an agent. When the agent finishes, bring back the prompt ID and the agent's
report for review (e.g. "F3 done"). Nothing moves to the next wave until the
current one has been reviewed.

## Order

| Wave | Prompts | How to run |
|---|---|---|
| 1 — make what exists work | **F1** first, alone. Then F2, F3, F4, F5, F6 | F2–F6 can run in parallel (their files don't overlap) |
| 2 — restore missing features | T1 → T2 ‖ T3 → T4 · L1 · P1 · D1 · B1 | T-series in that order; L1, P1, D1 and B1 in parallel with it |
| 3 — quality | Q1, Q2, Q3 | Q2 any time; Q1 after wave 2; Q3 last |

Design work (glass / motion) comes after these, as agreed.

**Backend rules used in every prompt:**
- `smarthub-api` on `dev` is the contract source.
- `lms-backend-fixes` is the user's own branch. Agents must never check it out, merge it, or commit to it.
- Any fix that needs a backend endpoint that doesn't exist gets reported back, not built.

---

## F1 — API client foundation (run alone, first)

```
ROLE: You are fixing one scoped slice of a Next.js rebuild. Work only on this slice.

REPO: /Users/MAC/Documents/smarthub-projects/smarthub-lms-new (Next.js 16, React 19,
shadcn "base-vega" on Base UI, TanStack Query, NextAuth, vitest).
Read AGENTS.md and plans/DESIGN-SYSTEM.md before you write any code. This is
NOT the Next.js you know: read the relevant guide in node_modules/next/dist/docs/
before you touch any Next API.

READ-ONLY REFERENCES (never edit, checkout, merge, pull or push these):
- Legacy frontend: ~/Documents/smarthub-projects/smarthub/smarthub-core-lms (src/)
- Backend: ~/Documents/smarthub-projects/smarthub/smarthub-api (checked out on `dev`,
  which is the contract source). Read src/routes, src/controllers, src/validators, src/utils.
  Never touch the `lms-backend-fixes` branch. If a fix needs an endpoint the backend
  doesn't have, STOP that item and report it; don't work around it.
  Verify every path, verb and payload field you touch against the backend files.

CODE RULES:
- Port BEHAVIOR from legacy, never its styling.
- Use the shared primitives in plans/DESIGN-SYSTEM.md and shadcn components. Base UI
  takes render={...}, not asChild. A Button that renders a Link or <a> needs
  nativeButton={false}.
- No raw Tailwind palette colors (emerald/amber/red/blue/neutral-* or text-white).
  Use semantic tokens.
- Views driven by a query handle loading, then error (checked BEFORE empty), then empty.
- Module pattern: modules/<domain>/{api,components,config/endpoints.ts,types}.

COMMITS (strict):
- Commit INCREMENTALLY: one commit per numbered item (or smaller). Each commit must
  pass `npm run typecheck`.
- Use `git add <exact paths> && git commit -m "<type(scope): summary>" -- <exact paths>`
  (the add is required for NEW files; list the same paths in both). Never `git add -A`,
  and never run a bare `git commit`. Another agent may be working in this repo at the
  same time.
- The author is the existing git config; don't pass -c user.* or --author.
- NO Co-Authored-By trailer, no "Generated with" line, and no other attribution or
  trailers of any kind.
- Do not push.

DONE MEANS: `npm run typecheck && npm run lint && npm run test && npm run build`
all pass. Paste the real tail of each output.

FINAL REPORT: the commits (hash + subject), each numbered item marked done / partial /
blocked, how you verified each one, any files touched outside "OWNS", and any open
questions.

=== TASK F1: API client foundation ===

OWNS: lib/api/client.ts, other lib/api/*.ts files, and new tests under tests/ for them.

Context: this runs before five other agents that depend on it. Keep the existing
public method signatures (get/post/put/patch/delete/getBlob/upload) backward
compatible; dozens of callers use them.

1. PAGINATION. execRequest returns only response.data.data, so the backend's
   top-level `meta` is thrown away, and paginated endpoints (activity, past webinars,
   recordings) can't page.
   - Find the backend's success/paginated response builder in smarthub-api/src/utils
     and type its meta shape exactly as PaginationMeta.
   - Add apiClient.getPaginated<T>(path, options) returning {data: T; meta: PaginationMeta}.
   - Export the type.
2. ERROR TOASTS. The response interceptor toasts on every failure, including GETs, so
   one failed page can fire a burst of toasts. Find the legacy client
   (grep -r "interceptors" smarthub-core-lms/src/lib) and match it: toast only on
   non-GET requests, and honour a `silent` request option on every method.
3. 402. Restore legacy's handling: redirect to /payments on 402, the same way legacy does.
4. TIMEOUT. Restore the 30s default, and allow a per-request `timeout` override
   (Oreo will need 120000).
5. BLOBS. getBlob must accept `silent`. Return {blob, filename} with the filename
   parsed from Content-Disposition when present; keep a compatible path for the
   existing callers, or update them in this commit and list them.
6. TESTS. Pull the decision logic out into pure helpers (shouldToast(method, silent),
   parseContentDispositionFilename, and the 402 detection) and test them with vitest.

In the report, include the exact signature of getPaginated and the option names, so
later agents can use them.
```

---

## F2 — Auth, session and route safety

```
ROLE: You are fixing one scoped slice of a Next.js rebuild. Work only on this slice.

REPO: /Users/MAC/Documents/smarthub-projects/smarthub-lms-new (Next.js 16, React 19,
shadcn "base-vega" on Base UI, TanStack Query, NextAuth, vitest).
Read AGENTS.md and plans/DESIGN-SYSTEM.md before you write any code (§5 covers the
NextAuth architecture). This is NOT the Next.js you know: read the relevant guide in
node_modules/next/dist/docs/ before you touch any Next API.

READ-ONLY REFERENCES (never edit, checkout, merge, pull or push these):
- Legacy frontend: ~/Documents/smarthub-projects/smarthub/smarthub-core-lms (src/)
- Backend: ~/Documents/smarthub-projects/smarthub/smarthub-api (checked out on `dev`,
  which is the contract source). Read src/routes, src/controllers, src/validators.
  Never touch the `lms-backend-fixes` branch. If a fix needs an endpoint the backend
  doesn't have, STOP that item and report it.
  Verify every path, verb and payload field against the backend files.

CODE RULES:
- Port BEHAVIOR from legacy, never its styling. Use the shared primitives in
  plans/DESIGN-SYSTEM.md and shadcn components.
- Base UI takes render={...}, not asChild. A Button that renders a Link needs
  nativeButton={false}.
- No raw Tailwind palette colors; use semantic tokens.
- Handle loading, then error (checked before empty), then empty.
- lib/api/client.ts was just updated by another agent (F1): it has a `silent` option
  and getPaginated. Use it; don't edit it.

COMMITS (strict):
- Commit INCREMENTALLY: one commit per numbered item (or smaller). Each commit must
  pass `npm run typecheck`.
- Use `git add <exact paths> && git commit -m "<type(scope): summary>" -- <exact paths>`
  (the add is required for NEW files; list the same paths in both). Never `git add -A`,
  and never run a bare `git commit`. Other agents are working in this repo at the
  same time.
- The author is the existing git config; don't override it.
- NO Co-Authored-By trailer, no "Generated with" line, and no attribution trailers
  of any kind.
- Do not push.

DONE MEANS: `npm run typecheck && npm run lint && npm run test && npm run build`
all pass (paste the real output tails), PLUS the live checks listed below.
Start the dev server via .claude/launch.json or `npm run dev`. Check at 375px and
desktop, light and dark, and confirm document.documentElement.scrollWidth ===
clientWidth at 375px on the auth pages.

FINAL REPORT: the commits (hash + subject), each numbered item marked done / partial /
blocked, how you verified each one, any files touched outside "OWNS", and any open
questions.

=== TASK F2: Auth, session and route safety ===

OWNS: modules/auth/**, lib/auth/**, store/slices/authStore.ts,
components/layout/user-menu.tsx (logout only), components/layout/app-shell.tsx,
app/(app)/profile/page-content.tsx (logout only), app/(app)/error.tsx (new),
app/global-error.tsx, app/layout.tsx (viewport export only), app/(auth)/**, tests.

1. LOGOUT DOESN'T END THE SESSION. user-menu.tsx (~L46) and profile page-content.tsx
   (~L110) only clear Zustand, so the NextAuth cookie survives. Use useLogout from
   modules/auth/api/auth.queries.ts (it calls signOut({redirect:false})). Then clear
   the React Query cache (queryClient.clear()) and the role-mode store, then
   router.replace("/login"). Share one helper between both call sites.
   Rename authStore's `logout` to `clearMirror`, and fix its comment: the store
   mirrors the session; it isn't the source of truth.
2. RESET PASSWORD IS REJECTED. ResetPasswordForm.tsx sends {token, newPassword}.
   Check smarthub-api's auth route and validator: it requires
   {token, password, confirmPassword} with a minimum of 8, and checkAllowedFields
   rejects unknown fields. Send exactly those fields, validate min 8, and fix the
   types in modules/auth/types.
   Add the pre-flight GET /auth/verify-reset-token/:token (verify the path) on page
   load, with an "expired or invalid link" state that links to /forgot-password.
3. CHANGE PASSWORD IS REJECTED. ChangePasswordForm.tsx (~L47) omits confirmPassword,
   which the validator requires, and allows a min of 6. Send the validator's exact
   fields, with min 8.
4. ACCEPT INVITATION. AcceptInvitationPageContent pushes to /dashboard with no
   session, so the guard bounces the user to /login with no explanation. Port the
   legacy flow (smarthub-core-lms/src/app/(auth)/accept-invitation and its module
   component):
   - the existing-user branch
   - the phone field
   - names prefilled from verify
   - the verify call made `silent` (no double toast)
   - min 8
   - on success, sign in or route to /login with a success message, whichever
     legacy does
   Align VerifyInvitationResponse with the backend's real response (read the
   controller; the expected shape is {email, role, firstName, lastName, message,
   expiresAt}). grid-cols-2 → sm:grid-cols-2.
5. THE SESSION USER IS FROZEN AT LOGIN. useMe (auth.queries.ts ~L60) is never
   mounted. lib/auth/to-auth-user.ts derives lmsRole from roles[] and hardcodes
   referralEligible: true. Legacy mounts useMe in its AuthenticatedShell; find it.
   - Mount useMe in AppShell and mirror /auth/me into the store.
   - Use the server's lmsRole and referralEligible values.
   - Call useSession().update() after profile or avatar changes, so ProfilePhotoGate
     stops re-prompting after a reload.
   Unit-test toAuthUser.
6. OPEN REDIRECT. modules/auth/lib/next-path.ts accepts "/\\evil.com". Port legacy's
   safeNextPath rules: reject backslashes, "://", a leading "//", and /login loops.
   Add vitest cases for each. In app-shell.tsx (~L57), keep the query string when
   building ?next=.
7. Signed-in users visiting /login are redirected to /dashboard (or next). Remove
   the "Remember me" checkbox unless it actually does something.
8. ERROR BOUNDARIES.
   - Add app/(app)/error.tsx: a segment boundary with a retry button, built from
     shared primitives, that keeps the app chrome.
   - app/global-error.tsx doesn't load globals.css. Give it minimal inline styles so
     it renders readable.
9. VIEWPORT. In app/layout.tsx, maximumScale: 1 blocks pinch-zoom; set it to 5.
   themeColor should use the brand values (light #430330; dark per
   plans/DESIGN-SYSTEM.md).
10. iOS ZOOM. The auth form inputs use text-xs; below 16px, iOS zooms on focus. Use
    the default Input size.

LIVE CHECKS (report each):
- log in → log out → press Back and reload: you must still be logged out
- /reset-password/<garbage-token>: the expired state shows
- /login?next=/\\evil.com: after login you land on /dashboard
- /login while signed in: you're redirected
```

---

## F3 — Messaging and realtime

```
ROLE: You are fixing one scoped slice of a Next.js rebuild. Work only on this slice.

REPO: /Users/MAC/Documents/smarthub-projects/smarthub-lms-new (Next.js 16, React 19,
shadcn "base-vega" on Base UI, TanStack Query, NextAuth, socket.io-client, vitest).
Read AGENTS.md and plans/DESIGN-SYSTEM.md before you write any code. This is NOT the
Next.js you know: read node_modules/next/dist/docs/ before you touch any Next API.

READ-ONLY REFERENCES (never edit, checkout, merge, pull or push these):
- Legacy frontend: ~/Documents/smarthub-projects/smarthub/smarthub-core-lms (src/)
- Backend: ~/Documents/smarthub-projects/smarthub/smarthub-api (checked out on `dev`,
  which is the contract source). Read src/routes, src/controllers, src/validators,
  src/socket.
  Never touch the `lms-backend-fixes` branch. If a fix needs an endpoint or socket
  event the backend doesn't have, STOP that item and report it.

CODE RULES:
- Port BEHAVIOR from legacy, never its styling. Use the shared primitives in
  plans/DESIGN-SYSTEM.md and shadcn components.
- Base UI takes render={...}, not asChild; Button-as-link needs nativeButton={false}.
- No raw Tailwind palette colors. Filters use Select or FilterDropdown, not Tabs.
  Active states are solid.
- Handle loading, then error (before empty), then empty.
- lib/api/client.ts (F1) has `silent` and getPaginated. Use them; don't edit the client.

COMMITS (strict):
- Commit INCREMENTALLY: one commit per numbered item (or smaller). Each must pass
  `npm run typecheck`.
- Use `git add <exact paths> && git commit -m "<type(scope): summary>" -- <exact paths>`
  (the add is required for NEW files; list the same paths in both). Never `git add -A`,
  and never run a bare `git commit`. Other agents are working concurrently.
- Existing git config is the author. NO Co-Authored-By, no "Generated with", no
  attribution trailers of any kind.
- Do not push.

DONE MEANS: `npm run typecheck && npm run lint && npm run test && npm run build`
all pass (paste the output tails), plus live checks at 375px and desktop, light and
dark, with no horizontal overflow at 375px on /inbox.

FINAL REPORT: the commits, each item marked done / partial / blocked, the
verification for each, files touched outside "OWNS", and open questions.

=== TASK F3: Messaging and realtime ===

OWNS: modules/messaging/**, modules/conversations/**, lib/socket/**,
components/layout/message-toast-listener.tsx, AssignmentThread.tsx (wherever it
lives; find it), and tests.

1. HARD-CODED USER. modules/conversations/api/normalise.ts and
   modules/messaging/api/normalise.ts default currentUserId to "usr_1". The backend
   stores unread counts per user id, so every unread badge reads 0 and "mine"
   bubbles are wrong.
   - Remove the default.
   - Pass the signed-in user's _id from the session/auth store into both normalisers.
   - Include the user id in the query keys.
   Unit-test unreadCount and isMine with a real id.
2. WRONG MESSAGE ENDPOINTS. modules/messaging/config/endpoints.ts uses
   /lms/conversations/:id/messages. Read smarthub-api/src/routes/lms-routes (the
   messages and conversations route files) and the validator. The expected routes
   are GET /lms/messages/conversation/:id and POST /lms/messages with
   {conversationId, content, type}. Fix the endpoints, service and types. Use
   getPaginated if the list is paginated.
3. SOCKET ADDRESS. lib/socket/socket-provider.tsx falls back to NEXT_PUBLIC_API_URL
   (…/api-proxy), and socket.io reads that path as a namespace on the Next server.
   Read legacy's socket provider and do what it does: use NEXT_PUBLIC_SOCKET_URL, or
   derive the API origin. Also read smarthub-api/src/socket/index.ts for the auth
   handshake it expects. Warn once in dev if the URL is missing.
4. REALTIME EVENTS. AssignmentThread listens for and emits "message:created", which
   the backend never handles. Read smarthub-api/src/socket (emit.ts and the handlers)
   for the real event names, then:
   - join the conversation room on mount and leave it on unmount
   - listen for "message:new" and append the message to the thread's query cache,
     de-duplicating by _id
   - remove the client-side emit (sends go through POST)
5. TOAST LISTENER. message-toast-listener.tsx expects {conversationId, message}, but
   the backend emits the bare message. Read the payload fields from the message
   itself. Also listen for "conversation:updated" (sent to the user's personal room)
   and invalidate the conversation list and unread badge queries. Don't toast for
   your own messages or for the thread that's currently open.
6. SILENT MARK-READ. InboxPageContent marks the first thread read automatically; on
   mobile the pane sits below the list, so threads get cleared unseen. Mark read only
   on an explicit select, or when the thread pane is actually visible.
7. MOBILE INBOX. Make the inbox master/detail below md: the list, then the thread
   full-screen with a back button. Replace the six filter Tabs with
   FilterDropdown/Select (a design-system non-negotiable).
   ConversationListItemRow is a div with onClick that wraps a Link. Make it a single
   accessible link or button. Selected rows get a solid active state, not bg-muted/70.

LIVE CHECKS (report each): the socket connects (Network shows the websocket 101
upgrade to the right host); opening a thread emits the join; sending a message works
end to end; unread counts are non-zero for a conversation with unread messages; there
is no overflow at 375px. If you have two accounts, show a message arriving live in a
second session.
```

---

## F4 — Endpoint contract fixes (activity, Oreo, push, webinars)

```
ROLE: You are fixing one scoped slice of a Next.js rebuild. Work only on this slice.

REPO: /Users/MAC/Documents/smarthub-projects/smarthub-lms-new (Next.js 16, React 19,
shadcn "base-vega" on Base UI, TanStack Query, NextAuth, vitest).
Read AGENTS.md and plans/DESIGN-SYSTEM.md before you write any code. This is NOT the
Next.js you know: read node_modules/next/dist/docs/ before you touch any Next API
(including route handlers, if you proxy a stream).

READ-ONLY REFERENCES (never edit, checkout, merge, pull or push these):
- Legacy frontend: ~/Documents/smarthub-projects/smarthub/smarthub-core-lms (src/)
- Backend: ~/Documents/smarthub-projects/smarthub/smarthub-api (checked out on `dev`,
  which is the contract source). The route mounts are in
  src/routes/lms-routes/index.ts and src/routes/index.ts.
  Never touch the `lms-backend-fixes` branch. If an endpoint doesn't exist, STOP that
  item and report it.

CODE RULES:
- Port BEHAVIOR from legacy, never its styling. Use the shared primitives and shadcn
  components. Base UI takes render={...}; Button-as-link needs nativeButton={false}.
- No raw Tailwind palette colors.
- Handle loading, then error (before empty), then empty.
- lib/api/client.ts (F1) has `silent`, `timeout` and getPaginated. Use them; don't
  edit the client.

COMMITS (strict):
- Commit INCREMENTALLY: one commit per numbered item. Each must pass
  `npm run typecheck`.
- Use `git add <exact paths> && git commit -m "<type(scope): summary>" -- <exact paths>`
  (the add is required for NEW files; list the same paths in both). Never `git add -A`,
  and never run a bare `git commit`. Other agents are working concurrently.
- Existing git config is the author. NO Co-Authored-By, no "Generated with", no
  attribution trailers of any kind.
- Do not push.

DONE MEANS: `npm run typecheck && npm run lint && npm run test && npm run build`
all pass (paste the output tails), plus live checks of /activity, /oreo and /webinars
at 375px and desktop.

FINAL REPORT: the commits, each item marked done / partial / blocked, the
verification for each, files touched outside "OWNS", and open questions.

=== TASK F4: Endpoint contract fixes ===

OWNS: modules/activity/**, modules/oreo/**, modules/push/api/** and
modules/push/config/** (NOT push UI; another agent owns that later),
modules/webinars/api/**, modules/webinars/components/WebinarCard.tsx, any Oreo
route handler under app/api/, and tests.

1. ACTIVITY. modules/activity/config/endpoints.ts uses /lms/activity; the backend
   mounts /lms/activities (index.ts:65). Read the activity route file for the exact
   subpath (likely /me). Use getPaginated, and wire paging to the shared Pager
   component (components/ui/pager.tsx).
2. OREO.
   - Endpoints: /lms/oreo/ask → the real path under the /lms/oreo mount (read the ask
     route file; likely POST /lms/oreo). Likewise the stream path (likely
     /lms/oreo/stream). Check whether USAGE exists; remove it if it doesn't.
   - Payload: send {question, history, mode} exactly as legacy does
     (smarthub-core-lms/src/modules/oreo/api/oreo.service.ts). Cross-check the
     validator.
   - Timeout: 120000 on the ask call.
   - Streaming: port legacy's stream reader. If the browser can't reach the stream
     directly because of auth, add a Next route handler that proxies it with the
     session token, streaming the body through without buffering.
   - UI: render tokens incrementally, with a Stop button (AbortController) and a
     fallback to the one-shot call if streaming fails.
3. PUSH (service and config only).
   - The config uses /lms/push/*, but the backend mounts push at /push/* (not under
     /lms). Verify in src/routes/index.ts.
   - Unsubscribe sends `endpoint` as a query param, while the controller reads
     req.body.endpoint. Send it in the body.
   - Check each push endpoint's payload against the controller.
4. PAST WEBINARS CRASH. The past-webinars service calls .map on undefined because
   meta and data were stripped. Use getPaginated and page it.
   WebinarCard.tsx:
   - A disabled "Join" rendered as a link still navigates. When there's no join URL,
     render a real disabled Button (not a link).
   - "Registration Closed" is shown whenever the join link is missing. Derive the
     label from the real state fields on the webinar (read the model and controller).
5. TESTS. Add service tests with a mocked apiClient that assert the path, verb and
   payload for activity, oreo, push and webinars.
```

---

## F5 — Student submissions and completion progress

```
ROLE: You are fixing one scoped slice of a Next.js rebuild. Work only on this slice.

REPO: /Users/MAC/Documents/smarthub-projects/smarthub-lms-new (Next.js 16, React 19,
shadcn "base-vega" on Base UI, TanStack Query, NextAuth, vitest).
Read AGENTS.md and plans/DESIGN-SYSTEM.md before you write any code. This is NOT the
Next.js you know: read node_modules/next/dist/docs/ before you touch any Next API.

READ-ONLY REFERENCES (never edit, checkout, merge, pull or push these):
- Legacy frontend: ~/Documents/smarthub-projects/smarthub/smarthub-core-lms (src/)
- Backend: ~/Documents/smarthub-projects/smarthub/smarthub-api (checked out on `dev`,
  which is the contract source). Read src/routes, src/controllers, src/validators,
  src/models.
  Never touch the `lms-backend-fixes` branch. If an endpoint doesn't exist, STOP that
  item and report it.

CODE RULES:
- Port BEHAVIOR from legacy, never its styling. Use the shared primitives
  (StatusBadge, EmptyState, RichText, …) and shadcn components.
- Base UI takes render={...}; Button-as-link needs nativeButton={false}.
- No raw Tailwind palette colors or gradients; use tokens. Motion needs a reason.
- Handle loading, then error (before empty), then empty.
- lib/api/client.ts (F1) has `silent` and getPaginated. Use them; don't edit the client.

COMMITS (strict):
- Commit INCREMENTALLY: one commit per numbered item (or smaller). Each must pass
  `npm run typecheck`.
- Use `git add <exact paths> && git commit -m "<type(scope): summary>" -- <exact paths>`
  (the add is required for NEW files; list the same paths in both). Never `git add -A`,
  and never run a bare `git commit`. Other agents are working concurrently.
- Existing git config is the author. NO Co-Authored-By, no "Generated with", no
  attribution trailers of any kind.
- Do not push.

DONE MEANS: `npm run typecheck && npm run lint && npm run test && npm run build`
all pass (paste the output tails), plus live checks on the assignment and recordings
pages at 375px and desktop, light and dark.

FINAL REPORT: the commits, each item marked done / partial / blocked, the
verification for each, files touched outside "OWNS", and open questions.

=== TASK F5: Student submissions and completion progress ===

OWNS: modules/assignments/api/**, modules/assignments/components/assignment-page-content.tsx,
modules/learning/api/**, modules/learning/config/**, modules/learning/types/**,
modules/learning/components/recording-player-dialog.tsx,
modules/learning/components/recordings-page-content.tsx, the tick/progress logic in
modules/learning/components/module-section.tsx and course-outline.tsx (progress
only), modules/progress/**,
app/(app)/courses/[slug]/modules/[moduleSlug]/assignments/[assignmentId]/page.tsx,
and tests.

1. STUDENTS NEVER SEE THEIR OWN SUBMISSION. In
   modules/assignments/api/assignments.service.ts, getMySubmission matches
   `s.assignment === assignmentId`. But /lms/submissions/student returns `assignment`
   as a populated object and pages at 10, so the lookup always returns null. Students
   then see no status, grade or history, and "Start Submission" creates duplicates.
   Legacy fixed this by reading the `submission` embedded in GET
   /lms/assignments/:id (see smarthub-core-lms/src/modules/assignments/api/assignments.queries.ts
   around L170 and the assignment controller). Do the same, drop the client-side
   scan, and unit-test the selection.
2. RESUBMIT WINDOW. In assignment-page-content.tsx (~L78, ~L113), the window only
   closes when there's no submission, so a past-due, late-disallowed student still
   sees "Resubmit" and the backend rejects it. Compute
   pastDue && !allowLateSubmission whether or not a submission exists (legacy:
   src/app/(app)/courses/[slug]/modules/[moduleSlug]/assignments/[assignmentId]/page.tsx
   ~L84). Match legacy for graded submissions: can a graded submission be
   resubmitted? Pull it into a pure predicate and unit-test it.
3. COMPLETION TRACKING. Port legacy commit a340fcb ("Let students mark recordings
   complete"). Run `git show a340fcb` in the legacy repo first.
   - Add LEARNING_ENDPOINTS.PROGRESS (GET/POST/DELETE /lms/progress — verify the
     route and validator).
   - Add the service methods, and useCourseProgress, useAllProgress and
     useToggleContentComplete (optimistic, with rollback).
   - Drive every watched/completed tick from progress: module-section,
     course-outline, the Recordings page Watched/Unwatched filter, the completed
     count, and "next to watch".
   - Stop reading recording.watched; the backend never sets it (grep the API to
     confirm).
4. RECORDING PLAYER (recording-player-dialog.tsx).
   - "Mark as watched" calls PATCH /recordings/:id/view, which is only a view
     counter, and it fires on every timeupdate after 80%. Make /view a single ping
     when the dialog opens (guarded by a ref).
   - Mark complete via the progress POST once at 80% (guarded by a ref), plus an
     explicit toggle button.
   - Replace the raw emerald/neutral classes (about six places) and the bg-gradient
     with tokens.
   - The description is TipTap HTML shown as plain text in DialogDescription. Render
     it with RichText.
   - Remove the animate-ping dot.
   - Add nativeButton={false} on the Button-as-link sites (~L203, ~L247).
5. The course-scoped assignment route drops `slug` and `moduleSlug`. Pass them
   through so the back link goes to the module and the module title resolves. Use
   legacy's useAssignment(id, courseSlug) cache path where it helps.
6. On the Recordings page, show the error state before the empty state.

LIVE CHECKS (report each):
- open an assignment you have submitted: the status and grade show, and there is no
  "Start Submission"
- mark a recording complete: the tick appears and persists after a reload
- the network shows exactly one /view PATCH per open
```

---

## F6 — Teaching quick fixes

```
ROLE: You are fixing one scoped slice of a Next.js rebuild. Work only on this slice.

REPO: /Users/MAC/Documents/smarthub-projects/smarthub-lms-new (Next.js 16, React 19,
shadcn "base-vega" on Base UI, TanStack Query, NextAuth, vitest).
Read AGENTS.md and plans/DESIGN-SYSTEM.md before you write any code. This is NOT the
Next.js you know: read node_modules/next/dist/docs/ before you touch any Next API
(useSearchParams and the router especially).

READ-ONLY REFERENCES (never edit, checkout, merge, pull or push these):
- Legacy frontend: ~/Documents/smarthub-projects/smarthub/smarthub-core-lms (src/)
- Backend: ~/Documents/smarthub-projects/smarthub/smarthub-api (checked out on `dev`,
  which is the contract source). Read src/routes, src/controllers, src/validators.
  Never touch the `lms-backend-fixes` branch. If an endpoint doesn't exist, STOP that
  item and report it.

CODE RULES:
- Port BEHAVIOR from legacy, never its styling. Use the shared primitives and shadcn
  components. Base UI takes render={...}; Button-as-link needs nativeButton={false}.
- No raw Tailwind palette colors. Filters use Select, not Tabs.
- Handle loading, then error (before empty), then empty.
- lib/api/client.ts (F1) has `silent` and getPaginated. Use them; don't edit it.

COMMITS (strict):
- Commit INCREMENTALLY: one commit per numbered item. Each must pass
  `npm run typecheck`.
- Use `git add <exact paths> && git commit -m "<type(scope): summary>" -- <exact paths>`
  (the add is required for NEW files; list the same paths in both). Never `git add -A`,
  and never run a bare `git commit`. Other agents are working concurrently.
- Existing git config is the author. NO Co-Authored-By, no "Generated with", no
  attribution trailers of any kind.
- Do not push.

DONE MEANS: `npm run typecheck && npm run lint && npm run test && npm run build`
all pass (paste the output tails), plus live checks on /teach/cohorts/<id> at 375px
and desktop, light and dark.

FINAL REPORT: the commits, each item marked done / partial / blocked, the
verification for each, files touched outside "OWNS", and open questions.

=== TASK F6: Teaching quick fixes ===

OWNS: modules/teaching/components/{CohortDetailPageContent,CohortAssignmentsTab,
CohortSessionsTab,CohortSubmissionsTab,CohortRosterTab,GradingDialog}.tsx,
modules/teaching/config/endpoints.ts, modules/teaching/api/teaching.service.ts,
modules/teaching/api/teaching.queries.ts, modules/teaching/types/**, and tests.

1. TAB DEEP LINKS ARE IGNORED. CohortDetailPageContent (~L26) holds the tab in
   useState("overview") and never reads ?tab=, so all 11 teach redirect stubs (e.g.
   ?tab=assignments) land on Overview. Keep the tab in the URL: read ?tab= and
   validate it against the known tabs; on change, call router.replace with
   scroll: false. Refresh and share must preserve the tab.
2. VISIBILITY TOGGLE HITS A MISSING ROUTE. UPDATE_ASSIGNMENT builds
   PUT /lms/teaching/assignments/:attId, but the backend's teaching router has no
   such route. The real one is PATCH /lms/assignments/:assignmentId/schedules/:scheduleId
   (smarthub-api/src/routes/lms-routes/assignments.lms.routes.ts ~L108; read its
   validator for the body fields). Legacy calls it too; find the call in
   smarthub-core-lms/src/modules/teaching/api. Fix the endpoint, verb, arguments
   (assignment id + schedule id) and service, and invalidate the right queries.
3. VISIBILITY LOGIC. In CohortAssignmentsTab (~L68-69), the switch shows
   checked={isVisible ?? true}, but toggling sends !(!!undefined) === true, so
   switching off an assignment that shows as visible does nothing. Send
   !(asgn.isVisible ?? true). Give the Switch an aria-label that includes the
   assignment title.
4. MOCK ID. CohortSessionsTab (~L60) links to
   /teaching/sessions/${event.sourceId || "cs_1"}. Remove the fallback and hide the
   button when sourceId is missing.
5. GRADING.
   - GradingDialog (~L55) initialises score as score ?? 0, so a single click records
     a zero. Start it empty and make it required, validated as 0..assignment total
     (read the grade validator).
   - The catch at ~L61 swallows errors. Show the error inline in the dialog and keep
     the dialog open.
   - Confirm the payload matches PATCH /lms/teaching/submissions/:id/grade
     {score, generalFeedback}.
6. ERROR STATES. The roster, assignments, submissions and sessions tabs never check
   `error`, so a failed query renders "No students" and similar. Add an error state
   with retry to each, checked before the empty state.
7. FILTER CONTROL. CohortSubmissionsTab (~L59) uses Tabs for the all/pending/graded
   filter; with counts it overflows on mobile. Switch to Select (the design rule).
   Keep the counts in the option labels.

LIVE CHECKS (report each):
- /teach/cohorts/<id>?tab=assignments opens the Assignments tab
- toggle visibility: the network shows the PATCH to the real route with 2xx, and the
  state flips both ways
- the grading dialog can't submit an empty score
- no overflow at 375px
```

---

## T1 — Instructor student page, grading brief, assignment detail (legacy 0bcf039 + d16ff69)

```
ROLE: You are building one scoped slice of a Next.js rebuild. Work only on this slice.

REPO: /Users/MAC/Documents/smarthub-projects/smarthub-lms-new (Next.js 16, React 19,
shadcn "base-vega" on Base UI, TanStack Query, NextAuth, vitest).
Read AGENTS.md and plans/DESIGN-SYSTEM.md before you write any code. Its design
language is masthead headers, hero+ledger layouts, bento tiles and magazine-index
lists — NOT stacked cards; use its shared-primitive registry. This is NOT the Next.js
you know: read node_modules/next/dist/docs/ before you touch any Next API (dynamic
route params are async in this version; check).

READ-ONLY REFERENCES (never edit, checkout, merge, pull or push these):
- Legacy frontend: ~/Documents/smarthub-projects/smarthub/smarthub-core-lms (src/)
- Backend: ~/Documents/smarthub-projects/smarthub/smarthub-api (checked out on `dev`,
  which is the contract source). Read src/routes, src/controllers, src/validators.
  Never touch the `lms-backend-fixes` branch. If an endpoint doesn't exist, STOP that
  item and report it.

CODE RULES:
- Port BEHAVIOR from legacy, never its styling. Legacy uses raw bg-emerald-50,
  text-red-700 and the like; do not copy those. Use StatusBadge and tokens.
- Base UI takes render={...}; Button-as-link needs nativeButton={false}.
- No raw Tailwind palette colors. Filters use Select. Active states are solid.
- Handle loading, then error (before empty), then empty.
- lib/api/client.ts has `silent` and getPaginated. Don't edit it.

COMMITS (strict):
- Commit INCREMENTALLY: one commit per numbered item (or smaller). Each must pass
  `npm run typecheck`.
- Use `git add <exact paths> && git commit -m "<type(scope): summary>" -- <exact paths>`
  (the add is required for NEW files; list the same paths in both). Never `git add -A`,
  and never run a bare `git commit`. Other agents are working concurrently.
- Existing git config is the author. NO Co-Authored-By, no "Generated with", no
  attribution trailers of any kind.
- Do not push.

DONE MEANS: `npm run typecheck && npm run lint && npm run test && npm run build`
all pass (paste the output tails), plus the live checks below at 375px and desktop,
light and dark, with no overflow at 375px.

FINAL REPORT: the commits, each item marked done / partial / blocked, the
verification for each, files touched outside "OWNS", and open questions.

=== TASK T1: Instructor student page, grading brief, assignment detail ===

First, read the two legacy commits: in the legacy repo run `git show 0bcf039` and
`git show d16ff69`. This repo's route param is [scheduleId]; legacy's is [id].

OWNS:
- app/(app)/teach/cohorts/[scheduleId]/students/[studentId]/page.tsx (new)
- app/(app)/teach/cohorts/[scheduleId]/assignments/[assignmentId]/page.tsx (replace
  the redirect stub)
- modules/teaching/components/CohortStudentPageContent.tsx (new)
- modules/teaching/components/CohortAssignmentDetail.tsx (new)
- modules/teaching/components/CohortRosterTab.tsx
- modules/teaching/components/GradingDialog.tsx
- modules/teaching/components/StudentAttendanceSheet.tsx (delete)
- modules/teaching/types/attendance.ts
- modules/teaching/{api,config}/* (append-only)
- tests

1. API LAYER.
   - Endpoint COHORT_STUDENT_ASSIGNMENTS → /lms/teaching/cohorts/:scheduleId/students/:studentId/assignments.
     Verify it in smarthub-api/src/routes/lms-routes/teaching.lms.routes.ts; note the
     recent API commits 196c6cc and b769caa, which make the student param accept a
     user id.
   - Service getCohortStudentAssignments, and hook useCohortStudentAssignments with
     key ["teaching","cohort",scheduleId,"student-assignments",studentId].
   - Port the types CohortStudentAssignmentRow and CohortStudentAssignments from
     legacy types/attendance.ts.
   - useGradeSubmission must also invalidate the new key.
2. STUDENT PAGE (CohortStudentPageContent), in the editorial layout: a masthead with
   the student's name and cohort, a row of StatTile, then IndexList or Ledger
   sections.
   - Six figures: Submitted x/y, Not submitted, Late, Average grade, Attendance %,
     Classes attended x/held. Compute them exactly as legacy does.
   - Coursework: a row per assignment with StatusBadge; due / sent / days-late /
     draft notes; score/total. Ungraded rows that have a submission get a
     "Review & mark" link to
     /teach/cohorts/<id>/assignments/<assignmentId>?submission=<submissionId>&student=<studentId>.
   - Attendance: the 12 most recent sessions with a "Showing 12 of N" note, cancelled
     sessions dimmed, notes shown.
   - Separate error and empty states for coursework and attendance.
   - A back link to ?tab=roster.
   - Previous/next student navigation, following roster order.
3. ROSTER. In CohortRosterTab, each row links to the student page (IndexRow with an
   href). Remove the "Attendance Record" button, delete StudentAttendanceSheet.tsx,
   and remove its imports.
4. ASSIGNMENT DETAIL (CohortAssignmentDetail, replacing the redirect stub).
   - Port legacy's CohortAssignmentDetail: the brief, the submissions list, the
     not-submitted list, and a grade action per submission.
   - Deep link: auto-open GradingDialog from ?submission=<id>. If that id isn't
     found, fall back to the latest submission from ?student=<id> (a resubmission
     changes the id). Guard it with a ref so it opens once per link.
5. GRADING DIALOG.
   - Add a collapsed "The question" section showing the description (RichText),
     instructions and attached link.
   - Fetch it with useTeachingAssignment → GET /lms/assignments/:assignmentId (verify
     the path), ONLY while the dialog is open (enabled: open && !!assignmentId).
     Legacy fetches whenever a submission prop is set; don't copy that.
   - Add "Save & next ungraded", which moves to the next ungraded submission in the
     current list.

LIVE CHECKS (report each):
roster → student page → "Review & mark" → the dialog opens on that exact submission →
grade → back on the student page, the figures and the row update without a manual
refresh. Network: the brief is not fetched until the dialog opens.
```

---

## T2 — Instructor assignment authoring

```
ROLE: You are building one scoped slice of a Next.js rebuild. Work only on this slice.

REPO: /Users/MAC/Documents/smarthub-projects/smarthub-lms-new (Next.js 16, React 19,
shadcn "base-vega" on Base UI, TanStack Query, react-hook-form + zod, NextAuth, vitest).
Read AGENTS.md and plans/DESIGN-SYSTEM.md before you write any code, and use its
shared-primitive registry. This is NOT the Next.js you know: read
node_modules/next/dist/docs/ before you touch any Next API.

READ-ONLY REFERENCES (never edit, checkout, merge, pull or push these):
- Legacy frontend: ~/Documents/smarthub-projects/smarthub/smarthub-core-lms (src/)
- Backend: ~/Documents/smarthub-projects/smarthub/smarthub-api (checked out on `dev`,
  which is the contract source). Read src/routes, src/controllers, src/validators.
  Never touch the `lms-backend-fixes` branch. If an endpoint doesn't exist, STOP that
  item and report it.

CODE RULES:
- Port BEHAVIOR from legacy, never its styling. Base UI takes render={...};
  Button-as-link needs nativeButton={false}.
- No raw Tailwind palette colors. Select for choices. Destructive actions confirm
  with AlertDialog.
- Handle loading, then error (before empty), then empty.
- lib/api/client.ts has `silent`, getPaginated and an upload helper. Don't edit it.

COMMITS (strict):
- Commit INCREMENTALLY: one commit per numbered item (or smaller). Each must pass
  `npm run typecheck`.
- Use `git add <exact paths> && git commit -m "<type(scope): summary>" -- <exact paths>`
  (the add is required for NEW files; list the same paths in both). Never `git add -A`,
  and never run a bare `git commit`. Other agents are working concurrently; T3 is
  editing the same teaching api/config files, so ONLY APPEND there and re-read each
  file right before you edit it.
- Existing git config is the author. NO Co-Authored-By, no "Generated with", no
  attribution trailers of any kind.
- Do not push.

DONE MEANS: `npm run typecheck && npm run lint && npm run test && npm run build`
all pass (paste the output tails), plus the live checks below at 375px and desktop,
light and dark.

FINAL REPORT: the commits, each item marked done / partial / blocked, the
verification for each, files touched outside "OWNS", and open questions.

=== TASK T2: Instructor assignment authoring ===

The three authoring routes are currently redirect stubs. Legacy sources:
smarthub-core-lms/src/modules/teaching/components/{AssignmentForm,CreateAssignmentMultiCohort,
AttachExistingAssignmentDialog,EditCohortAssignmentScheduleDialog,EditCohortDueDateDialog}.tsx,
src/modules/teaching/api/upload.ts, and src/app/(app)/teach/**/assignments/**.

OWNS:
- app/(app)/teach/assignments/new/page.tsx
- app/(app)/teach/cohorts/[scheduleId]/assignments/new/page.tsx
- app/(app)/teach/cohorts/[scheduleId]/assignments/[assignmentId]/edit/page.tsx
- the new component files named above, under modules/teaching/components/
- modules/teaching/api/upload.ts (new)
- CohortAssignmentsTab.tsx (row menu only)
- modules/teaching/{api,config,types} (append-only)
- tests

Shared editor primitives: components/ui/rich-text-editor.tsx and link-rows-input.tsx
are owned by T3. If they exist, import them. If they don't exist yet, stop and report,
rather than creating a duplicate.

1. API. Port every ASSIGNMENT_*, MODULE_ASSIGNMENTS and MY_MODULES endpoint, service
   function and query hook that these components use. Verify each path, verb and body
   against smarthub-api (assignments.lms.routes.ts, teaching.lms.routes.ts and their
   validators). Mutations invalidate the cohort assignments list and the detail queries.
2. ASSIGNMENT FORM. Use react-hook-form + zod, mirroring the backend validator
   exactly: title, rich-text description/instructions, total score, due date,
   allowLateSubmission, link rows, file attachments via upload.ts, and the module the
   assignment belongs to. Put the fields in the editorial form layout (a single reading
   column with the section headings from plans/DESIGN-SYSTEM.md). Show field errors
   inline.
3. CREATE, per cohort and multi-cohort. Replace both /new stubs. The multi-cohort flow
   (CreateAssignmentMultiCohort) picks the target cohorts and the per-cohort due dates,
   as legacy does.
4. EDIT. Replace the edit stub; prefill from GET /lms/assignments/:id.
5. ATTACH EXISTING. Port AttachExistingAssignmentDialog: search or list the module's
   assignments that aren't attached to this cohort, then attach.
6. ROW MENU in CohortAssignmentsTab, using DropdownMenu:
   - edit due date (EditCohortDueDateDialog)
   - edit schedule/visibility (EditCohortAssignmentScheduleDialog)
   - open submissions (→ the detail page)
   - edit (→ the edit page)
   - detach, with an AlertDialog confirm
   Rows link to /teach/cohorts/<id>/assignments/<assignmentId>. Mirror legacy commits
   912402d and c94bf39 for which items appear when.

LIVE CHECKS (report each): create an assignment for one cohort, edit it, change its due
date, toggle visibility, detach it with confirmation, and attach it back. Every call
returns 2xx (show the network entries).
```

---

## T3 — Instructor materials and recordings authoring + editor primitives

```
ROLE: You are building one scoped slice of a Next.js rebuild. Work only on this slice.

REPO: /Users/MAC/Documents/smarthub-projects/smarthub-lms-new (Next.js 16, React 19,
shadcn "base-vega" on Base UI, TanStack Query, react-hook-form + zod, TipTap,
NextAuth, vitest).
Read AGENTS.md and plans/DESIGN-SYSTEM.md before you write any code, and use its
shared-primitive registry. This is NOT the Next.js you know: read
node_modules/next/dist/docs/ before you touch any Next API.

READ-ONLY REFERENCES (never edit, checkout, merge, pull or push these):
- Legacy frontend: ~/Documents/smarthub-projects/smarthub/smarthub-core-lms (src/)
- Backend: ~/Documents/smarthub-projects/smarthub/smarthub-api (checked out on `dev`,
  which is the contract source). Read src/routes, src/controllers, src/validators.
  Never touch the `lms-backend-fixes` branch. If an endpoint doesn't exist, STOP that
  item and report it.

CODE RULES:
- Port BEHAVIOR from legacy, never its styling. Base UI takes render={...};
  Button-as-link needs nativeButton={false}.
- No raw Tailwind palette colors. Select for choices. Destructive actions use an
  AlertDialog confirm.
- Handle loading, then error (before empty), then empty.
- lib/api/client.ts has `silent`, getPaginated and upload. Don't edit it.

COMMITS (strict):
- Commit INCREMENTALLY: one commit per numbered item (or smaller). Each must pass
  `npm run typecheck`.
- Use `git add <exact paths> && git commit -m "<type(scope): summary>" -- <exact paths>`
  (the add is required for NEW files; list the same paths in both). Never `git add -A`,
  and never run a bare `git commit`. T2 is editing the same teaching api/config files
  concurrently, so ONLY APPEND there and re-read each file right before you edit it.
- Existing git config is the author. NO Co-Authored-By, no "Generated with", no
  attribution trailers of any kind.
- Do not push.

DONE MEANS: `npm run typecheck && npm run lint && npm run test && npm run build`
all pass (paste the output tails), plus the live checks below at 375px and desktop,
light and dark.

FINAL REPORT: the commits, each item marked done / partial / blocked, the
verification for each, files touched outside "OWNS", and open questions.

=== TASK T3: Materials and recordings authoring, plus editor primitives ===

OWNS:
- components/ui/rich-text-editor.tsx, link-rows-input.tsx, copyable-email.tsx,
  user-avatar.tsx (new; port from legacy src/components/ui, restyled to tokens, and
  check that the registry doesn't already cover them)
- the plans/DESIGN-SYSTEM.md registry table (add the new primitives)
- every page under app/(app)/teach/cohorts/[scheduleId]/materials/** and
  .../recordings/** (replace the redirect stubs)
- modules/teaching/components/{MaterialForm,RecordingForm,CohortMaterialDetail,
  CohortRecordingDetail,AttachExistingRecordingDialog}.tsx (new)
- modules/teaching/{api,config,types} (append-only: MATERIAL_*, RECORDING_*,
  COHORT_RECORDINGS)
- tests

1. PRIMITIVES FIRST (T2 is waiting on them). Commit rich-text-editor and
   link-rows-input before anything else. Content rendered from the editor must go
   through components/ui/rich-text.tsx, which already sanitises with DOMPurify.
2. API. Port every materials and recordings endpoint, service and hook that legacy's
   components use. Verify each against smarthub-api. Also port legacy commit afa8545
   (paginated cohort recordings) using getPaginated and the Pager.
3. MATERIALS: list, detail, create and edit pages, plus MaterialForm (file upload +
   links). Per legacy commit 2a6285c, materials have no per-cohort state: no detach.
4. RECORDINGS: list (paginated), detail, create and edit, plus RecordingForm.
   AttachExistingRecordingDialog lets you attach a recording. Per legacy commits
   912402d and c94bf39, attach/detach rules apply: offer Attach, not Detach, when the
   recording isn't attached. Detach needs an AlertDialog confirm.
5. Layout: an editorial masthead + IndexList for the lists, and a reading column for
   the detail pages. No stacked cards.

LIVE CHECKS (report each): create a material with a file and a link; create a
recording, attach it to the cohort, detach it (with confirm) and re-attach it; page
through the recordings list. Show the network entries, all 2xx.
```

---

## T4 — Module status, cohort switcher, module page, roster extras

```
ROLE: You are building one scoped slice of a Next.js rebuild. Work only on this slice.

REPO: /Users/MAC/Documents/smarthub-projects/smarthub-lms-new (Next.js 16, React 19,
shadcn "base-vega" on Base UI, TanStack Query, NextAuth, vitest).
Read AGENTS.md and plans/DESIGN-SYSTEM.md before you write any code. This is NOT the
Next.js you know: read node_modules/next/dist/docs/ before you touch any Next API
(layouts especially).

READ-ONLY REFERENCES (never edit, checkout, merge, pull or push these):
- Legacy frontend: ~/Documents/smarthub-projects/smarthub/smarthub-core-lms (src/)
- Backend: ~/Documents/smarthub-projects/smarthub/smarthub-api (checked out on `dev`,
  which is the contract source). Never touch the `lms-backend-fixes` branch. If an
  endpoint doesn't exist, STOP that item and report it.

CODE RULES:
- Port BEHAVIOR from legacy, never its styling. Base UI takes render={...};
  Button-as-link needs nativeButton={false}.
- No raw Tailwind palette colors. Select for choices and filters. Active states are
  solid.
- Handle loading, then error (before empty), then empty.
- lib/api/client.ts: don't edit it.

COMMITS (strict):
- Commit INCREMENTALLY: one commit per numbered item. Each must pass
  `npm run typecheck`.
- Use `git add <exact paths> && git commit -m "<type(scope): summary>" -- <exact paths>`
  (the add is required for NEW files; list the same paths in both). Never `git add -A`,
  and never run a bare `git commit`.
- Existing git config is the author. NO Co-Authored-By, no "Generated with", no
  attribution trailers of any kind.
- Do not push.

DONE MEANS: `npm run typecheck && npm run lint && npm run test && npm run build`
all pass (paste the output tails), plus live checks at 375px and desktop, light and
dark.

FINAL REPORT: the commits, each item marked done / partial / blocked, the
verification for each, files touched outside "OWNS", and open questions.

=== TASK T4: Cohort page parity ===

OWNS:
- modules/teaching/components/{CohortModulesTab,CohortSwitcher,CohortModulePageContent,
  CohortOverviewTab,CohortRosterTab,CohortSubmissionsTab}.tsx
- app/(app)/teach/cohorts/[scheduleId]/modules/[moduleSlug]/page.tsx
- app/(app)/teach/cohorts/[scheduleId]/layout.tsx (new, if legacy has the equivalent)
- modules/teaching/{api,config,types} (append-only)
- tests

1. MODULE STATUS. CohortModulesTab is read-only. Port per-cohort module status (not
   started / in progress / completed) via useSetCohortModuleStatus → PATCH
   /lms/teaching/cohorts/:id/modules/:moduleId (verify the path and body). Use a
   Select per module, with an optimistic update and rollback on error.
2. COHORT SWITCHER. Port CohortSwitcher and legacy's cohort layout
   (src/app/(app)/teach/cohorts/[id]/layout.tsx), including the course-outline sheet.
   The switcher keeps the current tab and sub-route when it can.
3. MODULE PAGE. Replace the modules/[moduleSlug] redirect stub with
   CohortModulePageContent, ported from legacy: the module's assignments, materials
   and recordings for this cohort, with links to the T2/T3 pages.
4. OVERVIEW. Add legacy's "Create new" tiles (CohortOverviewTab ~L117) linking to the
   T2/T3 create pages, as bento tiles.
5. SUBMISSIONS. Support an ?assignment=<id> pre-filter in CohortSubmissionsTab, as a
   Select synced with the URL.
6. ROSTER.
   - Restore "Last submitted …" / "No activity yet" per row.
   - Add a Select filter for at-risk students: missing work ≥ N, or attendance below
     X%. Use data the roster or student summary already returns; if it needs a new
     endpoint, report it instead.
```

---

## L1 — Student learning parity

```
ROLE: You are fixing one scoped slice of a Next.js rebuild. Work only on this slice.

REPO: /Users/MAC/Documents/smarthub-projects/smarthub-lms-new (Next.js 16, React 19,
shadcn "base-vega" on Base UI, TanStack Query, NextAuth, vitest).
Read AGENTS.md and plans/DESIGN-SYSTEM.md before you write any code. This is NOT the
Next.js you know: read node_modules/next/dist/docs/ before you touch any Next API.

READ-ONLY REFERENCES (never edit, checkout, merge, pull or push these):
- Legacy frontend: ~/Documents/smarthub-projects/smarthub/smarthub-core-lms (src/)
- Backend: ~/Documents/smarthub-projects/smarthub/smarthub-api (checked out on `dev`,
  which is the contract source). Never touch the `lms-backend-fixes` branch. If an
  endpoint doesn't exist, STOP that item and report it.

CODE RULES:
- Port BEHAVIOR from legacy, never its styling. Use StatusBadge, EmptyState, Pager
  and the other registry primitives. Base UI takes render={...}; Button-as-link needs
  nativeButton={false}.
- No raw Tailwind palette colors. Filters use Select or FilterDropdown, not Tabs.
- Handle loading, then error (before empty), then empty.
- Progress hooks (useCourseProgress, etc.) were added by F5. Use them; don't
  re-implement.

COMMITS (strict):
- Commit INCREMENTALLY: one commit per numbered item. Each must pass
  `npm run typecheck`.
- Use `git add <exact paths> && git commit -m "<type(scope): summary>" -- <exact paths>`
  (the add is required for NEW files; list the same paths in both). Never `git add -A`,
  and never run a bare `git commit`. Other agents are working concurrently.
- Existing git config is the author. NO Co-Authored-By, no "Generated with", no
  attribution trailers of any kind.
- Do not push.

DONE MEANS: `npm run typecheck && npm run lint && npm run test && npm run build`
all pass (paste the output tails), plus live checks on /courses, a course module page,
/recordings, /materials and an assignment, at 375px and desktop, light and dark, with
no overflow at 375px.

FINAL REPORT: the commits, each item marked done / partial / blocked, the
verification for each, files touched outside "OWNS", and open questions.

=== TASK L1: Student learning parity ===

OWNS:
- modules/learning/components/{module-section,course-outline,recordings-page-content,
  materials-page-content}.tsx (UI; F5 already did the progress wiring, so keep it)
- lib/utils/content-filter.ts (new)
- components/ui/content-toolbar.tsx (new, unless T3 already added it; check first)
- modules/assignments/components/{assignment-page-content,submission-form,
  assignment-list-page-content}.tsx
- modules/courses/**
- tests

First, run `git show` on these legacy commits: 0719108, f26699a, 5111b57, 7f15823.

1. PAGINATION (0719108). Show 10 recordings per page with the shared Pager, both in
   module-section and on the cross-course recordings page.
2. SEARCH / FILTER / SORT (5111b57). Port utils/content-filter.ts (with unit tests)
   and the content-toolbar. Wire them into the module recordings/materials lists and
   the recordings and materials pages. Keep the filter in the URL (?q=, ?filter=,
   ?sort=) so dashboard tiles can deep-link.
3. OPEN A SPECIFIC RECORDING (f26699a). The sidebar course-outline links to
   ?recording=<id>. The module page must turn to the page that holds that recording
   and open the player. The current new-repo #recording- anchor only scrolls. The
   sidebar also shows progress, and "doesn't run on" (read the commit).
4. ASSIGNMENT THREAD. Render AssignmentThread in the assignment page rail, as legacy
   does.
5. ADD-ON BADGE. Normalise and type isModuleAddon in modules/courses/api/normalise.ts,
   and show an "Add-on" badge on the course card and the course page.
6. REVOKED NOTICE. Show RevokedCourseNotice on /courses (it's currently only on the
   dashboard).
7. UPLOADS. In submission-form (~L215), restore the 10MB document and 25MB media
   limits and ACCEPTED_MIME_TYPES from legacy, plus an `accept` attribute. Validate
   before uploading.
8. ASSIGNMENT LIST. The "urgent" hero must be the pending item with the nearest due
   date, excluding overdue items. Restore legacy's list order (7f15823).
9. MATERIALS.
   - Open m.links when there's no fileUrl (~L55, ~L180).
   - The row is a clickable div (~L187); make it a real button or link.
   - Show the error state before the empty state.
   - The curriculum download should use the server filename (F1 made getBlob return
     it), and must not toast twice.
10. DESIGN CLEANUP. Replace module-section's local STATUS_VARIANT/STATUS_LABEL and
    local EmptyState with StatusBadge and the shared EmptyState; graded must show as
    success. Replace the Tabs-as-filters on the assignments, recordings and materials
    pages with Select or FilterDropdown.
```

---

## P1 — Push, PWA and the live notification bell

```
ROLE: You are fixing one scoped slice of a Next.js rebuild. Work only on this slice.

REPO: /Users/MAC/Documents/smarthub-projects/smarthub-lms-new (Next.js 16, React 19,
shadcn "base-vega" on Base UI, TanStack Query, NextAuth, socket.io-client, vitest).
Read AGENTS.md and plans/DESIGN-SYSTEM.md before you write any code. This is NOT the
Next.js you know: read node_modules/next/dist/docs/ (manifest, and PWA if present)
before you touch any Next API.

READ-ONLY REFERENCES (never edit, checkout, merge, pull or push these):
- Legacy frontend: ~/Documents/smarthub-projects/smarthub/smarthub-core-lms (src/ and public/)
- Backend: ~/Documents/smarthub-projects/smarthub/smarthub-api (checked out on `dev`,
  which is the contract source; push routes are mounted at /push, and socket events
  are in src/socket). Never touch the `lms-backend-fixes` branch. If something
  doesn't exist, STOP that item and report it.

CODE RULES:
- Port BEHAVIOR from legacy, never its styling. Base UI takes render={...};
  Button-as-link needs nativeButton={false}.
- No raw Tailwind palette colors or text-white; use tokens (text-accent-foreground).
- F4 already fixed the push service paths. Use modules/push/api as it is now.

COMMITS (strict):
- Commit INCREMENTALLY: one commit per numbered item. Each must pass
  `npm run typecheck`.
- Use `git add <exact paths> && git commit -m "<type(scope): summary>" -- <exact paths>`
  (the add is required for NEW files; list the same paths in both). Never `git add -A`,
  and never run a bare `git commit`. Other agents are working concurrently.
- Existing git config is the author. NO Co-Authored-By, no "Generated with", no
  attribution trailers of any kind.
- Do not push.

DONE MEANS: `npm run typecheck && npm run lint && npm run test && npm run build`
all pass (paste the output tails), plus the live checks below.

FINAL REPORT: the commits, each item marked done / partial / blocked, the
verification for each, files touched outside "OWNS", and open questions.

=== TASK P1: Push, PWA, live bell ===

OWNS: public/sw.js (new), public/icons/** (new), app/manifest.ts,
modules/push/components/PushPermissionPrompt.tsx (new),
modules/push/api/push.queries.ts, modules/push/lib/**,
modules/notifications/components/NotificationBell.tsx,
components/layout/user-menu.tsx (install menu item only), the
InstallAppMenuItem component (new), and tests.

1. SERVICE WORKER. Copy legacy public/sw.js and public/icons/*. Adjust any URLs or
   paths in sw.js for this app's routes (for example, notification click targets).
   modules/push/lib/browser-push.ts registers /sw.js; confirm that it now resolves.
2. MANIFEST. Restore legacy's scope, orientation, icons (all sizes) and brand
   theme/background colors in app/manifest.ts.
3. SUBSCRIPTION. Port legacy's usePushSubscription and PushPermissionPrompt. Follow
   legacy's timing and dismissal memory; never prompt on first paint. Export the
   prompt as a component; D1 mounts it on the dashboard, so don't mount it yourself.
4. BELL (NotificationBell.tsx).
   - Listen for the socket "notification:new" event (verify the name in
     smarthub-api/src/socket), invalidate the notifications list and unread count,
     and play the chime via hooks/use-notification-chime.ts.
   - Follow actionUrl on click.
   - Make the items real buttons or links (keyboard accessible).
   - text-white on the accent background (~L66) → text-accent-foreground.
5. INSTALL APP. Port legacy InstallAppMenuItem (beforeinstallprompt) into the user
   menu.

LIVE CHECKS (report each), in Chromium:
- DevTools Application tab shows the SW registered and activated
- the manifest shows its icons
- clicking the prompt → subscribe gets a 2xx POST to /push/subscribe
- triggering a notification makes the bell update without a reload (if you can
  trigger one; otherwise show the socket listener attached)
```

---

## D1 — Dashboard parity and legacy drift

```
ROLE: You are fixing one scoped slice of a Next.js rebuild. Work only on this slice.

REPO: /Users/MAC/Documents/smarthub-projects/smarthub-lms-new (Next.js 16, React 19,
shadcn "base-vega" on Base UI, TanStack Query, NextAuth, vitest).
Read AGENTS.md and plans/DESIGN-SYSTEM.md before you write any code. The dashboard
uses the editorial hero+ledger+bento layout; fit new widgets into it, not as stacked
cards. This is NOT the Next.js you know: read node_modules/next/dist/docs/ before you
touch any Next API.

READ-ONLY REFERENCES (never edit, checkout, merge, pull or push these):
- Legacy frontend: ~/Documents/smarthub-projects/smarthub/smarthub-core-lms (src/)
- Backend: ~/Documents/smarthub-projects/smarthub/smarthub-api (checked out on `dev`,
  which is the contract source). Never touch the `lms-backend-fixes` branch. If an
  endpoint doesn't exist, STOP that item and report it.

CODE RULES:
- Port BEHAVIOR from legacy, never its styling. Base UI takes render={...};
  Button-as-link needs nativeButton={false}.
- No raw Tailwind palette colors. Motion needs a reason.
- Handle loading, then error (before empty), then empty.

COMMITS (strict):
- Commit INCREMENTALLY: one commit per numbered item, and one per ported legacy
  commit. Each must pass `npm run typecheck`.
- Use `git add <exact paths> && git commit -m "<type(scope): summary>" -- <exact paths>`
  (the add is required for NEW files; list the same paths in both). Never `git add -A`,
  and never run a bare `git commit`. Other agents are working concurrently.
- Existing git config is the author. NO Co-Authored-By, no "Generated with", no
  attribution trailers of any kind.
- Do not push.

DONE MEANS: `npm run typecheck && npm run lint && npm run test && npm run build`
all pass (paste the output tails), plus live checks of /dashboard as a cohort
student, a self-paced-only student (if you have such an account; otherwise simulate
it with the hook in a test), and an instructor, at 375px and desktop, light and dark,
with no overflow at 375px.

FINAL REPORT: the commits, each item marked done / partial / blocked, the
verification for each, files touched outside "OWNS", open questions, AND the
24-commit parity table from item 3.

=== TASK D1: Dashboard parity and legacy drift ===

OWNS: app/(app)/dashboard/**, modules/dashboard/**,
modules/profile/components/BirthdayGate.tsx (new), the profile birthday row,
modules/self-paced/** (dashboard, nudges, FAQ and offline-download pieces),
modules/instructor-earnings/** (self-paced share rows),
components/layout/app-shell.tsx (mounting gates only; F2 edited this file, so re-read
it first), and tests.

1. DASHBOARD WIDGETS. Restore legacy's ContinueSelfPacedCard (it exists in the new
   repo but is unused), SelfPacedNudges, PassMembershipCard, UpgradeCreditBanner and
   CourseProgressList. Mount PushPermissionPrompt (built by P1 in
   modules/push/components). Restore the useLearnerShape().selfPacedOnly branching,
   so self-paced-only buyers don't see cohort widgets.
2. BIRTHDAY. Port BirthdayGate and mount it in AppShell next to ProfilePhotoGate.
   Port legacy commits 053def1 and 5154a94 (the birthday row is always shown on the
   profile).
3. LEGACY DRIFT. In the legacy repo, run:
     git log --since=2026-08-28 --no-merges --oneline -- src
   There are 24 commits. For EACH one, record it in a table in your report: hash,
   subject, status (already ported → new-repo file / covered by F5, T1, T3 or L1 /
   ported by you now / missing, with the reason).
   Port the missing ones that fall in your area. Expect at least these:
   - f589345: upgrade credit and pass membership, on the dashboard AND the course page
   - 922c0eb: self-paced course FAQs, plus pass-through of the /learn nudge links
   - 62643fb: nudge dismiss, plus forwarding the API's nudge links to /learn
   - c88f811: the watermarked offline download control in the lesson player
   - 3f63873, df93bfc, 5a1b0b0: instructor self-paced revenue share, referral links,
     and the payoutState labels
   - 8c305c3: errorCode, lastActivityAt, and unmarking courseCompleted
   Diff each one against the new repo before porting; some may be partly in already.
```

---

## B1 — Scholarship, payments, internships, referrals, jobs

```
ROLE: You are fixing one scoped slice of a Next.js rebuild. Work only on this slice.

REPO: /Users/MAC/Documents/smarthub-projects/smarthub-lms-new (Next.js 16, React 19,
shadcn "base-vega" on Base UI, TanStack Query, NextAuth, vitest).
Read AGENTS.md and plans/DESIGN-SYSTEM.md before you write any code. This is NOT the
Next.js you know: read node_modules/next/dist/docs/ before you touch any Next API.

READ-ONLY REFERENCES (never edit, checkout, merge, pull or push these):
- Legacy frontend: ~/Documents/smarthub-projects/smarthub/smarthub-core-lms (src/)
- Backend: ~/Documents/smarthub-projects/smarthub/smarthub-api (checked out on `dev`,
  which is the contract source). Never touch the `lms-backend-fixes` branch. If an
  endpoint doesn't exist, STOP that item and report it.

CODE RULES:
- Port BEHAVIOR from legacy, never its styling. Base UI takes render={...};
  Button-as-link needs nativeButton={false}.
- No raw Tailwind palette colors. Filters use Select or SegmentedControl. Active
  states are solid.
- Handle loading, then error (before empty), then empty. Use formatPrice for money,
  and formatDate for dates.
- lib/api/client.ts has `silent`. Don't edit it.

COMMITS (strict):
- Commit INCREMENTALLY: one commit per numbered item (or smaller). Each must pass
  `npm run typecheck`.
- Use `git add <exact paths> && git commit -m "<type(scope): summary>" -- <exact paths>`
  (the add is required for NEW files; list the same paths in both). Never `git add -A`,
  and never run a bare `git commit`. Other agents are working concurrently.
- Existing git config is the author. NO Co-Authored-By, no "Generated with", no
  attribution trailers of any kind.
- Do not push.

DONE MEANS: `npm run typecheck && npm run lint && npm run test && npm run build`
all pass (paste the output tails), plus live checks of /payments, /internships,
/internships/me/payment, /refer-and-earn, /jobs and /dashboard at 375px and desktop,
light and dark, with no overflow at 375px.

FINAL REPORT: the commits, each item marked done / partial / blocked, the
verification for each, files touched outside "OWNS", and open questions.

=== TASK B1: Money and programs fixes ===

OWNS: modules/tech-scholarship/**, lib/crop-image.ts (new),
modules/payment-proofs/components/PaymentsPageContent.tsx, modules/internships/**,
modules/jobs/**, modules/referrals/**,
modules/acceptance-letters/components/EditSiwesDurationDialog.tsx,
lib/utils/status.ts, components/ui/status-badge.tsx and components/ui/badge.tsx (the
accent tone only), the mount point for ScholarshipPhotoGate in the app layout or
AppShell (a one-line mount), and tests.

1. SCHOLARSHIP PHOTO GATE. Port legacy ScholarshipPhotoGate.tsx (+ lib/crop-image.ts,
   react-easy-crop) as a Base UI Dialog, and mount it in the app layout the way
   legacy does. Awarded scholars with no photo are blocked until they upload one.
2. SHARE DIALOG (ShareMilestoneDialog).
   - Add "Download square" and "Download wide" banner buttons (Cloudinary
     fl_attachment, through lib/cloudinary-download), and the photo crop step, as in
     legacy ScholarshipShareBannerDialog.
   - useScholarshipBanner: enabled: open. Today every dashboard load calls the banner
     render endpoint, which returns 409.
   - The caption state is string | null, so the user can clear it.
3. SCHOLARSHIP CARD. TechScholarshipCard renders only for stage admitted or enrolled
   (legacy ACTIVE_STAGES). getMine passes silent: true and treats a 404 as null. Sync
   the track labels to the backend keys in
   smarthub-api/src/models/ScholarshipApplication.ts (data-analysis, data-science,
   ai-engineering, devops, product-design; verify), with a humanised fallback for
   unknown keys.
4. ERROR BEFORE EMPTY. These show the empty state on failure:
   InternshipWorkspacePageContent (~L118-133), InternshipPaymentPageContent (~L55)
   and JobsPageContent. PaymentsPageContent has no error state at all: when the
   surface fetch fails, the bank details are hidden but the form stays usable. Add
   retryable error states, and disable the form when its prerequisites failed.
5. PAYMENTS.
   - "Pay this" scrolls the form into view (ref + scrollIntoView({block:"center"})).
   - The file error lives on its own field, with a 10MB client-side check.
   - Clearing the tranche resets the amount.
   - The file input is keyboard reachable: an sr-only input with a focus ring on the
     label, or a Button that calls input.click(). Apply the same fix in
     InternshipPaymentPageContent and ShareMilestoneDialog.
   - Copy buttons await clipboard.writeText and toast an error on failure.
   - Replace the hand-rolled ₦ formatting with formatPrice.
   - The Select Label gets htmlFor/id.
6. INTERNSHIPS. Format the check-in weekOf with formatDate (~L448).
   EditSiwesDurationDialog must not rethrow inside handleSubmit (the interceptor has
   already toasted).
7. REFERRALS.
   - Share the banking query key with profile, or invalidate both, so Refer & Earn
     sees newly saved bank details.
   - Page payouts with the shared Pager.
   - Confirm dialogs before requesting or cancelling a payout.
   - Track pending state per row (isCancelling currently disables every Cancel
     button).
   - "Qualified" badge: add an `accent` StatusTone, TONE_TO_VARIANT and a Badge
     variant, and map qualified → accent.
   - text-accent on light backgrounds (ReferralsPanel ~L128, ~L193) fails contrast;
     use text-primary. MEASURE contrast by rendering to a canvas and reading pixels,
     not by computing it from OKLCH.
8. JOBS.
   - The scope toggle → the registry SegmentedControl. The remote toggle → Select.
   - Give the search Input an aria-label.
   - jobs.service companies(): `apiClient.get(...) ?? []` never falls back, because a
     Promise is never nullish. Use `(await apiClient.get(...)) ?? []`.
```

---

## Q1 — Design-system and accessibility sweep (after wave 2)

```
ROLE: You are doing a repo-wide compliance pass on a Next.js rebuild. Behavior must
not change.

REPO: /Users/MAC/Documents/smarthub-projects/smarthub-lms-new (Next.js 16, React 19,
shadcn "base-vega" on Base UI, vitest).
Read AGENTS.md and plans/DESIGN-SYSTEM.md (especially the non-negotiables and the
registry) before you write any code.

READ-ONLY: ~/Documents/smarthub-projects/smarthub/* (never edit, checkout, merge or
push; never touch the smarthub-api `lms-backend-fixes` branch).

COMMITS (strict):
- Commit INCREMENTALLY: one commit per numbered item, or per module for large items.
  Each must pass `npm run typecheck`.
- Use `git add <exact paths> && git commit -m "<type(scope): summary>" -- <exact paths>`
  (the add is required for NEW files; list the same paths in both). Never `git add -A`,
  and never run a bare `git commit`.
- Existing git config is the author. NO Co-Authored-By, no "Generated with", no
  attribution trailers of any kind.
- Do not push.

DONE MEANS: `npm run typecheck && npm run lint && npm run test && npm run build`
all pass (paste the output tails), plus a 375px overflow check
(document.documentElement.scrollWidth === clientWidth) on EVERY top-level route,
light and dark. List each route with pass or fail.

FINAL REPORT: the commits, each item marked done / partial / blocked, the per-site
decisions for item 4, and the route overflow table.

=== TASK Q1: Design-system and a11y sweep ===

OWNS: any file, but ONLY for the mechanical changes below.

1. RAW COLORS. Find every raw palette class:
     grep -rnE "(emerald|amber|red|blue|green|yellow|neutral|slate|zinc|gray|orange|sky)-[0-9]{2,3}|text-white|bg-white|bg-black" app components modules
   Replace each with a semantic token. components/ui/alert.tsx's
   warning/info/success variants are known offenders; add tokens to globals.css only
   if one is genuinely missing, and document it in plans/DESIGN-SYSTEM.md.
2. nativeButton. Every <Button render={<Link|<a ...>}> without nativeButton={false}
   gets it.
3. CLICKABLE NON-BUTTONS. divs, Badges or spans with onClick become <button>, Toggle
   or ToggleGroup (CourseFilterChips, any remaining rows).
4. BADGES. For the remaining raw <Badge variant=...> usages (~57), convert real status
   pills to StatusBadge. Leave icon-chip tints on LedgerItem and NagItem alone. List
   each site with its decision.
5. ARIA. Select Labels get htmlFor/id pairs. Expanders get aria-expanded and
   aria-controls (RegistrationBillingCard, CohortModulesTab, module-section,
   materials-page-content). Icon-only buttons get an aria-label.
6. RICH TEXT. Add a DOMPurify hook in components/ui/rich-text.tsx that forces
   rel="noopener noreferrer" on target=_blank links. Add a test.
7. DEAD CODE. Delete components/layout/coming-soon.tsx if nothing imports it.
8. TABS AS FILTERS. Any Tabs still used as a filter becomes Select or FilterDropdown.
```

---

## Q2 — Repo hygiene (any time)

```
ROLE: You are making a Next.js repo hand-off ready. Work only on the items below.

REPO: /Users/MAC/Documents/smarthub-projects/smarthub-lms-new (Next.js 16, NextAuth,
vitest). Its remote is git@github.com:Delightsheriff/smarthub-lms-new.git (branch
main).
Read AGENTS.md, HANDOFF.md and plans/DESIGN-SYSTEM.md first. This is NOT the Next.js
you know: read node_modules/next/dist/docs/ before you touch next.config.ts,
instrumentation or proxy.

READ-ONLY: ~/Documents/smarthub-projects/smarthub/* (never edit, checkout, merge or
push; never touch the smarthub-api `lms-backend-fixes` branch).

COMMITS (strict):
- Commit INCREMENTALLY: one commit per numbered item. Each must pass
  `npm run typecheck`.
- Use `git add <exact paths> && git commit -m "<type(scope): summary>" -- <exact paths>`
  (the add is required for NEW files; list the same paths in both). Never `git add -A`,
  and never run a bare `git commit`.
- Existing git config is the author. NO Co-Authored-By, no "Generated with", no
  attribution trailers of any kind.
- Do not push.
- NEVER commit .env.local or any secret value.

DONE MEANS: `npm run typecheck && npm run lint && npm run test && npm run build`
all pass (paste the output tails), plus `curl -I` on a running dev server showing
the new headers.

FINAL REPORT: the commits, each item marked done / partial / blocked, the
verification for each, and open questions.

=== TASK Q2: Repo hygiene ===

1. .env.example: KEYS ONLY, taken from .env.local plus every process.env.* read in
   the code (grep for it). Add a one-line comment per key.
2. README.md: replace the Next.js template. Cover what SmartHub LMS is, the
   prerequisites, setup, the scripts (dev/build/test/typecheck/lint), the env vars,
   the backend dependency (smarthub-api), and a pointer to plans/DESIGN-SYSTEM.md for
   UI work.
3. .github/workflows/ci.yml: on push and pull_request to main, run npm ci, typecheck,
   lint, test and build on Node LTS, with npm caching. Set any env vars the build
   needs to dummy values.
4. SECURITY HEADERS in next.config.ts headers(): Referrer-Policy: same-origin and
   X-Robots-Tag: noarchive, nosnippet (from legacy's middleware; check
   smarthub-core-lms/src/middleware.ts), plus X-Content-Type-Options: nosniff and a
   frame-ancestors / X-Frame-Options baseline.
5. SENTRY. app/instrumentation.ts is in the wrong place (Next only loads it at the
   project root or src/) and it's empty. Move it, and wire Sentry the way legacy did
   (instrumentation + a global-error capture). The DSN goes in env; skip Sentry
   gracefully when it isn't set.
6. PROXY. Read the Next 16 docs on proxy.ts (the renamed middleware). If it fits,
   add a server-side auth guard that redirects unauthenticated users on (app) routes
   to /login?next=… (keep F2's client guard as the fallback). If it doesn't fit,
   explain why in the report.
7. ADR. Write docs/adr/00NN-auth-token-model.md, numbered after the latest ADR,
   covering:
   - API JWTs carry no exp claim
   - the refreshToken is dropped
   - the accessToken is readable via the session
   - the risks, and what would change if the backend adds expiry
8. AGENTS.md. Replace the claim that the port is "fully shipped". Say that a parity
   audit on 2026-09-25 found gaps, tracked in AUDIT-FIX-PROMPTS.md, and keep the rest
   intact. Also update HANDOFF.md: mark #2 (the git remote) done, and #8–#12 as done
   where this task did them.
```

---

## Q3 — Improvements beyond legacy (last)

```
ROLE: You are adding focused UX improvements to a Next.js rebuild. Each item is
small; do them one at a time.

REPO: /Users/MAC/Documents/smarthub-projects/smarthub-lms-new (Next.js 16, React 19,
shadcn "base-vega" on Base UI, TanStack Query, NextAuth, vitest).
Read AGENTS.md and plans/DESIGN-SYSTEM.md before you write any code, including the
"motion needs a reason" rule and the reduced-motion setup. This is NOT the Next.js
you know: read node_modules/next/dist/docs/ before you touch any Next API.

READ-ONLY: ~/Documents/smarthub-projects/smarthub/* (never edit, checkout, merge or
push; never touch the smarthub-api `lms-backend-fixes` branch). If an item needs a
backend endpoint that doesn't exist, SKIP it and report it.

CODE RULES: use the shared primitives; Base UI takes render={...}; no raw palette
colors; Select for filters; handle loading, then error, then empty.

COMMITS (strict):
- ONE commit per item. Each must pass `npm run typecheck`.
- Use `git add <exact paths> && git commit -m "<type(scope): summary>" -- <exact paths>`
  (the add is required for NEW files; list the same paths in both). Never `git add -A`,
  and never run a bare `git commit`.
- Existing git config is the author. NO Co-Authored-By, no "Generated with", no
  attribution trailers of any kind.
- Do not push.

DONE MEANS: `npm run typecheck && npm run lint && npm run test && npm run build`
all pass (paste the output tails), plus a live check of each item at 375px and
desktop.

FINAL REPORT: one line per item (done / skipped + why), with the commit hash.

=== TASK Q3: Improvements beyond legacy ===

1. Assignment page (student): a sticky rail with status, countdown and the primary
   action; the tutor's feedback sits in the reading column.
2. "Resume" pointer: from the progress data, surface the next unwatched recording on
   /recordings and in the dashboard's continue-learning block.
3. Messaging: optimistic sends with a pending state, plus a retry action on failure
   (replacing "clear the draft, then restore it on error").
4. Notifications: group by day (Today / Yesterday / Earlier), and add an Unread
   filter (Select) to the page and the bell.
5. Command palette: set shouldFilter={false} for server results, pass the abort
   signal through search.service (it's currently ignored as _signal), clear the
   results when the query is under 2 characters, and show recently visited pages
   when the query is empty.
6. Billing: a "Pay / upload proof" CTA on /billing when a balance is outstanding
   (link to /payments with the tranche preselected); a receipt link and submitted
   date on each payments ledger row (the fields are already mapped).
7. Calendar and webinars: an "Add to calendar" .ics download (generated client-side)
   on webinar cards and calendar events.
8. Mobile share: use navigator.share for the referral link and the scholarship
   banner when available, with the existing buttons as the fallback.
9. Motion, where it helps comprehension only: animate expand/collapse height on
   CohortModulesTab, RegistrationBillingCard, module-section and
   materials-page-content, using motion/react. Respect <MotionConfig
   reducedMotion="user"> and the globals.css reduced-motion block.
10. Payout request/cancel: confirm dialogs and per-row pending state. Skip this if
    B1 already did it.
```
