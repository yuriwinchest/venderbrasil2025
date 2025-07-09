// Adaptive Recommendation Engine Hook
// Advanced recommendation system based on user behavior analytics

import { useState, useEffect, useCallback } from "react";

interface UserProfile {
  deviceType: 'mobile' | 'desktop' | 'tablet';
  location?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  sessionDuration: number;
  pageViews: number;
  interactionScore: number;
  urgencyLevel: 'low' | 'medium' | 'high';
  budgetIndicator: 'budget' | 'standard' | 'premium';
  technicalLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface BehaviorPattern {
  scrollVelocity: number;
  clickFrequency: number;
  timeSpentOnSections: Record<string, number>;
  backtrackingCount: number;
  formInteractions: number;
  searchQueries: string[];
  repeatVisits: number;
  conversionIntent: number; // 0-100 score
}

interface RecommendationContext {
  userProfile: UserProfile;
  behaviorPattern: BehaviorPattern;
  currentSection: string;
  visitHistory: string[];
  seasonality: 'q1' | 'q2' | 'q3' | 'q4';
  marketTrends: string[];
}

interface SmartRecommendation {
  id: string;
  type: 'service' | 'upgrade' | 'consultation' | 'resource';
  title: string;
  description: string;
  price: string;
  confidence: number; // 0-100
  urgency: 'low' | 'medium' | 'high';
  category: string;
  benefits: string[];
  socialProof?: string;
  timeframe: string;
  cta: string;
  reasoning: string;
  personalizedMessage: string;
}

export function useAdaptiveRecommendationsEngine() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    deviceType: 'desktop',
    timeOfDay: 'afternoon',
    sessionDuration: 0,
    pageViews: 1,
    interactionScore: 0,
    urgencyLevel: 'medium',
    budgetIndicator: 'standard',
    technicalLevel: 'intermediate'
  });

  const [behaviorPattern, setBehaviorPattern] = useState<BehaviorPattern>({
    scrollVelocity: 0,
    clickFrequency: 0,
    timeSpentOnSections: {},
    backtrackingCount: 0,
    formInteractions: 0,
    searchQueries: [],
    repeatVisits: 0,
    conversionIntent: 50
  });

  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [currentRecommendation, setCurrentRecommendation] = useState<SmartRecommendation | null>(null);

  // Service catalog with detailed information
  const serviceCatalog = {
    'landing-page': {
      title: 'Landing Page Profissional',
      price: 'R$ 500',
      description: 'Landing page otimizada para conversão com design responsivo',
      benefits: ['Design responsivo', 'SEO otimizado', 'Integração com WhatsApp', 'Analytics'],
      timeframe: '3-5 dias',
      category: 'web'
    },
    'ecommerce': {
      title: 'E-commerce Completo',
      price: 'R$ 1.500',
      description: 'Loja virtual completa com sistema de pagamento integrado',
      benefits: ['Carrinho de compras', 'Pagamento online', 'Gestão de produtos', 'Relatórios'],
      timeframe: '10-15 dias',
      category: 'web'
    },
    'app-flutter': {
      title: 'App Flutter Nativo',
      price: 'R$ 2.000',
      description: 'Aplicativo mobile nativo para Android e iOS',
      benefits: ['Multiplataforma', 'Performance nativa', 'Push notifications', 'Offline'],
      timeframe: '15-20 dias',
      category: 'mobile'
    },
    'consultation': {
      title: 'Consultoria Técnica',
      price: 'R$ 150/h',
      description: 'Consultoria especializada para definir a melhor solução',
      benefits: ['Análise técnica', 'Roadmap', 'Orçamento detalhado', 'Estratégia'],
      timeframe: 'Imediato',
      category: 'consulting'
    },
    'maintenance': {
      title: 'Manutenção Mensal',
      price: 'R$ 200/mês',
      description: 'Manutenção contínua e suporte técnico',
      benefits: ['Backup automático', 'Atualizações', 'Suporte 24/7', 'Monitoramento'],
      timeframe: 'Contínuo',
      category: 'support'
    }
  };

  // Analyze user behavior and generate profile
  const analyzeUserBehavior = useCallback(() => {
    const deviceType = window.innerWidth < 768 ? 'mobile' : 
                      window.innerWidth < 1024 ? 'tablet' : 'desktop';
    
    const hour = new Date().getHours();
    const timeOfDay = hour < 6 ? 'night' : 
                     hour < 12 ? 'morning' : 
                     hour < 18 ? 'afternoon' : 'evening';

    const sessionStart = parseInt(sessionStorage.getItem('sessionStart') || Date.now().toString());
    const sessionDuration = (Date.now() - sessionStart) / 1000;

    // Analyze scroll behavior for urgency
    const scrollEvents = parseInt(sessionStorage.getItem('scrollEvents') || '0');
    const urgencyLevel = scrollEvents > 20 ? 'high' : scrollEvents > 10 ? 'medium' : 'low';

    // Budget indicator based on time spent and interactions
    const interactions = parseInt(sessionStorage.getItem('interactions') || '0');
    const budgetIndicator = sessionDuration > 120 && interactions > 5 ? 'premium' : 
                           sessionDuration > 60 ? 'standard' : 'budget';

    setUserProfile(prev => ({
      ...prev,
      deviceType,
      timeOfDay,
      sessionDuration,
      urgencyLevel,
      budgetIndicator,
      interactionScore: interactions
    }));

    setBehaviorPattern(prev => ({
      ...prev,
      scrollVelocity: scrollEvents / Math.max(sessionDuration, 1),
      conversionIntent: Math.min(100, (interactions * 10) + (sessionDuration / 10))
    }));
  }, []);

  // AI-powered recommendation engine
  const generateSmartRecommendations = useCallback((context: RecommendationContext): SmartRecommendation[] => {
    const recommendations: SmartRecommendation[] = [];
    
    // Primary recommendation based on user profile
    if (context.userProfile.budgetIndicator === 'budget' || context.userProfile.urgencyLevel === 'high') {
      recommendations.push({
        id: 'landing-page-urgent',
        type: 'service',
        title: serviceCatalog['landing-page'].title,
        description: serviceCatalog['landing-page'].description,
        price: serviceCatalog['landing-page'].price,
        confidence: 85,
        urgency: 'high',
        category: serviceCatalog['landing-page'].category,
        benefits: serviceCatalog['landing-page'].benefits,
        socialProof: 'Mais de 50 clientes já aumentaram suas vendas',
        timeframe: serviceCatalog['landing-page'].timeframe,
        cta: 'Criar Minha Landing Page',
        reasoning: 'Solução rápida e econômica para começar online',
        personalizedMessage: `Perfeito para ${context.userProfile.deviceType === 'mobile' ? 'acessar pelo celular' : 'seu negócio digital'}`
      });
    }

    // Mobile-focused recommendation
    if (context.userProfile.deviceType === 'mobile') {
      recommendations.push({
        id: 'app-mobile-focused',
        type: 'service',
        title: serviceCatalog['app-flutter'].title,
        description: 'App móvel otimizado para sua audiência mobile',
        price: serviceCatalog['app-flutter'].price,
        confidence: 90,
        urgency: 'medium',
        category: serviceCatalog['app-flutter'].category,
        benefits: ['Experiência mobile nativa', 'Notificações push', 'Funciona offline'],
        socialProof: 'Apps com 4.8★ na Play Store',
        timeframe: serviceCatalog['app-flutter'].timeframe,
        cta: 'Desenvolver Meu App',
        reasoning: 'Você está navegando pelo celular - um app seria perfeito',
        personalizedMessage: 'Ideal para alcançar clientes pelo smartphone'
      });
    }

    // Consultation for high-intent users
    if (context.behaviorPattern.conversionIntent > 70) {
      recommendations.push({
        id: 'consultation-high-intent',
        type: 'consultation',
        title: 'Conversa Estratégica Gratuita',
        description: 'Vamos definir a melhor solução para seu projeto',
        price: 'Gratuito',
        confidence: 95,
        urgency: 'high',
        category: serviceCatalog['consultation'].category,
        benefits: ['Análise personalizada', 'Orçamento sem compromisso', 'Estratégia digital'],
        socialProof: '15 min que podem transformar seu negócio',
        timeframe: 'Hoje mesmo',
        cta: 'Agendar Conversa Agora',
        reasoning: 'Alto interesse detectado - hora de dar o próximo passo',
        personalizedMessage: 'Você demonstrou interesse real - vamos conversar!'
      });
    }

    // E-commerce for business-focused users
    if (context.behaviorPattern.timeSpentOnSections['portfolio'] > 30) {
      recommendations.push({
        id: 'ecommerce-business',
        type: 'service',
        title: serviceCatalog['ecommerce'].title,
        description: serviceCatalog['ecommerce'].description,
        price: serviceCatalog['ecommerce'].price,
        confidence: 80,
        urgency: 'medium',
        category: serviceCatalog['ecommerce'].category,
        benefits: serviceCatalog['ecommerce'].benefits,
        socialProof: 'Lojas que faturam R$ 10k+ por mês',
        timeframe: serviceCatalog['ecommerce'].timeframe,
        cta: 'Criar Minha Loja',
        reasoning: 'Interesse em portfólio indica necessidade de venda online',
        personalizedMessage: 'Transforme visitantes em clientes pagantes'
      });
    }

    // Time-based recommendations
    if (context.userProfile.timeOfDay === 'evening' || context.userProfile.timeOfDay === 'night') {
      recommendations.push({
        id: 'evening-special',
        type: 'upgrade',
        title: 'Oferta Noturna Especial',
        description: 'Desconto exclusivo para quem planeja à noite',
        price: 'R$ 450 (10% OFF)',
        confidence: 75,
        urgency: 'high',
        category: 'promo',
        benefits: ['Desconto exclusivo', 'Prioridade no atendimento', 'Bônus extra'],
        socialProof: 'Válido apenas hoje',
        timeframe: 'Limitado',
        cta: 'Aproveitar Desconto',
        reasoning: 'Navegação noturna indica dedicação ao projeto',
        personalizedMessage: 'Para quem trabalha até tarde, temos um desconto especial'
      });
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }, []);

  // Update recommendations based on current context
  const updateRecommendations = useCallback(() => {
    const context: RecommendationContext = {
      userProfile,
      behaviorPattern,
      currentSection: window.location.hash || 'hero',
      visitHistory: JSON.parse(sessionStorage.getItem('visitHistory') || '[]'),
      seasonality: 'q4',
      marketTrends: ['mobile-first', 'whatsapp-integration', 'fast-delivery']
    };

    const newRecommendations = generateSmartRecommendations(context);
    setRecommendations(newRecommendations);
    
    if (newRecommendations.length > 0 && !currentRecommendation) {
      setCurrentRecommendation(newRecommendations[0]);
    }
  }, [userProfile, behaviorPattern, generateSmartRecommendations, currentRecommendation]);

  // Track user interactions
  const trackInteraction = useCallback((type: string, data?: any) => {
    const interactions = parseInt(sessionStorage.getItem('interactions') || '0') + 1;
    sessionStorage.setItem('interactions', interactions.toString());

    if (type === 'scroll') {
      const scrollEvents = parseInt(sessionStorage.getItem('scrollEvents') || '0') + 1;
      sessionStorage.setItem('scrollEvents', scrollEvents.toString());
    }

    if (type === 'section-view') {
      const timeSpent = behaviorPattern.timeSpentOnSections[data.section] || 0;
      setBehaviorPattern(prev => ({
        ...prev,
        timeSpentOnSections: {
          ...prev.timeSpentOnSections,
          [data.section]: timeSpent + (data.duration || 5)
        }
      }));
    }

    // Update behavior analytics
    analyzeUserBehavior();
  }, [behaviorPattern.timeSpentOnSections, analyzeUserBehavior]);

  // Initialize session tracking and default recommendation
  useEffect(() => {
    if (!sessionStorage.getItem('sessionStart')) {
      sessionStorage.setItem('sessionStart', Date.now().toString());
    }

    const visitHistory = JSON.parse(sessionStorage.getItem('visitHistory') || '[]');
    visitHistory.push(Date.now());
    sessionStorage.setItem('visitHistory', JSON.stringify(visitHistory.slice(-10)));

    analyzeUserBehavior();
    
    // Set initial recommendation if none exists
    if (!currentRecommendation) {
      const defaultRecommendation: SmartRecommendation = {
        id: 'default-landing',
        type: 'service',
        title: 'Landing Page Profissional',
        description: 'Página otimizada para conversão com design responsivo',
        price: 'R$ 500',
        confidence: 85,
        urgency: 'medium',
        category: 'web',
        benefits: ['Design responsivo', 'SEO otimizado', 'Integração WhatsApp'],
        timeframe: '3-5 dias',
        cta: 'Solicitar Orçamento',
        reasoning: 'Solução ideal para começar sua presença digital',
        personalizedMessage: 'Recomendado para seu perfil'
      };
      setCurrentRecommendation(defaultRecommendation);
    }
  }, [analyzeUserBehavior, currentRecommendation]);

  // Real-time behavior tracking
  useEffect(() => {
    const handleScroll = () => trackInteraction('scroll');
    const handleClick = () => trackInteraction('click');
    const handleMouseMove = () => trackInteraction('mousemove');

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [trackInteraction]);

  // Update recommendations periodically
  useEffect(() => {
    updateRecommendations();
    
    const interval = setInterval(updateRecommendations, 15000); // Every 15 seconds
    return () => clearInterval(interval);
  }, [updateRecommendations]);

  // Section visibility tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target.id || 'unknown';
            trackInteraction('section-view', { section, duration: 5 });
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, [trackInteraction]);

  return {
    userProfile,
    behaviorPattern,
    recommendations,
    currentRecommendation,
    trackInteraction,
    updateRecommendations,
    isLoading: recommendations.length === 0
  };
}