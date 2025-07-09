import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle, FileText, ArrowRight, TrendingUp, CheckCircle, Calculator, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useAIGreeting } from "@/hooks/use-ai-greeting";

interface HeroSectionProps {
  onScheduleClick: () => void;
  onPortfolioClick: () => void;
}

export default function HeroSection({ onScheduleClick, onPortfolioClick }: HeroSectionProps) {
  const { greeting, isLoading } = useAIGreeting();

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-16 pt-16 md:pt-16">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 md:space-y-8"
        >
          {/* Destaque Principal - Mobile Native */}
          <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full px-3 py-2 sm:px-6 sm:py-3 mb-6 mx-auto max-w-fit">
            <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-400" />
            <span className="text-emerald-300 font-bold text-xs sm:text-lg">NOVO: Análise de Dados com IA GRATUITA</span>
          </div>
          
          {/* Título Mobile Native com Hierarquia Visual */}
          <h1 className="text-2xl sm:text-3xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 px-2">
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent block mb-1 sm:mb-2">
              Transforme Dados em Insights
            </span>
            <span className="text-white block">Websites que Vendem</span>
          </h1>
          
          {/* Descrição Mobile Native Otimizada */}
          <p className="text-base sm:text-lg md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-6 px-4 sm:px-2">
            Carregue planilhas CSV, Excel ou JSON e nossa IA gera gráficos profissionais, 
            estatísticas e insights valiosos em segundos. Mais websites completos com analytics avançados.
          </p>
          
          {/* BOTÃO PRINCIPAL - Mobile Native Touch-Friendly */}
          <div className="flex flex-col items-center gap-3 mb-6 px-4">
            <Link href="/upload-dados" className="group w-full max-w-sm sm:max-w-md md:max-w-none">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 active:from-emerald-700 active:to-blue-700 text-white font-bold px-4 py-4 sm:px-8 sm:py-5 md:px-12 md:py-6 text-base sm:text-lg md:text-2xl lg:text-3xl rounded-2xl md:rounded-full shadow-2xl hover:shadow-emerald-500/25 transition-all duration-200 transform hover:scale-105 active:scale-95 group-hover:animate-pulse w-full min-h-[56px] sm:min-h-[64px] md:min-h-auto touch-manipulation"
              >
                <FileText className="mr-2 sm:mr-3 md:mr-4 h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 flex-shrink-0" />
                <span className="block md:inline">ANEXAR ARQUIVO E GERAR GRÁFICOS</span>
                <ArrowRight className="ml-4 h-7 w-7 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            {/* Botões Secundários - Mobile Native Touch-Friendly */}
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-lg mx-auto">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-emerald-400 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400 hover:text-white active:bg-emerald-500 font-semibold px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-3 text-sm sm:text-base md:text-lg rounded-2xl md:rounded-full transition-all duration-200 backdrop-blur-sm flex-1 min-h-[48px] sm:min-h-[52px] md:min-h-auto touch-manipulation"
                onClick={() => window.location.href = '/analisar-projeto'}
              >
                <Calculator className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">Analisar Projeto com IA</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white bg-white/10 text-white hover:bg-white hover:text-blue-900 active:bg-gray-100 font-semibold px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-3 text-sm sm:text-base md:text-lg rounded-2xl md:rounded-full transition-all duration-200 backdrop-blur-sm flex-1 min-h-[48px] sm:min-h-[52px] md:min-h-auto touch-manipulation"
                onClick={onScheduleClick}
              >
                <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">Solicitar Orçamento</span>
              </Button>
            </div>
          </div>

          {/* Características Principais - Mobile Native Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-6 text-xs sm:text-sm px-4 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-3 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl md:rounded-full min-h-[44px]">
              <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span className="text-white font-medium text-center">Análise Gratuita de Dados</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-3 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl md:rounded-full min-h-[44px]">
              <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span className="text-white font-medium text-center">IA Avançada Inclusa</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-3 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl md:rounded-full min-h-[44px]">
              <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span className="text-white font-medium text-center">Websites a partir de R$ 500</span>
            </div>
            <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-3 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl md:rounded-full min-h-[44px]">
              <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span className="text-white font-medium text-center">Suporte 8h-23h</span>
            </div>
          </div>

          {/* WhatsApp direto - Mobile Native Touch-Friendly */}
          <div className="mt-4 sm:mt-6 md:mt-8">
            <Button
              onClick={() => window.open('https://wa.me/5561993521849?text=Olá! Quero testar o analisador de dados gratuito!')}
              variant="ghost"
              className="text-white hover:bg-white/20 active:bg-white/30 px-6 py-3 sm:px-8 sm:py-4 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl md:rounded-full font-medium text-sm sm:text-base md:text-lg transition-all duration-200 transform active:scale-95 min-h-[48px] touch-manipulation"
            >
              <MessageCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              WhatsApp Direto
            </Button>
          </div>
        </motion.div>
      </div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
    </section>
  );
}