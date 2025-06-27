// YAGNI: Simplificado - removendo complexidade desnecessária de AI
// Responsabilidade: Fornecer saudação simples baseada no horário

import { useState, useEffect } from "react";

// YAGNI: Interface simplificada - apenas o necessário
interface SimpleGreeting {
  greeting: string;
  message: string;
}

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

// YAGNI: Função simplificada - removendo complexidade desnecessária
export function useAIGreeting() {
  const [greeting, setGreeting] = useState<SimpleGreeting>({
    greeting: '',
    message: ''
  });

  useEffect(() => {
    const timeOfDay = getTimeOfDay();
    const simpleGreeting = getSimpleGreeting(timeOfDay);
    setGreeting(simpleGreeting);
  }, []);

  return { greeting, isLoading: false, error: null };
}

// YAGNI: Função simples sem API calls desnecessárias
function getSimpleGreeting(timeOfDay: string): SimpleGreeting {
  const greetings = {
    morning: {
      greeting: "Bom dia!",
      message: "Que tal começar o dia desenvolvendo seu projeto dos sonhos?"
    },
    afternoon: {
      greeting: "Boa tarde!",
      message: "Hora perfeita para dar vida às suas ideias digitais."
    },
    evening: {
      greeting: "Boa noite!",
      message: "Vamos transformar sua visão em realidade digital?"
    },
    night: {
      greeting: "Boa noite!",
      message: "Mesmo tarde, nunca é tarde para inovar!"
    }
  };
  
  return greetings[timeOfDay as keyof typeof greetings] || greetings.afternoon;
}