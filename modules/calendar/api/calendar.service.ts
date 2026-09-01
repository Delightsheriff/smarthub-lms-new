import { apiClient } from "@/lib/api";
import { CALENDAR_ENDPOINTS } from "../config/endpoints";
import type { ApiCalendarEvent } from "../types";

class CalendarService {
  async getEvents(range?: { from?: string; to?: string }): Promise<ApiCalendarEvent[]> {
    return apiClient.get<ApiCalendarEvent[]>(CALENDAR_ENDPOINTS.LIST, {
      params: range,
    });
  }
}

export const calendarService = new CalendarService();
