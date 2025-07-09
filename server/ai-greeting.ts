import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface GreetingContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userName?: string;
  isReturningVisitor: boolean;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  location?: string;
  previousInteractions?: number;
  leadStatus?: string;
  businessType?: string;
}

interface PersonalizedGreeting {
  greeting: string;
  message: string;
  urgencyText: string;
  cta: string;
  tone: 'professional' | 'friendly' | 'urgent' | 'casual';
}

export async function generatePersonalizedGreeting(context: GreetingContext): Promise<PersonalizedGreeting> {
  try {
    const timeContext = getTimeContext(context.timeOfDay);
    
    const prompt = `
Generate a personalized greeting for a Brazilian web development service landing page. 

Context:
- Time: ${context.timeOfDay} (${timeContext})
- User: ${context.isReturningVisitor ? 'Returning visitor' : 'First-time visitor'}
- Device: ${context.deviceType}
- Previous interactions: ${context.previousInteractions || 0}
- Business focus: Professional websites starting from R$500

Requirements:
- Use Brazilian Portuguese
- Be professional yet engaging
- Include time-appropriate greeting
- Create urgency without being pushy
- Adapt tone based on time and visitor status
- Include a compelling call-to-action

Return JSON format:
{
  "greeting": "Time-based greeting (e.g., Bom dia, Boa tarde)",
  "message": "Personalized welcome message (2-3 sentences)",
  "urgencyText": "Subtle urgency text (1 sentence)",
  "cta": "Call-to-action text",
  "tone": "professional|friendly|urgent|casual"
}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a skilled Brazilian copywriter specializing in web development services. Create compelling, natural-sounding greetings that convert visitors into leads."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      greeting: result.greeting || getDefaultGreeting(context.timeOfDay),
      message: result.message || "Transforme sua presença digital com websites profissionais e modernos.",
      urgencyText: result.urgencyText || "Vagas limitadas para este mês.",
      cta: result.cta || "Solicitar Orçamento Grátis",
      tone: result.tone || "professional"
    };

  } catch (error) {
    console.error("Failed to generate AI greeting:", error);
    // Fallback to default greeting
    return getDefaultGreeting(context.timeOfDay, context);
  }
}

function getTimeContext(timeOfDay: string): string {
  const contexts = {
    morning: "início do dia, energia para novos projetos",
    afternoon: "meio do dia, momento produtivo",
    evening: "final do dia, momento de planejamento",
    night: "noite, momento de reflexão e decisões"
  };
  return contexts[timeOfDay as keyof typeof contexts] || contexts.morning;
}

function getDefaultGreeting(timeOfDay: string, context?: GreetingContext): PersonalizedGreeting {
  const greetings = {
    morning: "Bom dia! ☀️",
    afternoon: "Boa tarde! 🌤️", 
    evening: "Boa noite! 🌅",
    night: "Boa noite! 🌙"
  };

  const messages = {
    morning: "Que tal começar o dia impulsionando seu negócio online? Criamos websites profissionais que realmente convertem.",
    afternoon: "Momento perfeito para investir no crescimento digital! Desenvolvemos soluções web sob medida para seu negócio.",
    evening: "Termine o dia com uma decisão inteligente! Websites profissionais a partir de R$500.",
    night: "Aproveite este momento para planejar o futuro digital do seu negócio. Consultas gratuitas disponíveis."
  };

  return {
    greeting: greetings[timeOfDay as keyof typeof greetings] || greetings.morning,
    message: messages[timeOfDay as keyof typeof messages] || messages.morning,
    urgencyText: "Apenas algumas vagas disponíveis para este mês.",
    cta: "Solicitar Orçamento Grátis",
    tone: "professional"
  };
}

export async function generateDynamicSocialProof(context: GreetingContext): Promise<string> {
  try {
    const prompt = `
Generate a compelling social proof message for a Brazilian web development service.

Context:
- Time: ${context.timeOfDay}
- Visitor type: ${context.isReturningVisitor ? 'Returning' : 'New'}
- Focus: Professional websites from R$500

Create a brief, credible social proof statement in Brazilian Portuguese that mentions:
- Recent client satisfaction
- Project completion
- Time-relevant context

Keep it under 15 words and natural-sounding.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50,
      temperature: 0.8
    });

    return response.choices[0].message.content || "Mais de 50 projetos entregues com 100% de satisfação dos clientes.";
    
  } catch (error) {
    console.error("Failed to generate social proof:", error);
    return "Mais de 50 projetos entregues com 100% de satisfação dos clientes.";
  }
}

export async function generateSmartRecommendation(context: GreetingContext): Promise<string> {
  try {
    const prompt = `
Generate a smart service recommendation for a Brazilian web development prospect.

Context:
- Time: ${context.timeOfDay}
- Visitor: ${context.isReturningVisitor ? 'Returning' : 'New'}
- Previous interactions: ${context.previousInteractions || 0}
- Business focus: Websites starting at R$500

Create a personalized recommendation in Brazilian Portuguese (1-2 sentences) that:
- Suggests the most relevant service
- Mentions pricing when appropriate
- Creates urgency based on time/context

Examples of services: Landing Pages (R$500-800), Corporate Websites (R$1,500-3,000), E-commerce (R$2,500-5,000)
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 80,
      temperature: 0.7
    });

    return response.choices[0].message.content || "Recomendamos começar com uma Landing Page profissional (R$500-800) para maximizar suas conversões.";
    
  } catch (error) {
    console.error("Failed to generate recommendation:", error);
    return "Recomendamos começar com uma Landing Page profissional (R$500-800) para maximizar suas conversões.";
  }
}