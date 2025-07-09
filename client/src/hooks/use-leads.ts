import { useQuery } from "@tanstack/react-query";
import type { Lead } from "@shared/schema";

export function useLeads() {
  return useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });
}
