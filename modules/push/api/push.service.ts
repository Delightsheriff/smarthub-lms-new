import { apiClient } from "@/lib/api";
import { PUSH_ENDPOINTS } from "../config/endpoints";
import type { PushConfig, PushSubscribePayload, NotificationPrefs } from "../types";

class PushService {
  async config(): Promise<PushConfig> {
    return apiClient.get<PushConfig>(PUSH_ENDPOINTS.CONFIG, { silent: true });
  }

  async subscribe(payload: PushSubscribePayload): Promise<void> {
    await apiClient.post(PUSH_ENDPOINTS.SUBSCRIBE, payload);
  }

  async unsubscribe(endpoint: string): Promise<void> {
    await apiClient.delete(PUSH_ENDPOINTS.SUBSCRIBE, { params: { endpoint } });
  }

  async getPrefs(): Promise<NotificationPrefs> {
    return apiClient.get<NotificationPrefs>(PUSH_ENDPOINTS.PREFS, { silent: true });
  }

  async updatePrefs(payload: Partial<NotificationPrefs>): Promise<NotificationPrefs> {
    return apiClient.patch<NotificationPrefs>(PUSH_ENDPOINTS.PREFS, payload);
  }
}

export const pushService = new PushService();
