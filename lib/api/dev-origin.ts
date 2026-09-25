/**
 * Where smarthub-api listens in local development. The Next dev server
 * proxies `/api-proxy/*` here (next.config.ts), and the socket client —
 * which can't go through that HTTP rewrite — connects here directly
 * unless `NEXT_PUBLIC_SOCKET_URL` says otherwise.
 */
export const DEV_API_ORIGIN = "http://localhost:6001";
