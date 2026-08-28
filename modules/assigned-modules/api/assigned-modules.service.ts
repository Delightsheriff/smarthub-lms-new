import { apiClient } from "@/lib/api";
import { ASSIGNED_MODULES_ENDPOINTS } from "../config/endpoints";
import type { ApiAssignedModule } from "../types/api.types";

class AssignedModulesService {
  async getAssigned(): Promise<ApiAssignedModule[]> {
    return apiClient.get<ApiAssignedModule[]>(
      ASSIGNED_MODULES_ENDPOINTS.ASSIGNED,
    );
  }
}

export const assignedModulesService = new AssignedModulesService();
