export interface ActivityActor {
  user?: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface ActivityResource {
  type?: string;
  id?: string;
  label?: string;
}

export interface ActivityEvent {
  id: string;
  actor: ActivityActor;
  action: string;
  resource?: ActivityResource;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface RawActivityItem {
  _id: string;
  actor: ActivityActor;
  action: string;
  resource?: ActivityResource;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface PaginatedActivityResponse {
  statusCode: number;
  message: string;
  success: boolean;
  data: RawActivityItem[];
  meta: {
    total: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}
