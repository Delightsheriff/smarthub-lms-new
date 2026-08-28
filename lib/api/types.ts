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

export interface PaginationMeta {
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
  total?: number;
  page?: number;
  limit?: number;
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
