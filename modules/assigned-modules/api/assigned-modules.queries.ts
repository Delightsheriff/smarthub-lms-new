"use client";
import { useQuery } from "@tanstack/react-query";
import { assignedModulesService } from "./assigned-modules.service";
import { normaliseAssignedModule } from "./normalise";
import type { AssignedModule } from "../types";

export const ASSIGNED_MODULES_QUERY_KEYS = {
  all: ["assigned-modules"] as const,
} as const;

export function useAssignedModules() {
  return useQuery<AssignedModule[]>({
    queryKey: ASSIGNED_MODULES_QUERY_KEYS.all,
    queryFn: async () => {
      const data = await assignedModulesService.getAssigned();
      return data.map(normaliseAssignedModule);
    },
  });
}
