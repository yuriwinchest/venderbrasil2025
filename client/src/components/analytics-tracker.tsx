import { useEffect } from 'react';
import { useLocation } from 'wouter';

let sessionId: string;
let startTime: number;

// Gerar ID de sessão único
if (typeof window !== 'undefined') {
  sessionId = sessionStorage.getItem('analytics_session') || 
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('analytics_session', sessionId);
}

// Função para rastrear eventos
export const trackEvent = async (action: string, page?: string, duration?: number) => {
  if (typeof window === 'undefined') return;

  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        page: page || window.location.pathname,
        action,
        duration,
        userAgent: navigator.userAgent,
        country: 'Brasil', // Pode ser melhorado com API de geolocalização
        city: 'São Paulo'
      }),
    });
  } catch (error) {
    console.error('Erro ao rastrear evento:', error);
  }
};

// Hook para rastreamento automático de páginas
export const useAnalyticsTracker = () => {
  const [location] = useLocation();

  useEffect(() => {
    startTime = Date.now();
    trackEvent('page_view', location);

    return () => {
      const duration = Math.round((Date.now() - startTime) / 1000);
      trackEvent('page_exit', location, duration);
    };
  }, [location]);

  useEffect(() => {
    // Rastrear quando usuário sai da página
    const handleBeforeUnload = () => {
      const duration = Math.round((Date.now() - startTime) / 1000);
      navigator.sendBeacon('/api/analytics/track', JSON.stringify({
        sessionId,
        page: location,
        action: 'session_end',
        duration,
        userAgent: navigator.userAgent,
        country: 'Brasil',
        city: 'São Paulo'
      }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [location]);
};

// Componente para rastreamento automático
export default function AnalyticsTracker() {
  useAnalyticsTracker();
  return null;
}