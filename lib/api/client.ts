import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import {
  ApiError,
  type ApiResponse,
  type PaginationMeta,
  type PaginatedResponse,
} from "@/lib/api/types";
import { useAuthStore } from "@/store/slices/authStore";

// ─── Request options ──────────────────────────────────────────────────────────

export interface ApiClientRequestOptions {
  /** Suppress automatic error toasts on non-GET failures, and success toasts. */
  silent?: boolean;
  /** Query-string params forwarded to axios. */
  params?: Record<string, string | number | boolean | undefined>;
  /** Extra request headers. */
  headers?: Record<string, string>;
  /**
   * Per-request timeout in milliseconds.
   * Defaults to DEFAULT_TIMEOUT (30 000).
   * Oreo's streaming call uses 120 000.
   */
  timeout?: number;
  /** Request body (e.g. for DELETE requests carrying a payload). */
  data?: unknown;
}

// ─── Pure decision helpers (unit-tested) ─────────────────────────────────────

const DEFAULT_TIMEOUT = 30_000;

/**
 * Should we emit an automatic error toast for this failure?
 * Legacy rule: toast only on non-GET mutations, and only when the request
 * didn't opt out with `silent`. GETs render their own page-level error state.
 */
export function shouldToast(method: string, silent: boolean | undefined): boolean {
  if (silent) return false;
  return (method || "get").toLowerCase() !== "get";
}

/**
 * Parse the filename from a Content-Disposition header, handling both
 * the plain `filename=` and the RFC 5987 `filename*=UTF-8''` forms.
 *
 * Returns undefined when the header is absent or has no filename token.
 */
export function parseContentDispositionFilename(
  header: string | undefined | null,
): string | undefined {
  if (!header) return undefined;
  // RFC 5987 encoded form: filename*=UTF-8''foo%20bar.pdf
  const rfc5987 = /filename\*\s*=\s*UTF-8''([^;"\s]+)/i.exec(header);
  if (rfc5987?.[1]) return decodeURIComponent(rfc5987[1]);
  // Plain form: filename="foo bar.pdf" or filename=foo.pdf
  const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(header);
  return plain?.[1]?.trim();
}

/**
 * Returns true when the response carries HTTP 402 (payment required).
 * Extracted as a pure function so tests don't need a real AxiosError.
 */
export function is402(status: number | undefined): boolean {
  return status === 402;
}

// ─── Axios instance ───────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor — attach Bearer token from the Zustand store (kept in
// sync with the NextAuth session by AuthSessionBridge). Runs outside React so
// we use getState() rather than useSession().
instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor.
//
// smarthub-api access tokens carry no `exp` claim — they don't expire. A 401
// here is always a genuinely invalid session (revoked, rotated secret), never
// "needs a routine refresh". Sign out for real.
//
// 402: redirect to /payments (same as legacy). The paywall page explains the
// situation; no additional toast is needed.
//
// Error toasts: only on non-GET mutations (GETs render page-level error
// states; a toast on top is noise). Honour the `silent` flag.
let signingOut = false;
instance.interceptors.response.use(
  (response) => {
    // Auto-toast success message on non-GET mutations (matching legacy).
    const cfg = response.config as InternalAxiosRequestConfig & {
      silent?: boolean;
    };
    const method = (cfg.method || "get").toLowerCase();
    if (
      typeof window !== "undefined" &&
      !cfg.silent &&
      method !== "get"
    ) {
      const message = (response.data as { message?: string } | undefined)
        ?.message;
      if (message) toast.success(message);
    }
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const cfg = error.config as
      | (InternalAxiosRequestConfig & { silent?: boolean })
      | undefined;

    // 401 → sign out and redirect to /login.
    if (status === 401 && !signingOut) {
      signingOut = true;
      await signOut({ redirect: false });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    // 402 → redirect to /payments (unless already there).
    if (is402(status) && typeof window !== "undefined") {
      if (!window.location.pathname.startsWith("/payments")) {
        window.location.href = "/payments";
      }
      return Promise.reject(formatError(error));
    }

    // Error toast: only on non-GET mutations, only when not silenced.
    const method = cfg?.method || "get";
    if (typeof window !== "undefined" && shouldToast(method, cfg?.silent)) {
      const msg =
        apiErrorMessage(error.response?.data) || error.message || "Something went wrong";
      toast.error(msg);
    }

    return Promise.reject(formatError(error));
  },
);

// ─── Error normalisation ──────────────────────────────────────────────────────

/**
 * Pure: the human message in an API error body. express-validator
 * failures arrive as `{ errors: [{ msg, path }] }` with no top-level
 * `message`, so read those too instead of falling back to axios's
 * "Request failed with status code 400".
 */
export function apiErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const body = data as {
    message?: string | string[];
    error?: string;
    errors?: { msg?: string; message?: string }[];
  };
  if (Array.isArray(body.message)) return body.message.join(", ") || undefined;
  if (body.message) return body.message;
  const fieldMessages = (body.errors ?? [])
    .map((e) => e?.msg || e?.message)
    .filter((m): m is string => !!m);
  if (fieldMessages.length) return [...new Set(fieldMessages)].join(". ");
  return body.error || undefined;
}

function formatError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const message =
      apiErrorMessage(error.response?.data) ||
      error.message ||
      "An unexpected network error occurred.";
    const status = error.response?.status || 500;
    return new ApiError(message, status);
  }
  if (error instanceof ApiError) return error;
  return new ApiError((error as Error)?.message || "An error occurred", 500);
}

// ─── Core request executor ────────────────────────────────────────────────────

/**
 * Standard request — unwraps the smarthub-api success envelope's `data` field.
 * The response interceptor already handles success toasts for non-GET verbs.
 */
async function execRequest<T>(
  method: "get" | "post" | "put" | "patch" | "delete",
  url: string,
  data?: unknown,
  options?: ApiClientRequestOptions,
): Promise<T> {
  try {
    const payload = data !== undefined ? data : options?.data;
    const response = await instance.request<ApiResponse<T>>({
      method,
      url,
      data: payload,
      params: options?.params,
      headers: options?.headers,
      timeout: options?.timeout,
      // Pass `silent` onto InternalAxiosRequestConfig so the response
      // interceptor can see it.
      ...(options?.silent !== undefined ? { silent: options.silent } : {}),
    });
    return response.data.data;
  } catch (err) {
    // Interceptor has already toasted (when appropriate); just rethrow.
    throw err instanceof ApiError ? err : formatError(err);
  }
}

/**
 * Paginated request — returns `{ data, meta }` preserving the backend's
 * top-level `meta` object instead of discarding it.
 *
 * Signature used by downstream agents:
 *   getPaginated<T>(path: string, options?: ApiClientRequestOptions): Promise<PaginatedResponse<T>>
 *
 * Option names: silent, params, headers, timeout (all from ApiClientRequestOptions).
 */
async function execPaginatedRequest<T>(
  url: string,
  options?: ApiClientRequestOptions,
): Promise<PaginatedResponse<T>> {
  try {
    const response = await instance.request<ApiResponse<T[]>>({
      method: "get",
      url,
      params: options?.params,
      headers: options?.headers,
      timeout: options?.timeout,
      ...(options?.silent !== undefined ? { silent: options.silent } : {}),
    });
    const env = response.data;
    return {
      data: env.data ?? [],
      meta: (env.meta ?? {}) as PaginationMeta,
    };
  } catch (err) {
    throw err instanceof ApiError ? err : formatError(err);
  }
}

// ─── Public API surface ───────────────────────────────────────────────────────

export const apiClient = {
  /** GET → unwraps response.data.data */
  get<T>(path: string, options?: ApiClientRequestOptions): Promise<T> {
    return execRequest<T>("get", path, undefined, options);
  },

  /**
   * GET (paginated) → returns { data: T[], meta: PaginationMeta }.
   * Use this instead of `.get` whenever the endpoint is paginated so the
   * backend's `meta` isn't silently discarded.
   *
   * @param path    - endpoint path
   * @param options - silent, params (include page/limit here), headers, timeout
   */
  getPaginated<T>(
    path: string,
    options?: ApiClientRequestOptions,
  ): Promise<PaginatedResponse<T>> {
    return execPaginatedRequest<T>(path, options);
  },

  /**
   * GET blob — for binary endpoints (e.g. curriculum PDF).
   * Returns `{ blob, filename }` where `filename` is parsed from the
   * Content-Disposition header (undefined when absent).
   * Accepts `silent` to suppress error toasts.
   */
  async getBlob(
    path: string,
    options?: ApiClientRequestOptions,
  ): Promise<{ blob: Blob; filename: string | undefined }> {
    try {
      const response = await instance.get<Blob>(path, {
        params: options?.params,
        headers: options?.headers,
        responseType: "blob",
        timeout: options?.timeout,
        ...(options?.silent !== undefined ? { silent: options.silent } : {}),
      });
      const disposition = String(
        response.headers?.["content-disposition"] ?? "",
      );
      return {
        blob: response.data,
        filename: parseContentDispositionFilename(disposition),
      };
    } catch (err) {
      const apiError = formatError(err);
      if (shouldToast("get", options?.silent)) toast.error(apiError.message);
      throw apiError;
    }
  },

  post<T>(
    path: string,
    data?: unknown,
    options?: ApiClientRequestOptions,
  ): Promise<T> {
    return execRequest<T>("post", path, data, options);
  },

  put<T>(
    path: string,
    data?: unknown,
    options?: ApiClientRequestOptions,
  ): Promise<T> {
    return execRequest<T>("put", path, data, options);
  },

  patch<T>(
    path: string,
    data?: unknown,
    options?: ApiClientRequestOptions,
  ): Promise<T> {
    return execRequest<T>("patch", path, data, options);
  },

  delete<T>(path: string, options?: ApiClientRequestOptions): Promise<T> {
    return execRequest<T>("delete", path, undefined, options);
  },
};

// ─── File upload helper ───────────────────────────────────────────────────────

/** What every `/lms/uploads*` route returns (smarthub-api
 *  file-upload.controllers.ts): the Cloudinary URL is the envelope's
 *  `data` STRING, with the metadata as siblings — not `data.url`. */
export interface UploadedFile {
  url: string;
  type?: "image" | "video" | "raw";
  size?: number;
  mime?: string;
  filename?: string;
  extension?: string;
}

/** Pure: pulls the uploaded file out of the upload envelope. Also accepts
 *  a `{ url | secure_url }` object in `data` for forward compatibility. */
export function parseUploadResponse(body: unknown): UploadedFile | null {
  if (!body || typeof body !== "object") return null;
  const env = body as Record<string, unknown>;
  const data = env.data;
  const url =
    typeof data === "string"
      ? data
      : data && typeof data === "object"
        ? ((data as { url?: string; secure_url?: string }).url ??
          (data as { secure_url?: string }).secure_url)
        : undefined;
  if (!url) return null;
  return {
    url,
    type: env.type as UploadedFile["type"],
    size: typeof env.size === "number" ? env.size : undefined,
    mime: env.mime as string | undefined,
    filename: env.filename as string | undefined,
    extension: env.extension as string | undefined,
  };
}

/** Upload one file as multipart form-data and return the URL plus the
 *  metadata the API reports. `path` defaults to the generic LMS upload;
 *  pass `/lms/uploads/assignment` or `/lms/uploads/material` for those. */
export async function uploadFileDetailed(
  file: File | Blob,
  path = "/lms/uploads",
  options?: ApiClientRequestOptions,
): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await instance.post<unknown>(path, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...options?.headers,
      },
      params: options?.params,
      timeout: options?.timeout,
      ...(options?.silent !== undefined ? { silent: options.silent } : {}),
    });
    const uploaded = parseUploadResponse(response.data);
    if (!uploaded) {
      throw new ApiError("Upload succeeded but no file URL was returned", 500);
    }
    return uploaded;
  } catch (err) {
    const apiError = err instanceof ApiError ? err : formatError(err);
    // The response interceptor already toasted HTTP failures; only toast
    // the "no URL" case it never saw.
    if (err instanceof ApiError && shouldToast("post", options?.silent)) {
      toast.error(apiError.message);
    }
    throw apiError;
  }
}

export async function uploadFile(
  file: File | Blob,
  options?: ApiClientRequestOptions,
): Promise<string> {
  return (await uploadFileDetailed(file, "/lms/uploads", options)).url;
}
