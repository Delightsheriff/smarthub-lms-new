/**
 * Shared API response shapes. Mirrors smarthub-api's successHandler
 * envelope so every endpoint's payload is unwrapped the same way.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: T;
  meta?: PaginationMeta;
}

/**
 * Mirrors smarthub-api/src/utils/pagination.utils.ts → StandardPaginationMeta.
 * createPaginationMeta always emits all six fields; optional-only so callers
 * that receive partial shapes from older endpoints still type-check.
 */
export interface PaginationMeta {
  /** Total number of items across all pages. */
  totalItems?: number;
  /** Total number of pages. */
  totalPages?: number;
  /** 1-based page number for the current response. */
  currentPage?: number;
  /** Number of items per page requested. */
  pageSize?: number;
  /** True when another page follows the current one. */
  hasNext?: boolean;
  /** True when a page precedes the current one. */
  hasPrev?: boolean;
}

/**
 * Unwrapped result of apiClient.getPaginated<T>. The `data` field holds
 * the array the service is typed for; `meta` holds the backend pagination.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  errors?: Array<{ msg: string; path?: string }>;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Re-export the module wire shapes through the shared API-types surface
 * so Foundation and cross-module consumers import one home.
 */
export type * from "@/modules/auth/types";
export type * from "@/modules/billing/types/api.types";
export type * from "@/modules/payment-proofs/types/api.types";
export type * from "@/modules/siwes-profile/types/api.types";
export type * from "@/modules/acceptance-letters/types/api.types";
