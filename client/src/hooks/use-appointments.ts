import { useQuery } from "@tanstack/react-query";
import type { Appointment } from "@shared/schema";

export function useAppointments() {
  return useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });
}
