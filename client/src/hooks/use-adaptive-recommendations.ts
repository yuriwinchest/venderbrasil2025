// Single Responsibility: Hook responsável apenas pelas recomendações adaptativas
// KISS: Mantém lógica simples e direta
// YAGNI: Implementa apenas funcionalidades necessárias

import { useState, useEffect } from "react";

interface RecommendationData {
  service: string;
  price: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

interface UserBehavior {
  timeOnSite: number;
  scrollDepth: number;
  clickCount: number;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  isReturning: boolean;
}

// KISS: Função simples para detectar tipo de dispositivo
function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// KISS: Função simples para detectar visitante recorrente
function getIsReturning(): boolean {
  const visited = localStorage.getItem('hasVisited');
  if (!visited) {
    localStorage.setItem('hasVisited', 'true');
    return false;
  }
  return true;
}

// Single Responsibility: Hook que gerencia apenas recomendações adaptativas
export function useAdaptiveRecommendations() {
  const [behavior, setBehavior] = useState<UserBehavior>({
    timeOnSite: 0,
    scrollDepth: 0,
    clickCount: 0,
    deviceType: getDeviceType(),
    isReturning: getIsReturning()
  });

  const [recommendation, setRecommendation] = useState<RecommendationData | null>(null);

  useEffect(() => {
    const startTime = Date.now();
    let clickCount = 0;
    let maxScroll = 0;

    // KISS: Rastreamento simples de comportamento
    const updateTimeOnSite = () => {
      setBehavior(prev => ({
        ...prev,
        timeOnSite: Math.floor((Date.now() - startTime) / 1000)
      }));
    };

    const handleScroll = () => {
      const scrolled = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrolled > maxScroll) {
        maxScroll = scrolled;
        setBehavior(prev => ({
          ...prev,
          scrollDepth: scrolled
        }));
      }
    };

    const handleClick = () => {
      clickCount++;
      setBehavior(prev => ({
        ...prev,
        clickCount
      }));
    };

    // KISS: Eventos simples de rastreamento
    const interval = setInterval(updateTimeOnSite, 2000);
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClick);

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // KISS: Lógica simples de recomendação baseada em comportamento
  useEffect(() => {
    const generateRecommendation = (): RecommendationData => {
      const { timeOnSite, scrollDepth, clickCount, deviceType, isReturning } = behavior;

      // KISS: Regras simples de recomendação
      if (isReturning && timeOnSite > 60) {
        return {
          service: "Consultoria Personalizada",
          price: "Gratuita",
          description: "Vamos conversar sobre suas necessidades específicas",
          priority: 'high',
          reason: "Você já nos conhece e demonstrou interesse real"
        };
      }

      if (deviceType === 'mobile' && scrollDepth > 50) {
        return {
          service: "Landing Page Mobile-First",
          price: "R$ 700-1.200",
          description: "Site otimizado para dispositivos móveis",
          priority: 'high',
          reason: "Você navega pelo celular - essencial ter site responsivo"
        };
      }

      if (timeOnSite > 120 && clickCount > 3) {
        return {
          service: "Site Institucional Completo",
          price: "R$ 1.500-3.000",
          description: "Site profissional com todas as funcionalidades",
          priority: 'high',
          reason: "Seu engajamento indica interesse em solução robusta"
        };
      }

      if (scrollDepth > 70) {
        return {
          service: "Site One-Page",
          price: "R$ 500-800",
          description: "Página única com foco em conversão",
          priority: 'medium',
          reason: "Você leu bastante conteúdo - uma página focada pode ser ideal"
        };
      }

      // KISS: Recomendação padrão simples
      return {
        service: "Site Básico",
        price: "R$ 500-700",
        description: "Site profissional para começar sua presença online",
        priority: 'medium',
        reason: "Solução perfeita para iniciar no digital"
      };
    };

    setRecommendation(generateRecommendation());
  }, [behavior]);

  return {
    recommendation,
    behavior,
    isActive: recommendation !== null
  };
}