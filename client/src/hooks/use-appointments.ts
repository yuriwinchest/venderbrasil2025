import { useQuery } from "@tanstack/react-query";
import type { Appointment } from "@shared/schema";

export function useAppointments() {
  return useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    refetchInterval: 2000, // Atualiza a cada 2 segundos
    staleTime: 1000, // Considera dados obsoletos após 1 segundo
  });
}
