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
}

export default function LeadForm({ selectedDate, selectedTime }: LeadFormProps) {
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

  // Generate WhatsApp confirmation message
  const generateWhatsAppMessage = (data: LeadFormData) => {
    const dateStr = selectedDate ? selectedDate.toLocaleDateString('pt-BR') : '';
    const message = `Agendamento confirmado!

Reunião marcada para ${dateStr} às ${selectedTime}.
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
        
        // Create appointment if date and time are selected
        if (selectedDate && selectedTime) {
          // CRÍTICO: Garantir que a data seja formatada corretamente no timezone local
          // Usar UTC para evitar problemas de timezone
          const year = selectedDate.getFullYear();
          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const day = String(selectedDate.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`; // YYYY-MM-DD format EXATO
          
          console.log('Data selecionada pelo cliente:', selectedDate);
          console.log('Data que será salva no banco:', dateStr);
          console.log('Horário selecionado pelo cliente:', selectedTime);
          
          const appointmentPayload = {
            name: data.name,
            email: data.email,
            phone: data.whatsapp,
            date: dateStr, // Esta deve ser a data ESCOLHIDA pelo cliente
            time: selectedTime, // Este deve ser o horário ESCOLHIDO pelo cliente
            notes: `Serviço: ${data.serviceType}${data.message ? ` - ${data.message}` : ''}`,
          };
          
          console.log('Payload sendo enviado para API:', appointmentPayload);
          
          const appointmentResponse = await apiRequest("POST", "/api/appointments", appointmentPayload);
          
          const appointmentResult = await appointmentResponse.json();
          
          return {
            lead: leadResult,
            appointment: appointmentResult
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
      
      if (result.appointment) {
        const formData = form.getValues();
        
        // Generate WhatsApp link for client
        const generateClientWhatsAppLink = (data: any) => {
          const cleanPhone = data.whatsapp.replace(/\D/g, '');
          const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
          
          const dateStr = selectedDate ? selectedDate.toLocaleDateString('pt-BR') : '';
          const message = encodeURIComponent(`*Reunião Agendada - Vender Brasil* 🚀

Olá! Seu agendamento foi confirmado:

📅 *Data:* ${dateStr}
⏰ *Horário:* ${selectedTime}
💼 *Projeto:* ${data.serviceType}

${data.message ? `📝 *Detalhes:* ${data.message}` : ''}

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
        
        toast({
          title: "Agendamento confirmado!",
          description: `Reunião marcada para ${selectedDate?.toLocaleDateString('pt-BR')} às ${selectedTime}. Abrindo WhatsApp...`,
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
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Selecione data e horário",
        description: "Escolha uma data e horário disponível para continuar.",
        variant: "destructive",
      });
      return;
    }
    
    createLeadMutation.mutate(data);
  };

  return (
    <div>
      <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Seus dados</h3>
      
      {/* Display selected date and time - mais visível no mobile */}
      {selectedDate && selectedTime && (
        <div className="mb-4 sm:mb-6 p-4 sm:p-4 bg-green-50 border-2 border-green-200 rounded-lg shadow-sm">
          <h4 className="font-semibold text-green-900 mb-2 text-base sm:text-base flex items-center">
            <CalendarCheck className="mr-2 h-4 w-4" />
            Agendamento confirmado:
          </h4>
          <div className="text-green-800">
            <p className="font-semibold text-base sm:text-base">{formatDateDisplay(selectedDate)}</p>
            <p className="text-sm sm:text-sm font-medium">⏰ Horário: {selectedTime}</p>
          </div>
        </div>
      )}
      
      {/* Alerta quando não há data/horário selecionado */}
      {(!selectedDate || !selectedTime) && (
        <div className="mb-4 sm:mb-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
          <h4 className="font-medium text-orange-900 mb-2 text-sm sm:text-base">
            📅 Primeiro, selecione uma data e horário acima
          </h4>
          <p className="text-orange-700 text-xs sm:text-sm">
            Escolha a data e um horário disponível para continuar com o agendamento.
          </p>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome completo</FormLabel>
                <FormControl>
                  <Input placeholder="Digite seu nome" {...field} />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="seu@email.com" {...field} />
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
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="(11) 99999-9999" {...field} />
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
              disabled={createLeadMutation.isPending || !selectedDate || !selectedTime}
              size="lg"
            >
              <MessageCircle className="mr-2 h-5 w-5 sm:h-5 sm:w-5" />
              {createLeadMutation.isPending ? "Confirmando..." : 
               selectedDate && selectedTime ? "📱 Confirmar e Abrir WhatsApp" : "⏰ Selecione data e horário"}
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
