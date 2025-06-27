// Componente responsável pela seção de chamada para ação final
// Responsabilidade: Incentivar o usuário a entrar em contato

import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle } from "lucide-react";

interface CTASectionProps {
  onScheduleClick: () => void;
}

export default function CTASection({ onScheduleClick }: CTASectionProps) {
  return (
    <section className="py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-primary text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
          Pronto para transformar sua ideia em realidade?
        </h2>
        <p className="text-lg sm:text-xl mb-6 sm:mb-8 opacity-90">
          Agende uma conversa gratuita e descubra como podemos ajudar seu negócio a crescer online.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onScheduleClick}
            size="lg"
            className="bg-white text-primary hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Agendar Conversa Gratuita
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-300"
            onClick={() => window.open('https://wa.me/5561993521849?text=Olá! Gostaria de conversar sobre desenvolvimento de um site.')}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            WhatsApp Direto
          </Button>
        </div>
        
        <p className="text-sm opacity-75 mt-6">
          Resposta em até 2 horas • Sem compromisso
        </p>
      </div>
    </section>
  );
}