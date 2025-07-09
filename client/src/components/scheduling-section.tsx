import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Brain, Clock, CheckSquare } from "lucide-react";
import LeadForm from "./lead-form";
import IntelligentScheduler from "./intelligent-scheduler";

export default function SchedulingSection() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [allowMultipleSlots, setAllowMultipleSlots] = useState(false);
  const [useIntelligentScheduler, setUseIntelligentScheduler] = useState(false);

  // Format date for API
  const formatDateForAPI = (date: Date | undefined) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get available slots for selected date
  const { data: slots = [], isLoading: slotsLoading, error: slotsError, refetch: refetchSlots } = useQuery({
    queryKey: ["/api/available-slots", formatDateForAPI(selectedDate)],
    queryFn: async () => {
      const date = formatDateForAPI(selectedDate);
      if (!date) return [];
      
      const response = await fetch(`/api/available-slots?date=${encodeURIComponent(date)}`);
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!selectedDate,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Auto-refresh when date changes
  useEffect(() => {
    if (selectedDate) {
      refetchSlots();
    }
  }, [selectedDate, refetchSlots]);

  const handleTimeSlotToggle = (time: string) => {
    if (allowMultipleSlots) {
      setSelectedTimes(prev => 
        prev.includes(time) 
          ? prev.filter(t => t !== time)
          : [...prev, time].sort()
      );
    } else {
      setSelectedTime(time);
    }
  };

  return (
    <section id="agendar" className="py-12 md:py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 md:px-6">
        <Card className="max-w-6xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-3xl md:rounded-2xl overflow-hidden">
          <CardContent className="p-4 md:p-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 md:mb-4">
                Agende sua Reunião
              </h2>
              <p className="text-base md:text-lg text-gray-600">
                Escolha a melhor data e horário para conversarmos sobre seu projeto
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Calendar and Time Slots - First on Mobile */}
              <div className="order-1 space-y-3 sm:space-y-4 md:space-y-6">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl md:rounded-xl">
                  <h4 className="font-semibold text-sm sm:text-base md:text-lg mb-2 sm:mb-3 text-center">Selecione a data:</h4>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-xl sm:rounded-2xl md:rounded-xl border-2 border-white shadow-lg bg-white text-sm scale-90 sm:scale-100 origin-center"
                    />
                  </div>
                </div>

                {selectedDate && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col gap-3">
                      <h5 className="font-medium text-sm sm:text-base md:text-lg text-center">Horários disponíveis:</h5>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                        {/* Toggle para múltiplos horários - Mobile Native */}
                        <div className="flex items-center justify-center space-x-2 bg-gray-50 rounded-xl px-3 py-2 min-h-[44px]">
                          <Switch
                            id="multiple-slots"
                            checked={allowMultipleSlots}
                            onCheckedChange={setAllowMultipleSlots}
                            className="touch-manipulation"
                          />
                          <Label htmlFor="multiple-slots" className="text-xs sm:text-sm flex items-center gap-1 font-medium">
                            <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                            Múltiplos horários
                          </Label>
                        </div>
                        
                        {/* Toggle para IA - Mobile Native */}
                        <Button
                          variant={useIntelligentScheduler ? "default" : "outline"}
                          size="sm"
                          onClick={() => setUseIntelligentScheduler(!useIntelligentScheduler)}
                          className="gap-2 min-h-[44px] text-xs sm:text-sm font-medium touch-manipulation rounded-xl"
                        >
                          <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
                          {useIntelligentScheduler ? 'IA Ativa' : 'Usar IA'}
                        </Button>
                      </div>
                    </div>

                    {useIntelligentScheduler ? (
                      <IntelligentScheduler
                        selectedDate={selectedDate}
                        onTimeSelect={(time) => {
                          if (allowMultipleSlots) {
                            setSelectedTimes(prev => 
                              prev.includes(time) 
                                ? prev.filter(t => t !== time)
                                : [...prev, time].sort()
                            );
                          } else {
                            setSelectedTime(time);
                          }
                        }}
                        selectedTime={selectedTime}
                      />
                    ) : (
                      <>
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
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                              {slots.map((slot: string) => {
                                const isSelected = allowMultipleSlots 
                                  ? selectedTimes.includes(slot)
                                  : selectedTime === slot;
                                
                                return (
                                  <button
                                    key={slot}
                                    onClick={() => handleTimeSlotToggle(slot)}
                                    className={`px-2 py-3 md:px-3 md:py-2 border rounded-xl md:rounded text-sm transition-all min-h-[44px] md:min-h-[40px] font-medium ${
                                      isSelected
                                        ? "bg-primary text-white border-primary shadow-md scale-105"
                                        : "border-gray-300 hover:bg-primary/10 hover:border-primary/30 hover:shadow-sm"
                                    }`}
                                  >
                                    {slot}
                                    {allowMultipleSlots && isSelected && (
                                      <span className="ml-1 text-xs">✓</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Show selected times when multiple */}
                            {allowMultipleSlots && selectedTimes.length > 0 && (
                              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                    <p className="text-sm text-blue-800 font-semibold">
                                      {selectedTimes.length} horário{selectedTimes.length > 1 ? 's' : ''} selecionado{selectedTimes.length > 1 ? 's' : ''}:
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedTimes([])}
                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 px-2 py-1 h-auto text-xs"
                                  >
                                    Limpar todos
                                  </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {selectedTimes.map((time) => (
                                    <span
                                      key={time}
                                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-colors"
                                    >
                                      {time}
                                      <button
                                        onClick={() => setSelectedTimes(prev => prev.filter(t => t !== time))}
                                        className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none hover:bg-blue-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                                        title="Remover este horário"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))}
                                </div>
                                <p className="text-xs text-blue-600 mt-2">
                                  💡 Clique nos horários acima para removê-los ou selecione mais horários da lista
                                </p>
                              </div>
                            )}

                            {/* Informativo quando múltiplos horários está ativo mas nenhum selecionado */}
                            {allowMultipleSlots && selectedTimes.length === 0 && (
                              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2">
                                  <CheckSquare className="h-4 w-4 text-green-600" />
                                  <p className="text-sm text-green-800 font-medium">
                                    Modo múltiplos horários ativo
                                  </p>
                                </div>
                                <p className="text-xs text-green-600 mt-1">
                                  Você pode selecionar vários horários clicando em cada um deles
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-500 bg-red-50 rounded-lg border border-red-200">
                            <CalendarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="font-medium text-red-700 text-base">📅 Nenhum horário disponível</p>
                            <p className="text-sm text-red-600 mt-1">Todos os horários estão ocupados nesta data</p>
                            <p className="text-xs text-red-500 mt-2">Escolha outra data</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Form - Second on Mobile */}
              <div className="order-2 space-y-6">
                <LeadForm 
                  selectedDate={selectedDate} 
                  selectedTime={selectedTime}
                  selectedTimes={selectedTimes}
                  allowMultipleSlots={allowMultipleSlots}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}