import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, X, ChevronRight, ChevronLeft, 
  Lightbulb, PlayCircle, BookOpen, Zap, 
  Target, Star, CheckCircle, ArrowRight 
} from 'lucide-react';

interface HelpStep {
  id: string;
  title: string;
  content: string;
  element?: string; // CSS selector for highlighting
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    callback: () => void;
  };
}

interface HelpTour {
  id: string;
  name: string;
  description: string;
  category: 'beginner' | 'advanced' | 'feature';
  steps: HelpStep[];
  estimatedTime: string;
}

export function ContextualHelpOverlay() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTour, setCurrentTour] = useState<HelpTour | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedTours, setCompletedTours] = useState<string[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);

  const helpTours: HelpTour[] = [
    {
      id: 'first-steps',
      name: 'Primeiros Passos',
      description: 'Aprenda o básico do sistema em 3 minutos',
      category: 'beginner',
      estimatedTime: '3 min',
      steps: [
        {
          id: 'welcome',
          title: 'Bem-vindo ao VenderBrasil!',
          content: 'Este sistema vai revolucionar a forma como você gerencia seus projetos e leads. Vamos começar!',
          position: 'center'
        },
        {
          id: 'navigation',
          title: 'Navegação Principal',
          content: 'Use o menu superior para navegar entre as seções: Home, Admin, Data Analyzer e Marketplace Tools.',
          element: 'nav',
          position: 'bottom'
        },
        {
          id: 'scheduling',
          title: 'Sistema de Agendamento',
          content: 'Clique em qualquer horário disponível para agendar uma reunião. Os horários ocupados aparecem bloqueados.',
          element: '.scheduling-section',
          position: 'top'
        },
        {
          id: 'data-analysis',
          title: 'Análise de Dados',
          content: 'Use o Data Analyzer para extrair insights de produtos e fazer análises de mercado avançadas.',
          element: '[href="/data-analyzer"]',
          position: 'bottom'
        }
      ]
    },
    {
      id: 'advanced-features',
      name: 'Funcionalidades Avançadas',
      description: 'Explore recursos avançados para usuários experientes',
      category: 'advanced',
      estimatedTime: '5 min',
      steps: [
        {
          id: 'market-analysis',
          title: 'Análise de Mercado IA',
          content: 'Cole qualquer link de produto da Amazon, Mercado Livre ou outras plataformas para análise automática de preços.',
          element: '.product-link-input',
          position: 'top'
        },
        {
          id: 'emoji-reactions',
          title: 'Sistema de Reações',
          content: 'Use reações com emoji para marcar leads, projetos e análises favoritas. A IA sugere reações baseadas no contexto.',
          element: '.emoji-reaction-system',
          position: 'left'
        },
        {
          id: 'floating-actions',
          title: 'Ações Rápidas',
          content: 'O botão flutuante oferece acesso rápido às ações mais usadas com atalhos de teclado.',
          element: '.floating-action-button',
          position: 'left'
        }
      ]
    },
    {
      id: 'marketplace-tools',
      name: 'Ferramentas de Marketplace',
      description: 'Domine as ferramentas de otimização de marketplace',
      category: 'feature',
      estimatedTime: '4 min',
      steps: [
        {
          id: 'product-extraction',
          title: 'Extração de Produtos',
          content: 'Cole links de produtos para extrair automaticamente título, preço, imagens e especificações.',
          element: '.product-extraction',
          position: 'top'
        },
        {
          id: 'price-comparison',
          title: 'Comparação de Preços',
          content: 'Analise preços em múltiplas plataformas e receba recomendações inteligentes sobre onde comprar.',
          element: '.price-comparison',
          position: 'bottom'
        },
        {
          id: 'bulk-processing',
          title: 'Processamento em Lote',
          content: 'Faça upload de arquivos CSV ou JSON para processar milhares de produtos simultaneamente.',
          element: '.bulk-upload',
          position: 'top'
        }
      ]
    }
  ];

  const handleStartTour = (tour: HelpTour) => {
    setCurrentTour(tour);
    setCurrentStepIndex(0);
    setIsVisible(true);
    console.log(`🎯 Iniciando tour: ${tour.name}`);
  };

  const handleNextStep = () => {
    if (currentTour && currentStepIndex < currentTour.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (currentTour) {
      // Tour completo
      handleCompleteTour();
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleCompleteTour = () => {
    if (currentTour) {
      setCompletedTours(prev => [...prev, currentTour.id]);
      console.log(`✅ Tour completado: ${currentTour.name}`);
    }
    setCurrentTour(null);
    setCurrentStepIndex(0);
    setIsVisible(false);
  };

  const handleSkipTour = () => {
    setCurrentTour(null);
    setCurrentStepIndex(0);
    setIsVisible(false);
  };

  const getCurrentStep = () => {
    return currentTour?.steps[currentStepIndex];
  };

  const getProgressPercentage = () => {
    if (!currentTour) return 0;
    return ((currentStepIndex + 1) / currentTour.steps.length) * 100;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'beginner': return <Star className="w-4 h-4" />;
      case 'advanced': return <Zap className="w-4 h-4" />;
      case 'feature': return <Target className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'feature': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  useEffect(() => {
    // Auto-mostrar ajuda para novos usuários
    const isFirstVisit = !localStorage.getItem('help-tours-shown');
    if (isFirstVisit) {
      setTimeout(() => setShowTooltip(true), 2000);
      localStorage.setItem('help-tours-shown', 'true');
    }
  }, []);

  return (
    <>

      {/* Help Menu */}
      {showTooltip && !currentTour && (
        <Card className="fixed top-16 right-4 z-50 bg-slate-800/95 border-slate-700/50 backdrop-blur-md max-w-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                Centro de Ajuda
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTooltip(false)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {/* Progress Stats */}
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <div className="text-sm text-gray-300 mb-1">Seu Progresso</div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-white">{completedTours.length}/{helpTours.length} tours completos</span>
              </div>
            </div>

            {/* Available Tours */}
            <div className="space-y-2">
              {helpTours.map((tour) => (
                <div
                  key={tour.id}
                  className="bg-slate-700/30 p-3 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer group"
                  onClick={() => handleStartTour(tour)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-white text-sm">{tour.name}</h3>
                        {completedTours.includes(tour.id) && (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2">{tour.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={getCategoryColor(tour.category)}>
                          {getCategoryIcon(tour.category)}
                          <span className="ml-1 text-xs">{tour.category}</span>
                        </Badge>
                        <span className="text-xs text-gray-500">{tour.estimatedTime}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Help */}
            <div className="pt-2 border-t border-slate-700/50">
              <Button
                onClick={() => window.open('/help', '_blank')}
                className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Documentação Completa
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tour Overlay */}
      {isVisible && currentTour && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <Card className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md mx-4 bg-slate-800/95 border-slate-700/50 backdrop-blur-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">{getCurrentStep()?.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipTour}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              
              <div className="text-xs text-gray-400">
                Passo {currentStepIndex + 1} de {currentTour.steps.length}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                {getCurrentStep()?.content}
              </p>

              {getCurrentStep()?.action && (
                <Button
                  onClick={getCurrentStep()?.action?.callback}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  {getCurrentStep()?.action?.label}
                </Button>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePreviousStep}
                  disabled={currentStepIndex === 0}
                  className="text-gray-300 border-slate-600 hover:bg-slate-700"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                
                <Button
                  onClick={handleSkipTour}
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  Pular Tour
                </Button>
                
                <Button
                  onClick={handleNextStep}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {currentStepIndex === currentTour.steps.length - 1 ? 'Finalizar' : 'Próximo'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}