import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarCheck, MessageCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const leadFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email deve ser válido"),
  whatsapp: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos"),
  serviceType: z.string().min(1, "Selecione um tipo de serviço"),
  message: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

interface LeadFormProps {
  selectedDate?: Date;
  selectedTime: string;
  selectedTimes?: string[];
  allowMultipleSlots?: boolean;
}

export default function LeadForm({ selectedDate, selectedTime, selectedTimes = [], allowMultipleSlots = false }: LeadFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Format date for display
  const formatDateDisplay = (date: Date | undefined) => {
    if (!date) return "";
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if we have valid selections
  const hasValidSelection = () => {
    if (!selectedDate) return false;
    
    if (allowMultipleSlots) {
      return selectedTimes.length > 0;
    } else {
      return selectedTime && selectedTime.trim() !== '';
    }
  };

  // Generate WhatsApp confirmation message
  const generateWhatsAppMessage = (data: LeadFormData) => {
    const dateStr = selectedDate ? selectedDate.toLocaleDateString('pt-BR') : '';
    let timeInfo;
    
    if (allowMultipleSlots && selectedTimes.length > 0) {
      timeInfo = selectedTimes.length === 1 
        ? `às ${selectedTimes[0]}`
        : `nos horários: ${selectedTimes.join(', ')}`;
    } else {
      timeInfo = `às ${selectedTime}`;
    }
    
    const message = `Agendamento confirmado!

Reunião marcada para ${dateStr} ${timeInfo}.
Entraremos em contato em breve.`;
    return encodeURIComponent(message);
  };

  // Open WhatsApp Web with message
  const openWhatsAppWeb = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://web.whatsapp.com/send?phone=55${cleanPhone}&text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      whatsapp: "",
      serviceType: "",
      message: "",
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: LeadFormData) => {
      try {
        // Create lead first
        const response = await apiRequest("POST", "/api/leads", data);
        const leadResult = await response.json();
        
        // Create appointment(s) if date and time(s) are selected
        if (selectedDate && hasValidSelection()) {
          // CRÍTICO: Garantir que a data seja formatada corretamente no timezone local
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const day = String(selectedDate.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`; // YYYY-MM-DD format EXATO
          
          console.log('Data selecionada pelo cliente:', selectedDate);
          console.log('Data que será salva no banco:', dateStr);
          
          let appointments: any[] = [];
          
          // Determinar quais horários criar agendamentos
          const timesToBook = allowMultipleSlots && selectedTimes.length > 0 
            ? selectedTimes 
            : [selectedTime];
          
          console.log('Horários que serão agendados:', timesToBook);
          
          // Criar agendamento para cada horário selecionado
          for (const time of timesToBook) {
            if (time && time.trim() !== '') {
              const appointmentPayload = {
                name: data.name,
                email: data.email,
                phone: data.whatsapp,
                date: dateStr,
                time: time,
                notes: `Serviço: ${data.serviceType}${data.message ? ` - ${data.message}` : ''}${timesToBook.length > 1 ? ` (Horário ${timesToBook.indexOf(time) + 1} de ${timesToBook.length})` : ''}`,
              };
              
              console.log(`Criando agendamento para ${time}:`, appointmentPayload);
              
              try {
                const appointmentResponse = await apiRequest("POST", "/api/appointments", appointmentPayload);
                const appointmentResult = await appointmentResponse.json();
                appointments.push(appointmentResult);
                console.log(`✅ Agendamento criado para ${time}:`, appointmentResult);
              } catch (error: any) {
                console.error(`❌ Erro ao criar agendamento para ${time}:`, error);
                const errorMessage = error?.message || 'Erro desconhecido';
                throw new Error(`Erro ao agendar horário ${time}: ${errorMessage}`);
              }
            }
          }
          
          return {
            lead: leadResult,
            appointments: appointments,
            appointment: appointments[0] // Para compatibilidade com código existente
          };
        }
        
        return { lead: leadResult };
      } catch (error) {
        console.error("Error in lead/appointment creation:", error);
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/new-count"] });
      // Força atualização imediata
      queryClient.refetchQueries({ queryKey: ["/api/appointments"] });
      
      if (result.appointment || (result.appointments && result.appointments.length > 0)) {
        const formData = form.getValues();
        const appointments = result.appointments || [result.appointment];
        const appointmentCount = appointments.length;
        
        // Generate WhatsApp link for client
        const generateClientWhatsAppLink = (data: any) => {
          const cleanPhone = data.whatsapp.replace(/\D/g, '');
          const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
          
          const dateStr = selectedDate ? selectedDate.toLocaleDateString('pt-BR') : '';
          
          let timeInfo;
          if (allowMultipleSlots && selectedTimes.length > 0) {
            timeInfo = selectedTimes.length === 1 
              ? `⏰ *Horário:* ${selectedTimes[0]}`
              : `⏰ *Horários:* ${selectedTimes.join(', ')}`;
          } else {
            timeInfo = `⏰ *Horário:* ${selectedTime}`;
          }
          
          const message = encodeURIComponent(`*Reunião${appointmentCount > 1 ? 's' : ''} Agendada${appointmentCount > 1 ? 's' : ''} - Vender Brasil* 🚀

Olá! Seu${appointmentCount > 1 ? 's' : ''} agendamento${appointmentCount > 1 ? 's foram confirmados' : ' foi confirmado'}:

📅 *Data:* ${dateStr}
${timeInfo}
💼 *Projeto:* ${data.serviceType}

${data.message ? `📝 *Detalhes:* ${data.message}` : ''}

${appointmentCount > 1 ? `✅ *Total:* ${appointmentCount} reuniões agendadas` : ''}

---
Aguardo você! Em caso de dúvidas, responda esta mensagem.

*Dim Winchester*
*Desenvolvedor Full-Stack*
*Vender Brasil*`);
          
          return `https://web.whatsapp.com/send?phone=${fullPhone}&text=${message}`;
        };
        
        // Open WhatsApp link
        const whatsappLink = generateClientWhatsAppLink(formData);
        window.open(whatsappLink, '_blank');
        
        // Toast message
        let toastMessage;
        if (allowMultipleSlots && selectedTimes.length > 1) {
          toastMessage = `${selectedTimes.length} reuniões marcadas para ${selectedDate?.toLocaleDateString('pt-BR')} nos horários: ${selectedTimes.join(', ')}`;
        } else {
          const timeToShow = allowMultipleSlots && selectedTimes.length > 0 ? selectedTimes[0] : selectedTime;
          toastMessage = `Reunião marcada para ${selectedDate?.toLocaleDateString('pt-BR')} às ${timeToShow}`;
        }
        
        toast({
          title: `Agendamento${appointmentCount > 1 ? 's confirmados' : ' confirmado'}!`,
          description: `${toastMessage}. Abrindo WhatsApp...`,
        });

        // Generate and send WhatsApp message
        setTimeout(() => {
          const whatsappMessage = generateWhatsAppMessage(formData);
          openWhatsAppWeb(formData.whatsapp, whatsappMessage);
        }, 1000);
      } else {
        toast({
          title: "Lead cadastrado com sucesso!",
          description: "Entraremos em contato em breve.",
        });
      }
      
      form.reset();
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      
      // Extract error message from the error object
      let errorMessage = "Tente novamente em alguns instantes.";
      let errorTitle = "Erro ao processar solicitação";
      
      if (error?.message) {
        const message = error.message.toLowerCase();
        
        if (message.includes("já está ocupado") || message.includes("horário já está ocupado")) {
          errorMessage = "Este horário já está ocupado. Escolha outro horário disponível.";
          errorTitle = "Horário Indisponível";
        } else if (message.includes("dados de agendamento inválidos") || message.includes("invalid")) {
          errorMessage = "Verifique os dados inseridos e tente novamente.";
          errorTitle = "Dados Inválidos";
        } else if (message.includes("duplicate") || message.includes("unique")) {
          errorMessage = "Já existe um agendamento para este horário.";
          errorTitle = "Conflito de Agendamento";
        } else if (message.includes("erro interno") || message.includes("500")) {
          errorMessage = "Erro interno do servidor. Tente novamente em alguns minutos.";
          errorTitle = "Erro do Servidor";
        } else if (error.message.length > 0 && !error.message.includes(":")) {
          // Use the server message directly if it's a clean message
          errorMessage = error.message;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LeadFormData) => {
    if (!selectedDate || !hasValidSelection()) {
      toast({
        title: "Selecione data e horário",
        description: allowMultipleSlots 
          ? "Escolha uma data e pelo menos um horário disponível para continuar."
          : "Escolha uma data e horário disponível para continuar.",
        variant: "destructive",
      });
      return;
    }
    
    createLeadMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 text-center md:text-left">Seus dados</h3>
      
      {/* Display selected date and time - Mobile Nativo */}
      {selectedDate && selectedTime && (
        <div className="mb-4 md:mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-2xl md:rounded-lg shadow-sm">
          <h4 className="font-semibold text-green-900 mb-2 text-base flex items-center justify-center md:justify-start">
            <CalendarCheck className="mr-2 h-5 w-5" />
            Agendamento confirmado
          </h4>
          <div className="text-green-800 text-center md:text-left">
            <p className="font-semibold text-base">{formatDateDisplay(selectedDate)}</p>
            <p className="text-sm font-medium">⏰ Horário: {selectedTime}</p>
          </div>
        </div>
      )}
      
      {/* Alerta quando não há data/horário selecionado - Mobile Nativo */}
      {(!selectedDate || !selectedTime) && (
        <div className="mb-4 md:mb-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-2xl md:rounded-lg">
          <h4 className="font-medium text-orange-900 mb-2 text-sm md:text-base text-center md:text-left">
            📅 Primeiro, selecione uma data e horário acima
          </h4>
          <p className="text-orange-700 text-xs md:text-sm text-center md:text-left">
            Escolha a data e um horário disponível para continuar com o agendamento.
          </p>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 md:space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base font-medium">Nome completo</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Digite seu nome" 
                    className="min-h-[48px] sm:h-12 md:h-10 text-base rounded-xl md:rounded-md border-2 focus:border-blue-500 touch-manipulation" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base font-medium">Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="seu@email.com" 
                    className="min-h-[48px] sm:h-12 md:h-10 text-base rounded-xl md:rounded-md border-2 focus:border-blue-500 touch-manipulation" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base font-medium">WhatsApp</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(11) 99999-9999" 
                    className="min-h-[48px] sm:h-12 md:h-10 text-base rounded-xl md:rounded-md border-2 focus:border-blue-500 touch-manipulation" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="serviceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de projeto desejado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Site Institucional">Site Institucional</SelectItem>
                    <SelectItem value="Loja Virtual">Loja Virtual</SelectItem>
                    <SelectItem value="Landing Page">Landing Page</SelectItem>
                    <SelectItem value="App Flutter">Aplicativo Flutter</SelectItem>
                    <SelectItem value="Sistema Web">Sistema Web</SelectItem>
                    <SelectItem value="Blog/Portal">Blog/Portal</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mensagem (opcional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Conte um pouco sobre seu projeto..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Botão de confirmação - aparece no final no mobile */}
          <div className="mt-6 sm:mt-8">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 sm:py-4 text-base sm:text-lg font-bold transition-all hover:scale-105 min-h-[50px] sm:min-h-[56px] shadow-xl border-2 border-green-500"
              disabled={createLeadMutation.isPending || !hasValidSelection()}
              size="lg"
            >
              <MessageCircle className="mr-2 h-5 w-5 sm:h-5 sm:w-5" />
              {createLeadMutation.isPending ? "Confirmando..." : 
               hasValidSelection() ? "📱 Confirmar e Abrir WhatsApp" : "⏰ Selecione data e horário"}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-3">
              Ao agendar, você concorda com nossa política de privacidade
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
