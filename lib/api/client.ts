import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from "axios";
import { toast } from "sonner";
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

// Single-flight refresh state lock
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor — attach Bearer token
instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor — handle single-flight 401 refresh + error mapping
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; error?: string; statusCode?: number }>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
              }
              resolve(instance(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post<ApiResponse<{ token?: string }>>(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true },
        );

        // The refresh endpoint's envelope names this field `token`, not
        // `accessToken` (that name is only used by /auth/login's payload).
        const newToken = refreshResponse.data.data?.token;
        if (newToken) {
          const user = useAuthStore.getState().user;
          if (user) {
            useAuthStore.getState().setAuth(user, newToken);
          }
          processQueue(null, newToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return instance(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
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
