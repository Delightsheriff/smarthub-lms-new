/**
 * The data-source seam.
 *
 * Every module's `*.service.ts` calls THIS surface (get/post/put/patch/
 * delete/getBlob + silent). In the UI-first phase the handlers resolve
 * against the mock database; at Plan 012 the same surface is re-pointed
 * at the real axios adapter. Module services and screens never know which
 * data source is live.
 *
 * Mock routes are registered by `lib/api/mock/router.ts` (imported once
 * where the app boots).
 */

import { ApiError } from "@/lib/api/types";

export interface ApiClientRequestOptions {
  /** Suppress the automatic success/error toast for non-GET calls. */
  silent?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}

export interface MockRequestContext {
  path: string;
  data?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

export type HttpVerb = "get" | "post" | "put" | "patch" | "delete";

export interface MockRoute {
  verb: HttpVerb | HttpVerb[];
  path: string;
  handler: (ctx: MockRequestContext) => unknown | Promise<unknown>;
}

const routes: MockRoute[] = [];

export function registerMockRoute(route: MockRoute): void {
  routes.push(route);
}

function segments(path: string): string[] {
  return path.split("/").filter(Boolean);
}

function matchPath(pattern: string, path: string): boolean {
  const p = segments(pattern);
  const a = segments(path);
  if (p.length !== a.length) return false;
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(":")) continue;
    if (p[i] !== a[i]) return false;
  }
  return true;
}

function extractParams(pattern: string, path: string): Record<string, string> {
  const p = segments(pattern);
  const a = segments(path);
  const params: Record<string, string> = {};
  p.forEach((seg, i) => {
    if (seg.startsWith(":")) params[seg.slice(1)] = a[i] ?? "";
  });
  return params;
}

function resolveHandler(verb: HttpVerb, ctx: MockRequestContext) {
  for (const route of routes) {
    const verbs = Array.isArray(route.verb) ? route.verb : [route.verb];
    if (verbs.includes(verb) && matchPath(route.path, ctx.path)) {
      const fullCtx = { ...ctx, params: { ...ctx.params, ...extractParams(route.path, ctx.path) } };
      return { handler: route.handler, ctx: fullCtx };
    }
  }
  throw new ApiError(`No mock handler for ${verb.toUpperCase()} ${ctx.path}`, 404);
}

const delay = () => new Promise((r) => setTimeout(r, 60));

async function exec<T>(
  verb: HttpVerb,
  path: string,
  data?: unknown,
  options?: ApiClientRequestOptions,
): Promise<T> {
  await delay();
  const { handler, ctx } = resolveHandler(verb, { path, data, params: options?.params });
  const result = handler(ctx);
  const resolved = (result instanceof Promise ? await result : result) as T;
  // Handlers may return live mock singletons. In-place mutations of a
  // singleton make a later response reference-equal to the cached value,
  // so React Query's structural sharing silently drops the update. Return a
  // defensive deep copy each call so every write surfaces as a new value.
  return JSON.parse(JSON.stringify(resolved)) as T;
}

export const apiClient = {
  get<T>(path: string, options?: ApiClientRequestOptions) {
    return exec<T>("get", path, undefined, options);
  },
  getBlob(_path: string, _options?: ApiClientRequestOptions): Promise<Blob> {
    return Promise.resolve(new Blob());
  },
  post<T>(path: string, data?: unknown, options?: ApiClientRequestOptions) {
    return exec<T>("post", path, data, options);
  },
  put<T>(path: string, data?: unknown, options?: ApiClientRequestOptions) {
    return exec<T>("put", path, data, options);
  },
  patch<T>(path: string, data?: unknown, options?: ApiClientRequestOptions) {
    return exec<T>("patch", path, data, options);
  },
  delete<T>(path: string, options?: ApiClientRequestOptions) {
    return exec<T>("delete", path, undefined, options);
  },
};

/**
 * Storage/upload seam: "put bytes → get URL". Mock-backed now (the mock
 * returns a synthetic `/uploads/N` URL without storing the blob);
 * Cloudinary-backed at Plan 012. Profile avatars, payment-proof receipts
 * and acceptance-letter downloads all route through this one method.
 */
export async function uploadFile(
  file: File,
  options?: ApiClientRequestOptions,
): Promise<string> {
  const raw = (await exec<unknown | { url?: string; secure_url?: string }>(
    "post",
    "/uploads",
    { fileName: file.name },
    options,
  )) as string | { url?: string; secure_url?: string };
  if (typeof raw === "string") return raw;
  const url = raw?.url ?? raw?.secure_url;
  if (!url) throw new Error("Upload succeeded but no URL was returned");
  return url;
}
