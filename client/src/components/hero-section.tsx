// YAGNI: Removido imports desnecessários - mantendo apenas o essencial
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle } from "lucide-react";
import { EmotionEnhancedButton } from "@/components/emotion-enhanced-button";
import { useAIGreeting } from "@/hooks/use-ai-greeting";

interface HeroSectionProps {
  onScheduleClick: () => void;
  onPortfolioClick: () => void;
}

// YAGNI: Simplificado - removendo complexidade desnecessária
export default function HeroSection({ onScheduleClick, onPortfolioClick }: HeroSectionProps) {
  const { greeting, isLoading } = useAIGreeting();

  return (
    <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center text-white">
        {/* Simplified Greeting */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 sm:p-6 shadow-lg border border-gray-200/50 max-w-2xl mx-auto">
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {isLoading ? "Carregando..." : greeting.greeting}
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">
                {isLoading ? "Preparando sua experiência..." : greeting.message}
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Sites & Apps Flutter a partir de
        </h1>
        <div className="text-6xl md:text-8xl font-extrabold text-yellow-300 mb-6">
          R$500
        </div>
        <p className="text-xl md:text-2xl mb-6 opacity-90 leading-relaxed">
          Transforme sua ideia em realidade. Sites modernos, apps Flutter e sistemas otimizados para seu negócio.
        </p>

        {/* Enhanced CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onScheduleClick}
            size="lg" 
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-10 py-5 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-red-500"
          >
            🚀 Solicitar Orçamento Gratuito
          </Button>
          
          <Button 
            onClick={onPortfolioClick}
            variant="outline" 
            size="lg"
            className="border-3 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold px-10 py-5 text-lg transition-all duration-300 hover:scale-105 bg-white shadow-lg hover:shadow-xl"
          >
            📂 Ver Portfólio
          </Button>

          <Button
            onClick={() => window.location.href = '/analisar-projeto'}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold px-10 py-5 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-purple-500"
          >
            🤖 Simular Custo com IA
          </Button>
        </div>

        {/* WhatsApp direct contact */}
        <div className="mt-6">
          <Button
            onClick={() => window.open('https://wa.me/5561993521849?text=Olá! Gostaria de conversar sobre desenvolvimento de um site.')}
            variant="ghost"
            className="text-white hover:bg-white/10 px-6 py-3"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            WhatsApp Direto
          </Button>
        </div>
      </div>
    </section>
  );
}