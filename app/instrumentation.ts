/**
 * Next.js runtime instrumentation hook (see
 * `03-file-conventions/instrumentation.md`). `register` runs once per
 * server instance before it serves requests. Left empty during the port —
 * observability (Sentry/OTel) is intentionally deferred until real
 * screens/API exist (see `docs/adr/`, foundation decisions).
 */
export async function register(): Promise<void> {
  // Intentionally empty — instrumentation arrives with the API swap.
}
