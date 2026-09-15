import { apiClient } from "@/lib/api";
import { NOTIFICATIONS_ENDPOINTS } from "../config/endpoints";
import type { ApiNotification } from "../types/api.types";

class NotificationsService {
  async getNotifications(): Promise<ApiNotification[]> {
    return apiClient.get<ApiNotification[]>(NOTIFICATIONS_ENDPOINTS.LIST);
  }

  async markRead(id: string): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(NOTIFICATIONS_ENDPOINTS.MARK_READ(id));
  }

  async markAllRead(): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(NOTIFICATIONS_ENDPOINTS.MARK_ALL_READ);
  }
}

export const notificationsService = new NotificationsService();
