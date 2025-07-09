import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ProjectAnalysisInput {
  projectName: string;
  description: string;
  projectType: string;
  targetAudience?: string;
}

interface ComplexityAnalysis {
  complexityScore: number; // 1-10 scale
  effortEstimate: string; // e.g., "2-4 weeks"
  budgetRange: string; // e.g., "R$ 2.000 - R$ 5.000"
  keyFeatures: string[];
  technicalChallenges: string[];
  recommendations: string[];
  riskFactors: string[];
  aiAnalysis: string;
}

export async function analyzeProjectComplexity(input: ProjectAnalysisInput): Promise<ComplexityAnalysis> {
  console.log("🤖 Iniciando análise de projeto:", input.projectName);
  
  try {
    // Validate OpenAI client
    if (!openai) {
      console.error("❌ OpenAI client não inicializado");
      throw new Error("OpenAI client não disponível");
    }
    
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY não configurada");
      throw new Error("OPENAI_API_KEY não encontrada");
    }

    const prompt = `
Analise este projeto de desenvolvimento e forneça uma avaliação detalhada de complexidade:

PROJETO: ${input.projectName}
TIPO: ${input.projectType}
DESCRIÇÃO: ${input.description}
PÚBLICO-ALVO: ${input.targetAudience || "Não especificado"}

Por favor, analise e retorne APENAS um JSON válido com a seguinte estrutura:

{
  "complexityScore": number (1-10, onde 1=muito simples, 10=extremamente complexo),
  "effortEstimate": "string (formato: 'X-Y semanas' ou 'X-Y meses')",
  "budgetRange": "string (formato: 'R$ X.XXX - R$ Y.XXX')",
  "keyFeatures": ["array", "de", "funcionalidades", "principais"],
  "technicalChallenges": ["array", "de", "desafios", "técnicos"],
  "recommendations": ["array", "de", "recomendações", "técnicas"],
  "riskFactors": ["array", "de", "fatores", "de", "risco"],
  "aiAnalysis": "string com análise detalhada em português"
}

Considere para a análise:
- Complexidade técnica das funcionalidades
- Tecnologias necessárias
- Integrações com APIs externas
- Requisitos de segurança
- Escalabilidade necessária
- Experiência do usuário
- Compliance e regulamentações
- Manutenibilidade do código

Para o orçamento, considere o mercado brasileiro de desenvolvimento, com valores realistas para freelancers/pequenas empresas.
`;

    console.log("🤖 Enviando solicitação para OpenAI...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um arquiteto de software sênior especialista em análise de projetos e estimativas. Responda APENAS com JSON válido, sem texto adicional."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    console.log("✅ Resposta recebida da OpenAI");
    
    const result = JSON.parse(response.choices[0].message.content || "{}");
    console.log("📊 Resultado da análise:", result);
    
    // Validate and ensure all required fields exist
    const analysis = {
      complexityScore: Math.max(1, Math.min(10, result.complexityScore || 5)),
      effortEstimate: result.effortEstimate || "2-4 semanas",
      budgetRange: result.budgetRange || "R$ 1.500 - R$ 5.000",
      keyFeatures: Array.isArray(result.keyFeatures) ? result.keyFeatures : ["Funcionalidades básicas"],
      technicalChallenges: Array.isArray(result.technicalChallenges) ? result.technicalChallenges : ["Desafios a serem definidos"],
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : ["Recomendações a serem definidas"],
      riskFactors: Array.isArray(result.riskFactors) ? result.riskFactors : ["Riscos a serem avaliados"],
      aiAnalysis: result.aiAnalysis || "Análise não disponível"
    };

    console.log("✅ Análise processada com sucesso");
    return analysis;

  } catch (error) {
    console.error("❌ Erro na análise de projeto:", error);
    
    // Return intelligent fallback analysis based on project type and description
    return generateIntelligentFallbackAnalysis(input, error);
  }
}

function generateIntelligentFallbackAnalysis(input: ProjectAnalysisInput, error: any): ComplexityAnalysis {
  console.log("🧠 Gerando análise inteligente baseada em regras...");
  
  const projectType = input.projectType.toLowerCase();
  const description = input.description.toLowerCase();
  
  // Analyze complexity based on keywords and project type
  let complexityScore = 3; // Base complexity
  let baseWeeks = 2;
  let baseBudget = 1500;
  
  // Complexity factors
  const complexityFactors = [
    { keywords: ['e-commerce', 'pagamento', 'carrinho', 'loja'], score: 3, label: 'Sistema de e-commerce' },
    { keywords: ['api', 'integração', 'sistema externo'], score: 2, label: 'Integrações complexas' },
    { keywords: ['mobile', 'app', 'aplicativo'], score: 2, label: 'Desenvolvimento mobile' },
    { keywords: ['banco de dados', 'database', 'postgresql', 'mysql'], score: 1, label: 'Banco de dados' },
    { keywords: ['admin', 'painel', 'dashboard', 'gerenciamento'], score: 2, label: 'Painel administrativo' },
    { keywords: ['autenticação', 'login', 'usuário', 'permissão'], score: 1, label: 'Sistema de autenticação' },
    { keywords: ['chat', 'tempo real', 'websocket', 'notificação'], score: 3, label: 'Recursos em tempo real' },
    { keywords: ['upload', 'arquivo', 'imagem', 'video'], score: 1, label: 'Upload de arquivos' },
    { keywords: ['relatório', 'analytics', 'gráfico', 'estatística'], score: 2, label: 'Sistema de relatórios' },
    { keywords: ['ai', 'inteligência artificial', 'machine learning'], score: 4, label: 'Inteligência artificial' }
  ];
  
  const detectedFeatures: string[] = [];
  const technicalChallenges: string[] = [];
  
  complexityFactors.forEach(factor => {
    if (factor.keywords.some(keyword => description.includes(keyword))) {
      complexityScore += factor.score;
      detectedFeatures.push(factor.label);
      
      if (factor.score >= 3) {
        technicalChallenges.push(`Implementação de ${factor.label.toLowerCase()}`);
      }
    }
  });
  
  // Adjust based on project type
  const typeMultipliers: Record<string, number> = {
    'webapp': 1.0,
    'mobile': 1.3,
    'desktop': 1.2,
    'api': 0.8,
    'landing': 0.5,
    'blog': 0.4,
    'ecommerce': 1.5,
    'sistema': 1.1
  };
  
  const multiplier = typeMultipliers[projectType] || 1.0;
  complexityScore = Math.round(complexityScore * multiplier);
  
  // Calculate effort and budget
  const effortWeeks = Math.max(1, Math.round(baseWeeks * (complexityScore / 3)));
  const budgetMin = Math.round(baseBudget * (complexityScore / 3));
  const budgetMax = Math.round(budgetMin * 1.8);
  
  // Generate recommendations
  const recommendations = [
    "Começar com um MVP (Produto Mínimo Viável)",
    "Definir claramente os requisitos funcionais",
    "Considerar tecnologias modernas e escaláveis"
  ];
  
  if (complexityScore >= 7) {
    recommendations.push("Dividir o projeto em fases menores");
    recommendations.push("Considerar equipe de desenvolvimento experiente");
  }
  
  if (detectedFeatures.includes('Sistema de e-commerce')) {
    recommendations.push("Implementar sistema de segurança robusto para pagamentos");
    recommendations.push("Considerar integração com gateways de pagamento brasileiros");
  }
  
  // Generate risk factors
  const riskFactors = ["Mudanças de escopo durante desenvolvimento"];
  
  if (complexityScore >= 6) {
    riskFactors.push("Complexidade técnica pode gerar atrasos");
  }
  
  if (effortWeeks >= 6) {
    riskFactors.push("Projetos longos têm maior risco de alterações");
  }
  
  // Default features if none detected
  if (detectedFeatures.length === 0) {
    detectedFeatures.push("Interface responsiva", "Navegação intuitiva", "Otimização para SEO");
  }
  
  // Default challenges if none detected
  if (technicalChallenges.length === 0) {
    technicalChallenges.push("Garantir performance otimizada", "Compatibilidade entre navegadores");
  }
  
  const effortEstimate = effortWeeks <= 4 ? `${effortWeeks}-${effortWeeks + 1} semanas` : 
                       effortWeeks <= 8 ? `${Math.floor(effortWeeks/4)}-${Math.ceil(effortWeeks/4)} meses` :
                       `${Math.floor(effortWeeks/4)}-${Math.ceil(effortWeeks/4) + 1} meses`;
  
  const budgetRange = `R$ ${budgetMin.toLocaleString('pt-BR')} - R$ ${budgetMax.toLocaleString('pt-BR')}`;
  
  const analysisText = `
Análise Inteligente do Projeto "${input.projectName}":

O projeto foi classificado como de complexidade ${complexityScore}/10, considerando o tipo "${input.projectType}" e as funcionalidades descritas.

Principais características identificadas:
${detectedFeatures.map(f => `• ${f}`).join('\n')}

A estimativa de desenvolvimento considera o mercado brasileiro e inclui:
- Planejamento e arquitetura
- Desenvolvimento das funcionalidades principais
- Testes e validação
- Deploy e configuração inicial

${error instanceof Error && error.message.includes('429') ? 
  '\n⚠️ Nota: Esta análise foi gerada por sistema inteligente local devido a limitações da API OpenAI (quota excedida). Para análise mais detalhada com IA avançada, considere upgrade do plano OpenAI.' : ''}
  `.trim();
  
  return {
    complexityScore: Math.min(10, Math.max(1, complexityScore)),
    effortEstimate,
    budgetRange,
    keyFeatures: detectedFeatures,
    technicalChallenges,
    recommendations,
    riskFactors,
    aiAnalysis: analysisText
  };
}

export async function generateProjectSuggestions(projectType: string, description: string): Promise<string[]> {
  try {
    const prompt = `
Com base no tipo de projeto "${projectType}" e descrição "${description}", 
sugira 5 melhorias ou funcionalidades adicionais que poderiam agregar valor.
Responda APENAS com um JSON no formato: {"suggestions": ["sugestão1", "sugestão2", ...]}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um consultor de produtos digitais. Responda APENAS com JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return Array.isArray(result.suggestions) ? result.suggestions : [];

  } catch (error) {
    console.error("Error generating project suggestions:", error);
    return [
      "Implementar sistema de analytics",
      "Adicionar notificações push",
      "Criar dashboard administrativo",
      "Integrar sistema de pagamentos",
      "Desenvolver aplicativo mobile"
    ];
  }
}