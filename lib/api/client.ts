import axios, { type AxiosInstance, type AxiosError } from "axios";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { ApiError, type ApiResponse } from "@/lib/api/types";
import { useAuthStore } from "@/store/slices/authStore";

export interface ApiClientRequestOptions {
  /** Suppress the automatic success/error toast for calls. */
  silent?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const instance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor — attach Bearer token. Reads the Zustand store
// (kept in sync with the NextAuth session by AuthSessionBridge) rather
// than `useSession()` directly, since this runs outside React.
instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor. smarthub-api's access tokens carry no `exp`
// claim (jwt.sign() with no expiresIn) — they don't expire, so a 401
// here means the session is genuinely invalid (account suspended,
// revoked, JWT_SECRET rotated), never "needs a routine refresh". Sign
// out for real — clears the NextAuth cookie and, via the bridge, the
// mirrored Zustand state — instead of the single-flight refresh dance
// this used to attempt (which called a since-fixed-elsewhere endpoint
// that was never the actual fix for a non-expiring token anyway).
let signingOut = false;
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && !signingOut) {
      signingOut = true;
      await signOut({ redirect: false });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

function formatError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[]; error?: string; statusCode?: number } | undefined;
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message || data?.error || error.message || "An unexpected network error occurred.";
    const status = error.response?.status || 500;
    return new ApiError(message, status);
  }
  if (error instanceof ApiError) return error;
  return new ApiError((error as Error)?.message || "An error occurred", 500);
}

async function execRequest<T>(
  method: "get" | "post" | "put" | "patch" | "delete",
  url: string,
  data?: unknown,
  options?: ApiClientRequestOptions,
): Promise<T> {
  try {
    const response = await instance.request<ApiResponse<T>>({
      method,
      url,
      data,
      params: options?.params,
      headers: options?.headers,
    });
    // smarthub-api's successHandler always wraps the payload as
    // { statusCode, message, success, data }; unwrap it here so every
    // service gets the bare shape it's typed for.
    return response.data.data;
  } catch (err) {
    const apiError = formatError(err);
    if (!options?.silent) {
      toast.error(apiError.message);
    }
    throw apiError;
  }
}

export const apiClient = {
  get<T>(path: string, options?: ApiClientRequestOptions): Promise<T> {
    return execRequest<T>("get", path, undefined, options);
  },
  async getBlob(path: string, options?: ApiClientRequestOptions): Promise<Blob> {
    try {
      const response = await instance.get(path, {
        params: options?.params,
        headers: options?.headers,
        responseType: "blob",
      });
      return response.data as Blob;
    } catch (err) {
      const apiError = formatError(err);
      if (!options?.silent) toast.error(apiError.message);
      throw apiError;
    }
  },
  post<T>(path: string, data?: unknown, options?: ApiClientRequestOptions): Promise<T> {
    return execRequest<T>("post", path, data, options);
  },
  put<T>(path: string, data?: unknown, options?: ApiClientRequestOptions): Promise<T> {
    return execRequest<T>("put", path, data, options);
  },
  patch<T>(path: string, data?: unknown, options?: ApiClientRequestOptions): Promise<T> {
    return execRequest<T>("patch", path, data, options);
  },
  delete<T>(path: string, options?: ApiClientRequestOptions): Promise<T> {
    return execRequest<T>("delete", path, undefined, options);
  },
};

export async function uploadFile(
  file: File,
  options?: ApiClientRequestOptions,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await instance.post<
      ApiResponse<{ url?: string; secure_url?: string }>
    >("/lms/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...options?.headers,
      },
      params: options?.params,
    });
    const url = response.data.data?.url || response.data.data?.secure_url;
    if (!url) throw new ApiError("Upload succeeded but no file URL was returned", 500);
    return url;
  } catch (err) {
    const apiError = formatError(err);
    if (!options?.silent) toast.error(apiError.message);
    throw apiError;
  }
}
