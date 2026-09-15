# Self-paced sales (instructor, `/teach/self-paced`)

Status: 🟡 Spot-checked, looks healthy — full audit not run

`InstructorSelfPacedPageContent.tsx` (the page this nav item renders)
already uses `PageHeader` and `EmptyState` correctly, and a quick grep
across every component in `modules/self-paced/components/` found **zero**
raw Tailwind palette colors (`text-emerald-*`, `bg-blue-*`, etc.) — better
shape than most surfaces audited this session. Three tabs: My referral
links, Sales, Earnings, each in its own component
(`InstructorReferralLinks.tsx` 422 lines, `InstructorAttributedSales.tsx`
133, `InstructorSelfPacedEarnings.tsx` 400) — not read in full, so treat
"looks healthy" as a spot-check, not a clean bill of health. Only
`InstructorSelfPacedPageContent.tsx` was actually read end-to-end.

Not done: line-by-line legacy comparison (does current have every feature
legacy's equivalent has?), and reading the three tab components in full
for hand-rolled-vs-shared-primitive patterns or functional gaps. Pick up
the same way the other docs in this folder were built: read both
codebases' full implementations, diff behavior, then write acceptance
criteria.
