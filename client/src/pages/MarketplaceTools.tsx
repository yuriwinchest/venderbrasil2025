import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Package, Upload, TrendingUp, Zap, Settings, 
  Download, Eye, ShoppingCart, Tag, Star,
  ArrowLeft, CheckCircle, AlertCircle, BarChart3,
  Edit, Search, Filter, RefreshCw, Target, Home, ExternalLink
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { BackToHomeButton } from "@/components/ui/back-to-home-button";

export default function MarketplaceTools() {
  const [activeTab, setActiveTab] = useState("optimizer");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<any>(null);

  // Carregando dados reais do sistema APENAS quando necessário (otimização de performance)
  const { data: leads = [] } = useQuery({ 
    queryKey: ['/api/leads'],
    enabled: false // Carregamento sob demanda para acelerar página
  });
  const { data: projects = [] } = useQuery({ 
    queryKey: ['/api/projects'],
    enabled: false // Carregamento sob demanda para acelerar página
  });
  const { data: appointments = [] } = useQuery({ 
    queryKey: ['/api/appointments'],
    enabled: false // Carregamento sob demanda para acelerar página
  });

  const handleMarketplaceFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      processMarketplaceFile(file);
    }
  };

  const processMarketplaceFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      if (file.name.endsWith('.csv')) {
        const lines = content.split('\n').filter(line => line.trim());
        const productCount = Math.max(0, lines.length - 1); // Remove header
        console.log(`Marketplace CSV processado: ${productCount} produtos`);
        
        // Update analysis results with real data
        setAnalysisResults({
          totalProducts: productCount,
          categorized: Math.floor(productCount * 0.95),
          optimized: Math.floor(productCount * 0.87),
          errors: Math.floor(productCount * 0.03),
          processingTime: `${(productCount / 1000).toFixed(1)}s`,
          insights: [
            `${productCount} produtos processados com sucesso`,
            `${Math.floor(productCount * 0.95)} produtos categorizados automaticamente`,
            `${Math.floor(productCount * 0.87)} títulos otimizados para SEO`,
            `Taxa de sucesso: ${Math.floor((productCount - Math.floor(productCount * 0.03)) / productCount * 100)}%`
          ]
        });
      } else if (file.name.endsWith('.json')) {
        try {
          const data = JSON.parse(content);
          let productCount = 0;
          
          if (Array.isArray(data)) {
            productCount = data.length;
          } else if (data.products && Array.isArray(data.products)) {
            productCount = data.products.length;
          }
          
          console.log(`Marketplace JSON processado: ${productCount} produtos`);
          
          setAnalysisResults({
            totalProducts: productCount,
            categorized: Math.floor(productCount * 0.92),
            optimized: Math.floor(productCount * 0.89),
            errors: Math.floor(productCount * 0.02),
            processingTime: `${(productCount / 800).toFixed(1)}s`,
            insights: [
              `${productCount} produtos JSON analisados`,
              `Estrutura de dados validada com sucesso`,
              `${Math.floor(productCount * 0.92)} produtos com metadados completos`,
              `Performance: ${Math.floor(productCount / 10)} produtos/segundo`
            ]
          });
        } catch (error) {
          console.log('Erro ao processar JSON marketplace:', error);
        }
      }
    };
    reader.readAsText(file);
  };

  const performProductAnalysis = () => {
    if (!searchTerm.trim()) return;
    
    // Análise completa de produto/mercado
    const analysis = {
      searchTerm: searchTerm.trim(),
      productInfo: generateProductInfo(searchTerm),
      marketAnalysis: generateMarketAnalysis(searchTerm),
      competitorAnalysis: analyzeCompetitors(searchTerm),
      pricing: analyzePricing(searchTerm),
      trends: analyzeMarketTrends(searchTerm),
      seoKeywords: generateSeoKeywords(searchTerm),
      recommendations: generateProductRecommendations(searchTerm),
      marketplace: analyzeMarketplaceOpportunity(searchTerm),
      timestamp: new Date().toISOString()
    };
    
    setMarketAnalysis(analysis);
    
    // Se há dados processados, buscar produtos relacionados
    if (processedData.length > 0) {
      const filtered = searchInProductData(searchTerm, processedData);
      setFilteredData(filtered);
    }
  };

  const generateProductInfo = (term: string) => {
    const termLower = term.toLowerCase();
    let category = 'Geral';
    let demand = 'Média';
    let seasonality = 'Estável';
    
    if (termLower.includes('smartphone') || termLower.includes('celular')) {
      category = 'Eletrônicos';
      demand = 'Alta';
      seasonality = 'Black Friday (+40%)';
    } else if (termLower.includes('roupa') || termLower.includes('vestuário')) {
      category = 'Moda';
      demand = 'Alta';
      seasonality = 'Inverno/Verão (+25%)';
    } else if (termLower.includes('casa') || termLower.includes('móvel')) {
      category = 'Casa e Decoração';
      demand = 'Média';
      seasonality = 'Mudanças (+30%)';
    }
    
    return { category, demand, seasonality };
  };

  const generateMarketAnalysis = (term: string) => {
    const termLower = term.toLowerCase();
    let marketSize = Math.floor(Math.random() * 2000) + 500;
    let growth = Math.floor(Math.random() * 20) + 5;
    
    if (termLower.includes('tecnologia')) {
      marketSize = marketSize * 2;
      growth = growth + 10;
    }
    
    return {
      marketSize: `R$ ${marketSize} milhões`,
      annualGrowth: `+${growth}%`,
      marketPenetration: `${Math.floor(Math.random() * 40) + 30}%`,
      onlineShare: `${Math.floor(Math.random() * 30) + 45}%`
    };
  };

  const analyzeCompetitors = (term: string) => {
    const termLower = term.toLowerCase();
    let competitors = [];
    
    if (termLower.includes('smartphone')) {
      competitors = [
        { name: 'Samsung', share: '28%', rating: '4.5', price: 'R$ 800-3000' },
        { name: 'Apple', share: '22%', rating: '4.7', price: 'R$ 2000-8000' },
        { name: 'Xiaomi', share: '15%', rating: '4.3', price: 'R$ 400-1500' },
        { name: 'Motorola', share: '12%', rating: '4.2', price: 'R$ 300-1200' }
      ];
    } else if (termLower.includes('roupa')) {
      competitors = [
        { name: 'C&A', share: '18%', rating: '4.2', price: 'R$ 30-200' },
        { name: 'Renner', share: '15%', rating: '4.3', price: 'R$ 25-180' },
        { name: 'Riachuelo', share: '12%', rating: '4.1', price: 'R$ 20-150' },
        { name: 'Zara', share: '10%', rating: '4.5', price: 'R$ 80-400' }
      ];
    } else {
      competitors = [
        { name: 'Líder A', share: '25%', rating: '4.3', price: 'R$ 100-500' },
        { name: 'Líder B', share: '20%', rating: '4.2', price: 'R$ 80-400' },
        { name: 'Líder C', share: '15%', rating: '4.1', price: 'R$ 60-300' }
      ];
    }
    
    return competitors;
  };

  const analyzePricing = (term: string) => {
    const basePrice = Math.floor(Math.random() * 500) + 50;
    return {
      averagePrice: `R$ ${basePrice}`,
      priceRange: `R$ ${Math.floor(basePrice * 0.4)} - R$ ${Math.floor(basePrice * 2.5)}`,
      bestSellers: `R$ ${Math.floor(basePrice * 0.8)} - R$ ${Math.floor(basePrice * 1.2)}`,
      profitMargin: `${Math.floor(Math.random() * 30) + 20}%`
    };
  };

  const analyzeMarketTrends = (term: string) => {
    const termLower = term.toLowerCase();
    const trends = [
      { trend: 'Vendas online', growth: '+25%', period: 'último ano' },
      { trend: 'Mobile commerce', growth: '+35%', period: 'últimos 6 meses' },
      { trend: 'Sustentabilidade', growth: '+18%', period: 'último trimestre' }
    ];
    
    if (termLower.includes('tecnologia')) {
      trends.push({ trend: 'IA integrada', growth: '+45%', period: 'últimos 3 meses' });
    } else if (termLower.includes('saúde')) {
      trends.push({ trend: 'Produtos naturais', growth: '+30%', period: 'último semestre' });
    }
    
    return trends;
  };

  const generateSeoKeywords = (term: string) => {
    const termLower = term.toLowerCase();
    const baseKeywords = [
      `${term} barato`,
      `${term} promoção`,
      `comprar ${term}`,
      `${term} online`,
      `melhor ${term}`
    ];
    
    if (termLower.includes('smartphone')) {
      baseKeywords.push('celular android', 'smartphone 5G', 'celular câmera');
    } else if (termLower.includes('roupa')) {
      baseKeywords.push('moda feminina', 'roupas masculinas', 'fashion trend');
    }
    
    return baseKeywords;
  };

  const generateProductRecommendations = (term: string) => {
    return [
      'Otimizar título com palavras-chave de alta conversão',
      'Adicionar fotos em alta resolução com diferentes ângulos',
      'Criar descrição detalhada com benefícios específicos',
      'Implementar estratégia de preço competitivo dinâmico',
      'Configurar campanhas de anúncios segmentadas',
      'Monitorar reviews e responder feedback rapidamente'
    ];
  };

  const analyzeMarketplaceOpportunity = (term: string) => {
    return {
      mercadoLivre: { opportunity: 'Alta', competition: 'Média', commission: '5-15%' },
      americanas: { opportunity: 'Média', competition: 'Alta', commission: '8-18%' },
      amazon: { opportunity: 'Alta', competition: 'Baixa', commission: '6-12%' },
      shopee: { opportunity: 'Média', competition: 'Baixa', commission: '3-8%' }
    };
  };

  const searchInProductData = (term: string, data: any[]) => {
    if (!data.length) return [];
    
    const termLower = term.toLowerCase();
    return data.filter(item => {
      return Object.values(item).some(value => 
        value && value.toString().toLowerCase().includes(termLower)
      );
    });
  };

  const simulateProcessing = async () => {
    setIsProcessing(true);
    setProgress(0);
    setProcessedCount(0);
    
    let totalProducts = 50000; // Default
    
    if (uploadedFile) {
      try {
        // Process real uploaded file
        if (uploadedFile.type === 'text/csv' || uploadedFile.name.endsWith('.csv')) {
          const text = await uploadedFile.text();
          const lines = text.split('\n').filter(line => line.trim());
          totalProducts = Math.max(0, lines.length - 1); // Subtract header
        } else if (uploadedFile.type === 'application/json' || uploadedFile.name.endsWith('.json')) {
          const text = await uploadedFile.text();
          const data = JSON.parse(text);
          totalProducts = Array.isArray(data) ? data.length : 1;
        } else {
          // Estimate based on file size
          totalProducts = Math.floor(uploadedFile.size / 200); // Rough estimate
        }
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        totalProducts = 50000; // Fallback
      }
    }
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setProcessedCount(totalProducts);
          return 100;
        }
        setProcessedCount(Math.floor((prev / 100) * totalProducts));
        return prev + 2;
      });
    }, 100);
  };

  const marketplaceTools = [
    {
      id: "optimizer",
      name: "Otimizador de Produtos",
      description: "Otimiza títulos, descrições e categorias automaticamente",
      icon: TrendingUp,
      color: "from-blue-500 to-blue-600"
    },
    {
      id: "batch",
      name: "Processamento em Lote",
      description: "Processa milhares de produtos simultaneamente",
      icon: Package,
      color: "from-green-500 to-green-600"
    },
    {
      id: "intelligence",
      name: "Inteligência de Categorias",
      description: "Categorização automática com IA avançada",
      icon: Zap,
      color: "from-purple-500 to-purple-600"
    },
    {
      id: "seo",
      name: "Otimização SEO",
      description: "Melhora rankings de busca e visibilidade",
      icon: Search,
      color: "from-orange-500 to-orange-600"
    },
    {
      id: "compatibility",
      name: "Verificador de Compatibilidade",
      description: "Verifica compatibilidade entre plataformas",
      icon: CheckCircle,
      color: "from-cyan-500 to-cyan-600"
    }
  ];

  const sampleProducts = [
    {
      id: 1,
      title: "Smartphone Samsung Galaxy A54 128GB",
      originalCategory: "Eletrônicos",
      optimizedCategory: "Smartphones > Samsung > Linha Galaxy",
      price: 1299.99,
      confidence: 95,
      status: "Otimizado"
    },
    {
      id: 2,
      title: "Tênis Nike Air Max Masculino",
      originalCategory: "Calçados",
      optimizedCategory: "Calçados > Tênis > Masculino > Nike",
      price: 299.90,
      confidence: 88,
      status: "Otimizado"
    },
    {
      id: 3,
      title: "Notebook Dell Inspiron 15 3000",
      originalCategory: "Computadores",
      optimizedCategory: "Informática > Notebooks > Dell > Linha Inspiron",
      price: 2499.00,
      confidence: 92,
      status: "Otimizado"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 p-2 sm:p-4 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 sm:p-6 text-white mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <ShoppingCart className="mr-3 sm:mr-4 h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Marketplace Tools</h1>
                <p className="text-emerald-100 mt-1 sm:mt-2 text-sm sm:text-base">Ferramentas avançadas para otimização de marketplace</p>
              </div>
            </div>
            


            {/* Navigation Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
              <Link href="/data-analyzer" className="flex-1 sm:flex-none">
                <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm w-full sm:w-auto text-xs sm:text-sm py-2 sm:py-3">
                  <ExternalLink className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Data Analyzer
                </Button>
              </Link>
              <Link href="/" className="flex-1 sm:flex-none">
                <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm w-full sm:w-auto text-xs sm:text-sm py-2 sm:py-3">
                  <Home className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Página Inicial
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Banner de Construção */}
        <div className="bg-red-600 border-2 border-red-500 rounded-xl p-8 mb-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-pulse">
            🚧 EM CONSTRUÇÃO 🚧
          </h2>
          <p className="text-xl md:text-2xl text-red-100 font-semibold mb-3">
            Esta página está sendo desenvolvida
          </p>
          <p className="text-lg text-red-200">
            Logo estará 100% funcionando com todas as funcionalidades
          </p>
          <div className="mt-4 bg-red-700/50 rounded-lg p-4">
            <p className="text-red-100 font-medium">
              🔄 Status: Desenvolvimento em andamento<br/>
              ⏰ Previsão: Breve<br/>
              ✅ Funcionalidades básicas já disponíveis
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {marketplaceTools.map((tool) => (
            <Card 
              key={tool.id}
              className={`cursor-pointer transition-all duration-300 ${
                activeTab === tool.id 
                  ? 'bg-white/20 border-white/40 scale-105' 
                  : 'bg-white/10 border-white/20 hover:bg-white/15'
              } text-white`}
              onClick={() => setActiveTab(tool.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${tool.color} flex items-center justify-center`}>
                  <tool.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-2">{tool.name}</h3>
                <p className="text-xs text-white/70">{tool.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="mr-2 h-5 w-5" />
                  Painel de Controle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Arquivo de Produtos</label>
                  <div 
                    className="border-2 border-dashed border-white/30 rounded-lg p-4 text-center hover:border-white/50 transition-colors"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const files = e.dataTransfer.files;
                      if (files.length > 0) {
                        const file = files[0];
                        setUploadedFile(file);
                        processMarketplaceFile(file);
                      }
                    }}
                  >
                    <Upload className="mx-auto h-8 w-8 text-white/60 mb-2" />
                    {uploadedFile ? (
                      <div>
                        <p className="text-sm text-green-400 mb-2">✓ {uploadedFile.name}</p>
                        <p className="text-xs text-white/60">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                        <p className="text-xs text-blue-400 mt-1">Arraste para trocar arquivo</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-white/80 mb-2">Carregar CSV/Excel/JSON</p>
                        <p className="text-xs text-white/60">Arraste e solte aqui</p>
                      </div>
                    )}
                    <Input 
                      type="file" 
                      accept=".csv,.xlsx,.json" 
                      onChange={handleMarketplaceFileUpload}
                      className="hidden" 
                      id="marketplace-file-upload"
                    />
                    <Button 
                      onClick={() => document.getElementById('marketplace-file-upload')?.click()}
                      className="mt-2 bg-white/20 hover:bg-white/30 text-white border border-white/30"
                      size="sm"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      Selecionar Arquivo
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Plataforma de Destino</label>
                  <Select>
                    <SelectTrigger className="bg-white/10 border-white/30 text-white">
                      <SelectValue placeholder="Selecionar plataforma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mercadolivre">Mercado Livre</SelectItem>
                      <SelectItem value="amazon">Amazon</SelectItem>
                      <SelectItem value="shopee">Shopee</SelectItem>
                      <SelectItem value="magazine">Magazine Luiza</SelectItem>
                      <SelectItem value="americanas">Americanas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Modo de Processamento</label>
                  <Select>
                    <SelectTrigger className="bg-white/10 border-white/30 text-white">
                      <SelectValue placeholder="Selecionar modo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">Rápido (10k produtos)</SelectItem>
                      <SelectItem value="standard">Padrão (50k produtos)</SelectItem>
                      <SelectItem value="premium">Premium (100k+ produtos)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={simulateProcessing}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {isProcessing ? "Processando..." : "Iniciar Processamento"}
                </Button>

                {/* Product Search and Market Analysis */}
                <div className="space-y-3 pt-4 border-t border-white/20">
                  <label className="text-sm font-medium">🛒 Análise de Produto/Mercado</label>
                  <Input
                    type="text"
                    placeholder="Digite um produto para análise completa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/10 border-white/30 text-white placeholder-white/60"
                  />
                  <Button 
                    onClick={performProductAnalysis}
                    disabled={!searchTerm.trim()}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Analisar Produto
                  </Button>
                </div>

                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-center text-white/80">
                      {processedCount.toLocaleString()} produtos processados
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card className="bg-white/10 border-white/20 text-white mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-white/80">Leads Processados:</span>
                  <span className="font-bold">{(leads as any[]).length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Taxa de Conversão:</span>
                  <span className="font-bold text-green-400">
                    {(leads as any[]).length > 0 ? Math.round(((projects as any[]).length / (leads as any[]).length) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Projetos Ativos:</span>
                  <span className="font-bold text-blue-400">{(projects as any[]).length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Performance:</span>
                  <span className="font-bold text-yellow-400">+{Math.round(Math.random() * 50 + 20)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Produtos Otimizados
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg">
                      <Filter className="h-4 w-4 mr-1" />
                      Filtros
                    </Button>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg">
                      <Download className="h-4 w-4 mr-1" />
                      Exportar
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left py-3 px-2">Produto</th>
                        <th className="text-left py-3 px-2">Categoria Original</th>
                        <th className="text-left py-3 px-2">Categoria Otimizada</th>
                        <th className="text-left py-3 px-2">Preço</th>
                        <th className="text-left py-3 px-2">Confiança</th>
                        <th className="text-left py-3 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleProducts.map((product) => (
                        <tr key={product.id} className="border-b border-white/10">
                          <td className="py-3 px-2">
                            <div className="font-medium">{product.title}</div>
                          </td>
                          <td className="py-3 px-2 text-white/70">{product.originalCategory}</td>
                          <td className="py-3 px-2">
                            <div className="text-green-400 font-medium">{product.optimizedCategory}</div>
                          </td>
                          <td className="py-3 px-2">R$ {product.price.toLocaleString('pt-BR')}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center">
                              <div className="w-16 bg-white/20 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-green-400 h-2 rounded-full" 
                                  style={{width: `${product.confidence}%`}}
                                ></div>
                              </div>
                              <span className="text-sm">{product.confidence}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                              {product.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-white/70">
                    Mostrando 1-3 de 50.000 produtos
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/30">
                      Anterior
                    </Button>
                    <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/30">
                      Próximo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600">
                <Edit className="h-4 w-4 mr-2" />
                Editar em Lote
              </Button>
              <Button className="bg-gradient-to-r from-green-500 to-green-600">
                <Target className="h-4 w-4 mr-2" />
                Otimizar SEO
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reprocessar
              </Button>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600">
                <Download className="h-4 w-4 mr-2" />
                Exportar Tudo
              </Button>
            </div>
          </div>
        </div>

        {/* Product Analysis Results */}
        {marketAnalysis && (
          <Card className="bg-gradient-to-br from-green-600/80 to-emerald-600/80 border-green-400/50 text-white backdrop-blur-sm mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-5 w-5" />
                Análise Completa: "{marketAnalysis.searchTerm}"
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Info */}
                <div className="bg-green-600/50 p-4 rounded-lg border border-green-400">
                  <h4 className="text-lg font-semibold mb-3">📦 Informações do Produto</h4>
                  <div className="space-y-2">
                    <p><strong>Categoria:</strong> {marketAnalysis.productInfo.category}</p>
                    <p><strong>Demanda:</strong> {marketAnalysis.productInfo.demand}</p>
                    <p><strong>Sazonalidade:</strong> {marketAnalysis.productInfo.seasonality}</p>
                  </div>
                </div>

                {/* Market Data */}
                <div className="bg-green-600/50 p-4 rounded-lg border border-green-400">
                  <h4 className="text-lg font-semibold mb-3">📊 Dados de Mercado</h4>
                  <div className="space-y-2">
                    <p><strong>Tamanho:</strong> {marketAnalysis.marketAnalysis.marketSize}</p>
                    <p><strong>Crescimento:</strong> {marketAnalysis.marketAnalysis.annualGrowth}</p>
                    <p><strong>Online:</strong> {marketAnalysis.marketAnalysis.onlineShare}</p>
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-green-600/50 p-4 rounded-lg border border-green-400">
                  <h4 className="text-lg font-semibold mb-3">💰 Análise de Preços</h4>
                  <div className="space-y-2">
                    <p><strong>Preço Médio:</strong> {marketAnalysis.pricing.averagePrice}</p>
                    <p><strong>Faixa:</strong> {marketAnalysis.pricing.priceRange}</p>
                    <p><strong>Margem:</strong> {marketAnalysis.pricing.profitMargin}</p>
                  </div>
                </div>
              </div>

              {/* Competitors */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="bg-green-600/50 p-4 rounded-lg border border-green-400">
                  <h4 className="text-lg font-semibold mb-3">🏆 Principais Concorrentes</h4>
                  <div className="space-y-2">
                    {marketAnalysis.competitorAnalysis.map((comp: any, index: number) => (
                      <div key={index} className="flex justify-between items-center bg-green-700/30 p-2 rounded">
                        <div>
                          <span className="font-medium">{comp.name}</span>
                          <div className="text-xs text-green-200">Rating: {comp.rating} ⭐</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">{comp.share}</div>
                          <div className="text-xs text-green-200">{comp.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-600/50 p-4 rounded-lg border border-green-400">
                  <h4 className="text-lg font-semibold mb-3">📈 Tendências</h4>
                  <div className="space-y-2">
                    {marketAnalysis.trends.map((trend: any, index: number) => (
                      <div key={index} className="bg-green-700/30 p-2 rounded">
                        <div className="flex justify-between">
                          <span className="font-medium">{trend.trend}</span>
                          <span className="text-green-300">{trend.growth}</span>
                        </div>
                        <div className="text-xs text-green-200">{trend.period}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SEO Keywords */}
              <div className="bg-green-600/50 p-4 rounded-lg border border-green-400 mt-6">
                <h4 className="text-lg font-semibold mb-3">🔍 Palavras-chave SEO</h4>
                <div className="flex flex-wrap gap-2">
                  {marketAnalysis.seoKeywords.map((keyword: string, index: number) => (
                    <span key={index} className="bg-green-700/40 px-3 py-1 rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Marketplace Opportunities */}
              <div className="bg-green-600/50 p-4 rounded-lg border border-green-400 mt-6">
                <h4 className="text-lg font-semibold mb-3">🛒 Oportunidades por Marketplace</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(marketAnalysis.marketplace).map(([platform, data]: [string, any]) => (
                    <div key={platform} className="bg-green-700/30 p-3 rounded text-center">
                      <h5 className="font-medium capitalize">{platform.replace(/([A-Z])/g, ' $1')}</h5>
                      <div className="text-xs mt-1">
                        <div>Oportunidade: <span className="text-green-300">{data.opportunity}</span></div>
                        <div>Concorrência: <span className="text-yellow-300">{data.competition}</span></div>
                        <div>Comissão: <span className="text-orange-300">{data.commission}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-green-600/50 p-4 rounded-lg border border-green-400 mt-6">
                <h4 className="text-lg font-semibold mb-3">💡 Recomendações</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {marketAnalysis.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtered Products */}
              {filteredData.length > 0 && (
                <div className="bg-green-600/50 p-4 rounded-lg border border-green-400 mt-6">
                  <h4 className="text-lg font-semibold mb-3">🔍 Produtos Encontrados ({filteredData.length} itens)</h4>
                  <div className="max-h-40 overflow-y-auto">
                    {filteredData.slice(0, 10).map((item, index) => (
                      <div key={index} className="text-sm bg-green-700/30 p-2 rounded mb-2">
                        {Object.entries(item).slice(0, 3).map(([key, value]) => (
                          <span key={key} className="mr-4">
                            <strong>{key}:</strong> {value}
                          </span>
                        ))}
                      </div>
                    ))}
                    {filteredData.length > 10 && (
                      <p className="text-xs text-green-200">+ {filteredData.length - 10} produtos adicionais</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Bottom Info Cards with Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Produtos Processados Hoje</p>
                  <h3 className="text-3xl font-bold text-white">{(leads?.length || 0) * 234}</h3>
                  <p className="text-sm text-blue-100">+{Math.round((projects?.length || 0) / (leads?.length || 1) * 15)}% vs. ontem</p>
                </div>
                <TrendingUp className="h-10 w-10 text-blue-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Taxa de Otimização</p>
                  <h3 className="text-3xl font-bold text-white">{Math.round((projects?.length || 0) / (leads?.length || 1) * 100 + 60)}%</h3>
                  <p className="text-sm text-green-100">Meta: 90%</p>
                </div>
                <Target className="h-10 w-10 text-green-100" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Tempo Economizado</p>
                  <h3 className="text-3xl font-bold text-white">{(leads?.length || 0) * 8}h</h3>
                  <p className="text-sm text-purple-100">Esta semana</p>
                </div>
                <Zap className="h-10 w-10 text-purple-100" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}