import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Calendar as CalendarIcon,
  Brain,
  Shield,
  Zap,
  Target
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ConflictResult {
  hasConflict: boolean;
  conflictType: 'exact_match' | 'overlap' | 'buffer_violation' | 'none';
  conflictingAppointments: Array<{
    id: number;
    name: string;
    time: string;
    date: string;
    status: string;
  }>;
  suggestions: string[];
  alternativeSlots: string[];
}

interface SchedulerProps {
  onTimeSelect: (time: string) => void;
  selectedDate: Date | undefined;
  selectedTime: string;
}

export default function IntelligentScheduler({ onTimeSelect, selectedDate, selectedTime }: SchedulerProps) {
  const [timePreference, setTimePreference] = useState<'morning' | 'afternoon' | 'evening'>('afternoon');
  const [flexibility, setFlexibility] = useState<'strict' | 'moderate' | 'flexible'>('moderate');
  const [showConflictCheck, setShowConflictCheck] = useState(false);
  const { toast } = useToast();

  // Format date for API
  const formatDateForAPI = (date: Date | undefined) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get intelligent slot recommendations
  const { data: recommendedSlots = [], isLoading: slotsLoading } = useQuery<string[]>({
    queryKey: ['/api/available-slots', formatDateForAPI(selectedDate), timePreference, flexibility],
    queryFn: async () => {
      const date = formatDateForAPI(selectedDate);
      if (!date) return [];
      
      const params = new URLSearchParams({
        date,
        timePreference,
        flexibility
      });
      
      const response = await fetch(`/api/available-slots?${params}`);
      if (!response.ok) throw new Error('Erro ao buscar horários');
      return response.json();
    },
    enabled: !!selectedDate
  });

  // Conflict analysis for the week
  const { data: conflictAnalysis } = useQuery({
    queryKey: ['/api/analyze-conflicts'],
    queryFn: async () => {
      const response = await fetch('/api/analyze-conflicts');
      if (!response.ok) throw new Error('Erro ao analisar conflitos');
      return response.json();
    }
  });

  // Real-time conflict checking
  const { data: conflictResult } = useQuery<ConflictResult>({
    queryKey: ['/api/check-conflicts', formatDateForAPI(selectedDate), selectedTime],
    queryFn: async () => {
      const response = await fetch('/api/check-conflicts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formatDateForAPI(selectedDate),
          time: selectedTime,
          name: 'Verificação',
          email: '',
          phone: ''
        })
      });
      if (!response.ok) throw new Error('Erro ao verificar conflitos');
      return response.json();
    },
    enabled: !!selectedDate && !!selectedTime && showConflictCheck,
    refetchInterval: 5000 // Check every 5 seconds
  });

  // Auto-enable conflict checking when time is selected
  useEffect(() => {
    if (selectedTime) {
      setShowConflictCheck(true);
    } else {
      setShowConflictCheck(false);
    }
  }, [selectedTime]);

  const handleTimeSelection = (time: string) => {
    onTimeSelect(time);
    
    // Show immediate feedback
    toast({
      title: "Horário Selecionado",
      description: `Verificando disponibilidade para ${time}...`,
    });
  };

  const getConflictBadge = (conflictType: string) => {
    switch (conflictType) {
      case 'exact_match':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Ocupado</Badge>;
      case 'overlap':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Sobreposição</Badge>;
      case 'buffer_violation':
        return <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3" />Muito Próximo</Badge>;
      default:
        return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Disponível</Badge>;
    }
  };

  const getPriorityLevel = (time: string): 'high' | 'medium' | 'low' => {
    const hour = parseInt(time.split(':')[0]);
    
    if (timePreference === 'morning' && hour < 12) return 'high';
    if (timePreference === 'afternoon' && hour >= 12 && hour < 18) return 'high';
    if (timePreference === 'evening' && hour >= 18) return 'high';
    
    return hour >= 9 && hour <= 17 ? 'medium' : 'low';
  };

  return (
    <div className="space-y-6">
      {/* Intelligence Controls */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Brain className="h-5 w-5" />
            Agendamento Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Preferência de Horário
              </label>
              <Select value={timePreference} onValueChange={(value: any) => setTimePreference(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Manhã (8h-12h)</SelectItem>
                  <SelectItem value="afternoon">Tarde (12h-18h)</SelectItem>
                  <SelectItem value="evening">Noite (18h-23h)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Flexibilidade
              </label>
              <Select value={flexibility} onValueChange={(value: any) => setFlexibility(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strict">Rigoroso (horário exato)</SelectItem>
                  <SelectItem value="moderate">Moderado (±1 hora)</SelectItem>
                  <SelectItem value="flexible">Flexível (qualquer horário)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conflict Analysis Summary */}
      {conflictAnalysis && (
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <TrendingUp className="h-5 w-5" />
              Análise de Demanda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {conflictAnalysis.highRiskDates?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Dias com Alta Demanda</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {conflictAnalysis.optimalDates?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Dias Ideais</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {conflictAnalysis.recommendations?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Recomendações</div>
              </div>
            </div>
            
            {conflictAnalysis.recommendations?.length > 0 && (
              <div className="space-y-2">
                {conflictAnalysis.recommendations.slice(0, 2).map((rec: string, index: number) => (
                  <Alert key={index} className="border-amber-200">
                    <Target className="h-4 w-4" />
                    <AlertDescription className="text-amber-800">{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Intelligent Slot Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Horários Recomendados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {slotsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Analisando disponibilidade...</p>
            </div>
          ) : recommendedSlots.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <AnimatePresence>
                {recommendedSlots.map((slot, index) => {
                  const priority = getPriorityLevel(slot);
                  const isSelected = selectedTime === slot;
                  
                  return (
                    <motion.div
                      key={slot}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        className={`w-full p-4 h-auto flex flex-col gap-2 ${
                          priority === 'high' 
                            ? 'border-green-300 bg-green-50 hover:bg-green-100' 
                            : priority === 'medium'
                            ? 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                            : 'border-gray-300'
                        } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => handleTimeSelection(slot)}
                      >
                        <span className="font-semibold">{slot}</span>
                        <Badge 
                          size="sm" 
                          variant={
                            priority === 'high' ? 'default' : 
                            priority === 'medium' ? 'secondary' : 'outline'
                          }
                        >
                          {priority === 'high' ? 'Ideal' : priority === 'medium' ? 'Bom' : 'OK'}
                        </Badge>
                      </Button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum horário disponível para esta data</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Conflict Detection */}
      <AnimatePresence>
        {conflictResult && selectedTime && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className={`border-2 ${
              conflictResult.hasConflict 
                ? 'border-red-200 bg-red-50' 
                : 'border-green-200 bg-green-50'
            }`}>
              <CardHeader className="pb-4">
                <CardTitle className={`flex items-center gap-2 ${
                  conflictResult.hasConflict ? 'text-red-800' : 'text-green-800'
                }`}>
                  <Shield className="h-5 w-5" />
                  Verificação de Conflitos
                  {getConflictBadge(conflictResult.conflictType)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {conflictResult.hasConflict ? (
                  <div className="space-y-4">
                    {/* Conflict Details */}
                    <div className="space-y-2">
                      {conflictResult.suggestions.map((suggestion, index) => (
                        <Alert key={index} className="border-red-200">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-red-800">
                            {suggestion}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>

                    {/* Alternative Suggestions */}
                    {conflictResult.alternativeSlots.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-800 mb-3">
                          Horários Alternativos Próximos:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {conflictResult.alternativeSlots.map((altSlot) => (
                            <Button
                              key={altSlot}
                              variant="outline"
                              size="sm"
                              className="border-red-300 text-red-700 hover:bg-red-100"
                              onClick={() => handleTimeSelection(altSlot)}
                            >
                              {altSlot}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert className="border-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-800">
                      Horário {selectedTime} está disponível e livre de conflitos!
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}