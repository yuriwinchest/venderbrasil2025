import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import LeadForm from "./lead-form";
import { useQuery } from "@tanstack/react-query";

export default function SchedulingSection() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Format date for API query - Fix timezone issue
  const formatDateForAPI = (date: Date | undefined) => {
    if (!date) return "";
    // Fix: Usar timezone local para evitar problemas de fuso horário
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch available slots for selected date
  const { data: availableSlots = [], isLoading: slotsLoading, error: slotsError } = useQuery<string[]>({
    queryKey: ['/api/available-slots', formatDateForAPI(selectedDate)],
    queryFn: async () => {
      const date = formatDateForAPI(selectedDate);
      if (!date) return [];
      console.log('Buscando horários para:', date);
      const response = await fetch(`/api/available-slots?date=${date}`);
      if (!response.ok) throw new Error('Erro ao buscar horários');
      const result = await response.json();
      console.log('Horários retornados:', result);
      return result;
    },
    enabled: !!selectedDate && formatDateForAPI(selectedDate) !== ""
  });

  // Type guard to ensure availableSlots is string array
  const slots: string[] = Array.isArray(availableSlots) ? availableSlots : [];

  // Reset selected time when date changes
  useEffect(() => {
    setSelectedTime("");
  }, [selectedDate]);

  return (
    <section id="contato" className="py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Agende sua Conversa Gratuita
          </h2>
          <p className="text-lg sm:text-xl text-gray-600">
            Vamos conversar sobre seu projeto em 15 minutos
          </p>
        </div>
        
        <Card className="shadow-xl border-0">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:grid md:grid-cols-2 gap-6 sm:gap-8">
              {/* Seção de Data e Horário - Primeira no Mobile */}
              <div className="order-1">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Escolha uma data</h3>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 md:p-6">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date.getDay() === 0}
                    className="rounded-md border-0 w-full mx-auto [&_table]:w-full [&_td]:text-center [&_th]:text-center [&_td]:p-1 [&_th]:p-1 [&_button]:w-8 [&_button]:h-8 [&_button]:text-sm"
                  />
                  
                  {selectedDate && (
                    <div className="mt-4 sm:mt-6">
                      <h5 className="font-medium mb-3 text-sm sm:text-base">Horários disponíveis:</h5>
                      {slotsLoading ? (
                        <div className="text-center py-6 text-gray-500">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm">Carregando horários...</p>
                        </div>
                      ) : slotsError ? (
                        <div className="text-center py-4 text-red-500 bg-red-50 rounded-lg border border-red-200">
                          <p className="font-medium text-red-700 text-sm">Erro ao carregar horários</p>
                          <p className="text-xs text-red-600">Tente selecionar a data novamente</p>
                        </div>
                      ) : slots.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 gap-2">
                          {slots.map((slot: string) => (
                            <button
                              key={slot}
                              onClick={() => setSelectedTime(slot)}
                              className={`px-2 py-3 sm:px-3 sm:py-2 border rounded text-sm sm:text-sm transition-all min-h-[44px] sm:min-h-[40px] font-medium ${
                                selectedTime === slot
                                  ? "bg-primary text-white border-primary shadow-md scale-105"
                                  : "border-gray-300 hover:bg-primary/10 hover:border-primary/30 hover:shadow-sm"
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-500 bg-red-50 rounded-lg border border-red-200">
                          <p className="font-medium text-red-700 text-base">📅 Nenhum horário disponível</p>
                          <p className="text-sm text-red-600 mt-1">Todos os horários estão ocupados nesta data</p>
                          <p className="text-xs text-red-500 mt-2">Escolha outra data</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Formulário - Segunda no Mobile */}
              <div className="order-2">
                <LeadForm 
                  selectedDate={selectedDate} 
                  selectedTime={selectedTime}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
