import OpenAI from "openai";

// Integração com IA para processamento de produtos do marketplace
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Product {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
}

interface ProcessedProduct extends Product {
  suggestedCategory: string;
  optimizedTitle: string;
  confidence: number;
}

// Categorias padrão do marketplace
const MARKETPLACE_CATEGORIES = [
  "Eletrônicos",
  "Roupas & Moda", 
  "Casa & Jardim",
  "Esporte & Lazer",
  "Beleza & Saúde",
  "Livros & Mídia",
  "Automotivo",
  "Brinquedos",
  "Celulares & Telefones",
  "Informática",
  "Câmeras & Fotografia",
  "Games",
  "Música",
  "Ferramentas",
  "Agro",
  "Pet Shop",
  "Bebês",
  "Joias & Relógios",
  "Arte & Artesanato"
];

// Recategorizar produtos usando IA
export async function recategorizeProducts(products: Product[]): Promise<ProcessedProduct[]> {
  const processedProducts: ProcessedProduct[] = [];
  const batchSize = 50; // Processar em lotes para evitar limite de API

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // o modelo mais novo do OpenAI
        messages: [
          {
            role: "system",
            content: `Você é um especialista em categorização de produtos para marketplace.
            
            Categorias disponíveis: ${MARKETPLACE_CATEGORIES.join(", ")}
            
            Para cada produto, analise título, descrição e preço para determinar a melhor categoria.
            Retorne um JSON array com objetos contendo:
            - id: ID do produto
            - suggestedCategory: categoria sugerida (deve ser exatamente uma das disponíveis)
            - confidence: nível de confiança (0-100)
            
            Seja preciso e considere o contexto brasileiro do marketplace.`
          },
          {
            role: "user",
            content: `Categorize estes produtos:
            ${batch.map(p => `ID: ${p.id}, Título: ${p.title}, Categoria atual: ${p.category}, Descrição: ${p.description}, Preço: R$ ${p.price}`).join("\n")}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      // Processar resultados do lote
      batch.forEach((product, index) => {
        const aiResult = result.products?.[index];
        processedProducts.push({
          ...product,
          suggestedCategory: aiResult?.suggestedCategory || product.category,
          optimizedTitle: product.title, // Será otimizado na próxima etapa
          confidence: aiResult?.confidence || 70
        });
      });

    } catch (error) {
      console.error("Erro na recategorização:", error);
      // Fallback para algoritmo local se API falhar
      batch.forEach(product => {
        const localResult = categorizeLocally(product);
        processedProducts.push({
          ...product,
          suggestedCategory: localResult.category,
          optimizedTitle: product.title,
          confidence: localResult.confidence
        });
      });
    }

    // Pequena pausa entre lotes para respeitar rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return processedProducts;
}

// Otimizar títulos usando IA
export async function optimizeTitles(products: ProcessedProduct[]): Promise<ProcessedProduct[]> {
  const optimizedProducts: ProcessedProduct[] = [];
  const batchSize = 30;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system", 
            content: `Você é um especialista em SEO e otimização de títulos para marketplace brasileiro.
            
            Gere 3 opções de título otimizado para cada produto e escolha a melhor.
            
            Regras:
            - Máximo 120 caracteres
            - Inclua palavras-chave relevantes para SEO
            - Mantenha clareza e apelo comercial
            - Considere a categoria do produto
            - Use termos que brasileiros procuram
            
            Retorne JSON array com objetos contendo:
            - id: ID do produto
            - optimizedTitle: melhor título escolhido
            - alternatives: array com as 3 opções geradas`
          },
          {
            role: "user",
            content: `Otimize títulos destes produtos:
            ${batch.map(p => `ID: ${p.id}, Título atual: ${p.title}, Categoria: ${p.suggestedCategory}, Preço: R$ ${p.price}`).join("\n")}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      batch.forEach((product, index) => {
        const aiResult = result.products?.[index];
        optimizedProducts.push({
          ...product,
          optimizedTitle: aiResult?.optimizedTitle || optimizeTitleLocally(product.title, product.suggestedCategory, product.price)
        });
      });

    } catch (error) {
      console.error("Erro na otimização de títulos:", error);
      // Fallback local
      batch.forEach(product => {
        optimizedProducts.push({
          ...product,
          optimizedTitle: optimizeTitleLocally(product.title, product.suggestedCategory, product.price)
        });
      });
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return optimizedProducts;
}

// Gerar arquivo de importação para marketplace
export function generateMarketplaceFile(products: ProcessedProduct[]): string {
  const headers = [
    "ID",
    "Título Original", 
    "Título Otimizado",
    "Categoria Original",
    "Categoria Sugerida",
    "Descrição",
    "Preço",
    "Confiança",
    "Status"
  ];

  const rows = products.map(product => [
    product.id,
    `"${product.title.replace(/"/g, '""')}"`,
    `"${product.optimizedTitle.replace(/"/g, '""')}"`,
    `"${product.category.replace(/"/g, '""')}"`,
    `"${product.suggestedCategory.replace(/"/g, '""')}"`,
    `"${product.description.replace(/"/g, '""')}"`,
    product.price.toFixed(2),
    product.confidence,
    "Processado"
  ]);

  return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
}

// Algoritmo local de categorização (fallback)
function categorizeLocally(product: Product): { category: string; confidence: number } {
  const text = `${product.title} ${product.description}`.toLowerCase();
  
  const categoryKeywords = {
    "Eletrônicos": ["smartphone", "celular", "tv", "notebook", "tablet", "camera", "fone"],
    "Roupas & Moda": ["camisa", "calça", "vestido", "sapato", "tênis", "roupa", "moda"],
    "Casa & Jardim": ["mesa", "cadeira", "sofá", "cama", "decoração", "cozinha"],
    "Esporte & Lazer": ["bicicleta", "futebol", "fitness", "academia", "esporte"],
    "Beleza & Saúde": ["perfume", "cosmético", "maquiagem", "creme", "beleza"],
    "Livros & Mídia": ["livro", "filme", "cd", "jogo", "game"],
    "Automotivo": ["carro", "moto", "pneu", "óleo", "auto"],
    "Brinquedos": ["boneca", "carrinho", "brinquedo", "infantil"],
    "Celulares & Telefones": ["iphone", "samsung", "xiaomi", "celular", "smartphone"],
    "Informática": ["computador", "pc", "mouse", "teclado", "monitor"],
  };

  let bestCategory = "Eletrônicos";
  let maxScore = 0;

  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    const score = keywords.reduce((acc, keyword) => {
      return acc + (text.includes(keyword) ? 1 : 0);
    }, 0);

    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  });

  const confidence = Math.min(95, Math.max(60, maxScore * 20 + 40));
  return { category: bestCategory, confidence };
}

// Otimização local de título (fallback)
function optimizeTitleLocally(title: string, category: string, price: number): string {
  const seoTerms = {
    "Eletrônicos": ["Original", "Novo", "Garantia", "Tecnologia"],
    "Roupas & Moda": ["Estilo", "Conforto", "Moda", "Tendência"],
    "Casa & Jardim": ["Resistente", "Prático", "Design", "Qualidade"],
    "Esporte & Lazer": ["Performance", "Profissional", "Conforto"],
    "Beleza & Saúde": ["Natural", "Cuidado", "Proteção"],
  };

  const categoryTerms = seoTerms[category as keyof typeof seoTerms] || ["Qualidade"];
  const selectedTerm = categoryTerms[Math.floor(Math.random() * categoryTerms.length)];

  let optimized = title;
  
  if (!title.toLowerCase().includes(selectedTerm.toLowerCase())) {
    optimized = `${selectedTerm} ${title}`;
  }

  if (price < 50) {
    optimized += " - Econômico";
  } else if (price > 200) {
    optimized += " - Premium";
  }

  // Limitar tamanho
  if (optimized.length > 120) {
    optimized = optimized.substring(0, 117) + "...";
  }

  return optimized;
}

// Estatísticas do processamento
export function getProcessingStats(products: ProcessedProduct[]) {
  const totalProducts = products.length;
  const categorizedProducts = products.filter(p => p.suggestedCategory !== p.category).length;
  const highConfidenceProducts = products.filter(p => p.confidence >= 80).length;
  const optimizedTitles = products.filter(p => p.optimizedTitle !== p.title).length;

  return {
    total: totalProducts,
    categorized: categorizedProducts,
    highConfidence: highConfidenceProducts,
    optimizedTitles: optimizedTitles,
    averageConfidence: Math.round(products.reduce((acc, p) => acc + p.confidence, 0) / totalProducts),
    categoryDistribution: products.reduce((acc, p) => {
      acc[p.suggestedCategory] = (acc[p.suggestedCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
}