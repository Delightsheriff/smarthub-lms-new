# ADR 0011 — Uploads, downloads and previews route through one storage seam

- **Status:** Accepted
- **Date:** 2026-08 (Plan 009)

## Context

File bytes appear all over the legacy codebase but are handled
differently each time: profile avatars upload to a Cloudinary API and
preview before submit, payment-proof receipts upload into a proof form,
acceptance letters download from a signed Cloudinary raw URL, and course
recordings/materials/notes preview and download through yet more paths.
Each screen hand-rolled its own upload → URL → preview/download dance,
coupling UI to whatever Cloudinary endpoint happened to be nearby.

The plan pre-announced a **storage/upload seam** (`plans/ARCHITECTURE.md`
§"Known seams"): centralise upload → URL → preview/download so the mock
today and object storage at Plan 012 share one surface.

## Decision

All file transfer in this slice goes through **one client-side seam**:

1. **`uploadFile(file, options) → string`** (`lib/api/client.ts`) — "put
   bytes, get a URL". Mock-backed now, returning a synthetic `/uploads/N`
   URL; object storage backs the same signature at Plan 012. Profile
   avatars and payment-proof receipts both upload through it.
2. **`downscaleImage(file) → File`** (`lib/image.ts`) — resize before
   upload so large camera photos never hit the wire at full resolution.
   Used by `AvatarUploader`, `ProfilePhotoGate` and the proof form.
3. **`downloadFile(url, title, fileType) → void`** (`lib/cloudinary-download.ts`)
   — a single download helper for acceptance letters and other raw-asset
   downloads (head request → blob → a-tag), so screens never reach for
   Cloudinary URLs directly.
4. **`usePreviewableUrl`** awaits a preparatory handler and hands back a
   `data:`/blob URL for inline previews.

Screens depend on the seam, not on storage vendors: they pass a `File` to
`uploadFile` and render/download what comes back, exactly as they will at
Plan 012.

## Consequences

- **Positive:** the mock and the real adapter are interchangeable behind
  one signature — screens are written once against the seam, and the swap
  is a single-file change at 012.
- **Positive:** preview-before-submit and size enforcement live in 2
  helpers (`downscaleImage` + the 5 MB gate) instead of scattered copies.
- **Positive:** letter downloads keep the signer/expiry details of
  Cloudinary opaque behind `downloadFile`.
- **Negative:** `uploadFile` returns only a URL; bytes are always expected
  to be "gone" once uploaded (no client-side cache), so offline/retry
  behaviour remains a server concern.