// Versão simples do tracker para evitar erros
export const trackEvent = (action: string, page?: string, duration?: number) => {
  // Versão simplificada - apenas console por agora
  console.log('Analytics:', { action, page, duration });
};

// Hook vazio para evitar erros
export const useAnalyticsTracker = () => {
  // Implementação vazia por agora
};

// Componente vazio
export default function AnalyticsTracker() {
  return null;
}