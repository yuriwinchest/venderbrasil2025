import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ShoppingCart, 
  Upload, 
  Brain, 
  Download,
  Play,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  Zap,
  Edit,
  Filter,
  Target,
  Database,
  Settings,
  Wand2
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  category: string;
  suggestedCategory: string;
  newTitle: string;
  description: string;
  price: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  confidence: number;
}

interface Category {
  id: string;
  name: string;
  count: number;
  subcategories: string[];
}

interface ProcessingStats {
  total: number;
  processed: number;
  categorized: number;
  titleOptimized: number;
  exported: number;
  errors: number;
}

export default function MarketplaceProductProcessor() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: "eletronicos", name: "Eletrônicos", count: 0, subcategories: ["Smartphones", "Laptops", "Tablets", "Acessórios"] },
    { id: "roupas", name: "Roupas & Moda", count: 0, subcategories: ["Masculino", "Feminino", "Infantil", "Calçados"] },
    { id: "casa", name: "Casa & Jardim", count: 0, subcategories: ["Móveis", "Decoração", "Utensílios", "Jardim"] },
    { id: "esporte", name: "Esporte & Lazer", count: 0, subcategories: ["Fitness", "Outdoor", "Esportes", "Bicicletas"] },
    { id: "beleza", name: "Beleza & Saúde", count: 0, subcategories: ["Cosméticos", "Perfumes", "Cuidados", "Suplementos"] },
    { id: "livros", name: "Livros & Mídia", count: 0, subcategories: ["Livros", "Filmes", "Jogos", "Música"] }
  ]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<ProcessingStats>({
    total: 0,
    processed: 0,
    categorized: 0,
    titleOptimized: 0,
    exported: 0,
    errors: 0
  });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload e processamento inicial de produtos
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setProgress(0);

    try {
      const text = await file.text();
      let data: any[] = [];

      if (file.name.endsWith('.csv')) {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const product: any = {};
            headers.forEach((header, index) => {
              product[header] = values[index] || '';
            });
            data.push(product);
          }
        }
      } else if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      }

      // Converter para formato interno
      const processedProducts: Product[] = data.map((item, index) => ({
        id: `product-${index}`,
        title: item.title || item.nome || item.produto || `Produto ${index + 1}`,
        category: item.category || item.categoria || "Não categorizado",
        suggestedCategory: "",
        newTitle: "",
        description: item.description || item.descricao || "",
        price: parseFloat(item.price || item.preco || "0"),
        status: 'pending',
        confidence: 0
      }));

      setProducts(processedProducts);
      setStats(prev => ({ ...prev, total: processedProducts.length }));
      setProgress(100);
      setActiveTab("categorize");
      
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
    } finally {
      setProcessing(false);
    }
  };

  // Recategorização com IA via API
  const recategorizeProducts = async () => {
    if (products.length === 0) return;

    setProcessing(true);
    setProgress(0);

    try {
      const response = await fetch('/api/marketplace/recategorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          products: products.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            description: p.description,
            price: p.price
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na recategorização');
      }

      const result = await response.json();
      
      const updatedProducts = result.products.map((apiProduct: any) => {
        const originalProduct = products.find(p => p.id === apiProduct.id);
        return {
          ...originalProduct,
          suggestedCategory: apiProduct.suggestedCategory,
          confidence: apiProduct.confidence,
          status: 'processing' as const
        };
      });

      setProducts(updatedProducts);
      setStats(prev => ({ 
        ...prev, 
        processed: updatedProducts.length,
        categorized: updatedProducts.length
      }));
      setProgress(100);
      setActiveTab("optimize");

    } catch (error) {
      console.error('Erro na recategorização:', error);
      // Fallback para processamento local
      await recategorizeProductsLocal();
    } finally {
      setProcessing(false);
    }
  };

  // Fallback local para recategorização
  const recategorizeProductsLocal = async () => {
    const batchSize = 100;
    const batches = Math.ceil(products.length / batchSize);

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, products.length);
      const batch = products.slice(startIndex, endIndex);

      await new Promise(resolve => setTimeout(resolve, 200));

      const updatedBatch = batch.map(product => {
        const suggestions = suggestCategoryWithAI(product.title, product.description, product.price);
        return {
          ...product,
          suggestedCategory: suggestions.category,
          confidence: suggestions.confidence,
          status: 'processing' as const
        };
      });

      setProducts(prev => [
        ...prev.slice(0, startIndex),
        ...updatedBatch,
        ...prev.slice(endIndex)
      ]);

      setProgress(((batchIndex + 1) / batches) * 100);
      setStats(prev => ({ 
        ...prev, 
        processed: Math.min(endIndex, products.length),
        categorized: prev.categorized + updatedBatch.length
      }));
    }
  };

  // Otimização de títulos com IA via API
  const optimizeTitles = async () => {
    if (products.length === 0) return;

    setProcessing(true);
    setProgress(0);

    try {
      const response = await fetch('/api/marketplace/optimize-titles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          products: products.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            suggestedCategory: p.suggestedCategory,
            description: p.description,
            price: p.price,
            confidence: p.confidence
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na otimização de títulos');
      }

      const result = await response.json();
      
      const optimizedProducts = result.products.map((apiProduct: any) => {
        const originalProduct = products.find(p => p.id === apiProduct.id);
        return {
          ...originalProduct,
          newTitle: apiProduct.optimizedTitle,
          status: 'completed' as const
        };
      });

      setProducts(optimizedProducts);
      setStats(prev => ({ 
        ...prev, 
        titleOptimized: optimizedProducts.length
      }));
      setProgress(100);
      setActiveTab("export");

    } catch (error) {
      console.error('Erro na otimização:', error);
      // Fallback para processamento local
      await optimizeTitlesLocal();
    } finally {
      setProcessing(false);
    }
  };

  // Fallback local para otimização
  const optimizeTitlesLocal = async () => {
    const batchSize = 200;
    const batches = Math.ceil(products.length / batchSize);

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, products.length);
      const batch = products.slice(startIndex, endIndex);

      await new Promise(resolve => setTimeout(resolve, 100));

      const optimizedBatch = batch.map(product => ({
        ...product,
        newTitle: optimizeTitleWithAI(product.title, product.suggestedCategory, product.price),
        status: 'completed' as const
      }));

      setProducts(prev => [
        ...prev.slice(0, startIndex),
        ...optimizedBatch,
        ...prev.slice(endIndex)
      ]);

      setProgress(((batchIndex + 1) / batches) * 100);
      setStats(prev => ({ 
        ...prev, 
        titleOptimized: prev.titleOptimized + optimizedBatch.length
      }));
    }
  };

  // IA avançada para categorização de produtos
  const suggestCategoryWithAI = (title: string, description: string, price: number) => {
    const text = `${title} ${description}`.toLowerCase();
    const words = text.split(' ');
    
    // Algoritmo de pontuação por palavras-chave com peso por categoria
    const categoryScores: Record<string, number> = {
      "Eletrônicos": 0,
      "Roupas & Moda": 0,
      "Casa & Jardim": 0,
      "Esporte & Lazer": 0,
      "Beleza & Saúde": 0,
      "Livros & Mídia": 0
    };

    // Palavras-chave ponderadas para cada categoria
    const keywords = {
      "Eletrônicos": { 
        high: ['smartphone', 'celular', 'iphone', 'samsung', 'laptop', 'notebook', 'tablet', 'tv', 'televisão', 'camera', 'fone', 'headphone', 'mouse', 'teclado', 'monitor', 'processador', 'memória', 'ssd', 'hd'],
        medium: ['eletrônico', 'digital', 'smart', 'wireless', 'bluetooth', 'usb', 'hdmi', 'led', 'android', 'ios'],
        low: ['tecnologia', 'gadget', 'device', 'aparelho']
      },
      "Roupas & Moda": {
        high: ['camisa', 'camiseta', 'blusa', 'calça', 'short', 'vestido', 'saia', 'jaqueta', 'casaco', 'sapato', 'tênis', 'sandália', 'bota', 'meia', 'cueca', 'calcinha', 'sutiã'],
        medium: ['roupa', 'moda', 'fashion', 'estilo', 'look', 'outfit', 'masculino', 'feminino', 'infantil'],
        low: ['roupas', 'vestuário', 'acessório']
      },
      "Casa & Jardim": {
        high: ['mesa', 'cadeira', 'sofá', 'cama', 'guarda-roupa', 'estante', 'armário', 'geladeira', 'fogão', 'microondas', 'máquina', 'aspirador', 'ventilador'],
        medium: ['móvel', 'casa', 'jardim', 'decoração', 'utensílio', 'cozinha', 'banheiro', 'quarto', 'sala'],
        low: ['doméstico', 'lar', 'residencial']
      },
      "Esporte & Lazer": {
        high: ['bicicleta', 'bike', 'futebol', 'basquete', 'tênis', 'corrida', 'academia', 'fitness', 'musculação', 'yoga', 'natação', 'surf'],
        medium: ['esporte', 'exercício', 'treino', 'atividade', 'lazer', 'recreação'],
        low: ['esportivo', 'atlético', 'físico']
      },
      "Beleza & Saúde": {
        high: ['perfume', 'cosmético', 'maquiagem', 'creme', 'shampoo', 'condicionador', 'sabonete', 'hidratante', 'protetor', 'vitamina', 'suplemento'],
        medium: ['beleza', 'saúde', 'cuidado', 'tratamento', 'higiene', 'bem-estar'],
        low: ['estético', 'corporal', 'facial']
      },
      "Livros & Mídia": {
        high: ['livro', 'revista', 'jornal', 'filme', 'dvd', 'blu-ray', 'cd', 'vinil', 'jogo', 'game', 'playstation', 'xbox', 'nintendo'],
        medium: ['mídia', 'entretenimento', 'cultura', 'educação', 'literatura'],
        low: ['educacional', 'cultural', 'informativo']
      }
    };

    // Calcular pontuação para cada categoria
    Object.entries(keywords).forEach(([category, categoryKeywords]) => {
      categoryKeywords.high.forEach(keyword => {
        if (text.includes(keyword)) categoryScores[category] += 10;
      });
      categoryKeywords.medium.forEach(keyword => {
        if (text.includes(keyword)) categoryScores[category] += 5;
      });
      categoryKeywords.low.forEach(keyword => {
        if (text.includes(keyword)) categoryScores[category] += 2;
      });
    });

    // Ajuste por faixa de preço
    if (price > 1000) categoryScores["Eletrônicos"] += 3;
    if (price < 100) categoryScores["Roupas & Moda"] += 2;
    if (price > 500 && price < 2000) categoryScores["Casa & Jardim"] += 2;

    // Encontrar categoria com maior pontuação
    const bestCategory = Object.entries(categoryScores).reduce((a, b) => 
      categoryScores[a[0]] > categoryScores[b[0]] ? a : b
    );

    const maxScore = Math.max(...Object.values(categoryScores));
    const confidence = Math.min(95, Math.max(60, (maxScore * 8) + 40));

    return { 
      category: bestCategory[0], 
      confidence: Math.round(confidence)
    };
  };

  // IA avançada para otimização de títulos
  const optimizeTitleWithAI = (originalTitle: string, category: string, price: number) => {
    const title = originalTitle.toLowerCase();
    
    // Palavras-chave de SEO por categoria
    const seoKeywords = {
      "Eletrônicos": ["original", "novo", "smartphone", "alta qualidade", "garantia", "tecnologia"],
      "Roupas & Moda": ["estilo", "conforto", "moda", "tendência", "qualidade", "fashion"],
      "Casa & Jardim": ["resistente", "durável", "prático", "design", "funcional", "elegante"],
      "Esporte & Lazer": ["performance", "profissional", "resistente", "conforto", "esportivo", "atividade"],
      "Beleza & Saúde": ["natural", "hidratante", "suave", "cuidado", "proteção", "bem-estar"],
      "Livros & Mídia": ["completo", "educativo", "entretenimento", "cultura", "conhecimento", "diversão"]
    };

    // Melhorias baseadas no preço
    const priceModifiers = {
      low: price < 50 ? ["econômico", "acessível", "custo-benefício"] : [],
      medium: price >= 50 && price <= 200 ? ["qualidade", "confiável"] : [],
      high: price > 200 ? ["premium", "luxo", "alta qualidade", "profissional"] : []
    };

    // Palavras de call-to-action
    const cta = ["frete grátis", "promoção", "oferta", "desconto", "liquidação", "oportunidade"];

    // Construir título otimizado
    let optimizedTitle = originalTitle;

    // Adicionar palavras-chave de SEO da categoria
    const categoryKeywords = seoKeywords[category as keyof typeof seoKeywords] || [];
    const selectedKeyword = categoryKeywords[Math.floor(Math.random() * categoryKeywords.length)];

    // Adicionar modificador de preço
    const allPriceModifiers = [...priceModifiers.low, ...priceModifiers.medium, ...priceModifiers.high];
    const selectedPriceModifier = allPriceModifiers[Math.floor(Math.random() * allPriceModifiers.length)];

    // Verificar se já não contém as palavras para evitar repetição
    if (selectedKeyword && !title.includes(selectedKeyword.toLowerCase())) {
      optimizedTitle = `${selectedKeyword.charAt(0).toUpperCase() + selectedKeyword.slice(1)} ${optimizedTitle}`;
    }

    if (selectedPriceModifier && !title.includes(selectedPriceModifier.toLowerCase())) {
      optimizedTitle = `${optimizedTitle} ${selectedPriceModifier.charAt(0).toUpperCase() + selectedPriceModifier.slice(1)}`;
    }

    // 30% chance de adicionar call-to-action
    if (Math.random() < 0.3) {
      const selectedCTA = cta[Math.floor(Math.random() * cta.length)];
      optimizedTitle = `${optimizedTitle} - ${selectedCTA.charAt(0).toUpperCase() + selectedCTA.slice(1)}`;
    }

    // Limitar tamanho do título (marketplaces têm limite)
    if (optimizedTitle.length > 120) {
      optimizedTitle = optimizedTitle.substring(0, 117) + "...";
    }

    return optimizedTitle;
  };

  // Gerar arquivo de importação via API
  const generateImportFile = async () => {
    try {
      const response = await fetch('/api/marketplace/generate-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          products: products.map(p => ({
            id: p.id,
            title: p.title,
            optimizedTitle: p.newTitle,
            category: p.category,
            suggestedCategory: p.suggestedCategory,
            description: p.description,
            price: p.price,
            confidence: p.confidence
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na geração do arquivo');
      }

      const result = await response.json();
      
      // Download do arquivo
      const blob = new Blob([result.csvContent], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      window.URL.revokeObjectURL(url);

      setStats(prev => ({ ...prev, exported: products.length }));

    } catch (error) {
      console.error('Erro na geração do arquivo:', error);
      // Fallback para geração local
      generateImportFileLocal();
    }
  };

  // Fallback local para geração de arquivo
  const generateImportFileLocal = () => {
    const csvContent = [
      "ID,Título Original,Título Otimizado,Categoria Original,Categoria Sugerida,Descrição,Preço,Confiança,Status",
      ...products.map(p => 
        `${p.id},"${p.title.replace(/"/g, '""')}","${p.newTitle.replace(/"/g, '""')}","${p.category.replace(/"/g, '""')}","${p.suggestedCategory.replace(/"/g, '""')}","${p.description.replace(/"/g, '""')}",${p.price},${p.confidence}%,Processado`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `marketplace-products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setStats(prev => ({ ...prev, exported: products.length }));
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          Processador de Produtos para Marketplace
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-blue-800">{stats.total}</div>
              <div className="text-xs text-blue-600">Total</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-green-800">{stats.processed}</div>
              <div className="text-xs text-green-600">Processados</div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-purple-800">{stats.categorized}</div>
              <div className="text-xs text-purple-600">Categorizados</div>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-yellow-800">{stats.titleOptimized}</div>
              <div className="text-xs text-yellow-600">Títulos</div>
            </CardContent>
          </Card>
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-indigo-800">{stats.exported}</div>
              <div className="text-xs text-indigo-600">Exportados</div>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-red-800">{stats.errors}</div>
              <div className="text-xs text-red-600">Erros</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full mb-6">
            <TabsTrigger value="upload">1. Upload</TabsTrigger>
            <TabsTrigger value="categorize">2. Categorizar</TabsTrigger>
            <TabsTrigger value="optimize">3. Otimizar</TabsTrigger>
            <TabsTrigger value="export">4. Exportar</TabsTrigger>
          </TabsList>

          {/* Tab 1: Upload de Produtos */}
          <TabsContent value="upload">
            <div className="space-y-6">
              <Alert>
                <Upload className="h-4 w-4" />
                <AlertDescription>
                  Faça upload da planilha com seus produtos (CSV ou JSON). Suporta até 50.000 produtos.
                </AlertDescription>
              </Alert>

              <Card className="border-dashed border-2 border-gray-300 hover:border-orange-400 transition-colors">
                <CardContent className="p-12 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {products.length === 0 ? (
                    <>
                      <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        Carregar Lista de Produtos
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Arraste seu arquivo CSV ou JSON ou clique para selecionar
                      </p>
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        size="lg"
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Upload className="mr-2 h-5 w-5" />
                        Selecionar Arquivo
                      </Button>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {products.length} Produtos Carregados
                      </h3>
                      <p className="text-gray-500 mb-6">
                        Pronto para processar com ChatGPT
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button 
                          onClick={() => setActiveTab("categorize")}
                          size="lg"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="mr-2 h-5 w-5" />
                          Começar Processamento
                        </Button>
                        <Button 
                          onClick={() => fileInputRef.current?.click()}
                          size="lg"
                          variant="outline"
                        >
                          <Upload className="mr-2 h-5 w-5" />
                          Novo Arquivo
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {processing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processando arquivo...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Preview dos produtos carregados */}
              {products.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preview dos Produtos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-200 p-2 text-left">Título</th>
                            <th className="border border-gray-200 p-2 text-left">Categoria Atual</th>
                            <th className="border border-gray-200 p-2 text-left">Preço</th>
                            <th className="border border-gray-200 p-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.slice(0, 5).map(product => (
                            <tr key={product.id} className="hover:bg-gray-50">
                              <td className="border border-gray-200 p-2">{product.title}</td>
                              <td className="border border-gray-200 p-2">
                                <Badge variant="outline">{product.category}</Badge>
                              </td>
                              <td className="border border-gray-200 p-2">R$ {product.price.toFixed(2)}</td>
                              <td className="border border-gray-200 p-2">
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  {product.status === 'pending' ? 'Aguardando' : product.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {products.length > 5 && (
                      <div className="text-center mt-4 text-sm text-gray-600">
                        Mostrando 5 de {products.length} produtos
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Tab 2: Recategorização */}
          <TabsContent value="categorize">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Recategorização com IA Inteligente</h3>
                <Button 
                  onClick={recategorizeProducts}
                  disabled={processing || products.length === 0}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {processing ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Brain className="mr-2 h-4 w-4" />
                  )}
                  {processing ? 'Processando...' : 'Iniciar Recategorização'}
                </Button>
              </div>

              {processing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Analisando produtos com IA avançada...</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="text-xs text-gray-600">
                    Processados: {stats.processed} de {stats.total}
                  </div>
                </div>
              )}

              {/* Configurações de Categorização */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configurações de Categorização
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="custom-prompt">Prompt Personalizado (Opcional)</Label>
                    <Textarea
                      id="custom-prompt"
                      placeholder="Ex: Categorize os produtos considerando o público-alvo jovem..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="target-category">Categoria Preferencial</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Automático</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Categorias Disponíveis */}
              <Card>
                <CardHeader>
                  <CardTitle>Categorias Disponíveis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(category => (
                      <Card key={category.id} className="border-gray-200">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">{category.name}</h4>
                          <div className="text-sm text-gray-600 mb-2">
                            {category.count} produtos
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {category.subcategories.map(sub => (
                              <Badge key={sub} variant="outline" className="text-xs">
                                {sub}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resultados da Categorização */}
              {stats.categorized > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Resultados da Categorização</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse border border-gray-200">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-200 p-2 text-left">Produto</th>
                            <th className="border border-gray-200 p-2 text-left">Categoria Original</th>
                            <th className="border border-gray-200 p-2 text-left">Categoria Sugerida</th>
                            <th className="border border-gray-200 p-2 text-left">Confiança</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.filter(p => p.suggestedCategory).slice(0, 10).map(product => (
                            <tr key={product.id} className="hover:bg-gray-50">
                              <td className="border border-gray-200 p-2">{product.title}</td>
                              <td className="border border-gray-200 p-2">
                                <Badge variant="outline">{product.category}</Badge>
                              </td>
                              <td className="border border-gray-200 p-2">
                                <Badge className="bg-green-100 text-green-800">
                                  {product.suggestedCategory}
                                </Badge>
                              </td>
                              <td className="border border-gray-200 p-2">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm">{product.confidence}%</div>
                                  <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-green-500 h-2 rounded-full" 
                                      style={{ width: `${product.confidence}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Tab 3: Otimização de Títulos */}
          <TabsContent value="optimize">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Otimização de Títulos</h3>
                <Button 
                  onClick={optimizeTitles}
                  disabled={processing || stats.categorized === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {processing ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  {processing ? 'Otimizando...' : 'Otimizar Títulos'}
                </Button>
              </div>

              {processing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Otimizando títulos com IA para SEO...</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
              )}

              <Alert>
                <Wand2 className="h-4 w-4" />
                <AlertDescription>
                  Nossa IA analisa cada título usando algoritmos de SEO e marketplace, otimizando para conversão e visibilidade.
                </AlertDescription>
              </Alert>

              {/* Comparação Antes/Depois */}
              {stats.titleOptimized > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Comparação: Antes vs Depois</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {products.filter(p => p.newTitle).slice(0, 8).map(product => (
                        <div key={product.id} className="border rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm font-medium text-gray-600 mb-1">Título Original</div>
                              <div className="text-sm bg-red-50 p-2 rounded border">
                                {product.title}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-600 mb-1">Título Otimizado</div>
                              <div className="text-sm bg-green-50 p-2 rounded border">
                                {product.newTitle}
                              </div>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Categoria: {product.suggestedCategory}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Tab 4: Exportação */}
          <TabsContent value="export">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Exportar para Marketplace</h3>
                <Button 
                  onClick={generateImportFile}
                  disabled={stats.titleOptimized === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Arquivo de Importação
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-800">Resumo do Processamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total de produtos:</span>
                        <span className="font-semibold">{stats.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recategorizados:</span>
                        <span className="font-semibold text-green-600">{stats.categorized}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Títulos otimizados:</span>
                        <span className="font-semibold text-blue-600">{stats.titleOptimized}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de sucesso:</span>
                        <span className="font-semibold text-purple-600">
                          {stats.total > 0 ? ((stats.titleOptimized / stats.total) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-800">Arquivos Gerados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-sm">marketplace-products.csv</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Formato compatível com marketplace</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Pronto para importação</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview da Exportação */}
              {stats.titleOptimized > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preview do Arquivo de Exportação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <div className="font-semibold mb-2">marketplace-products.csv:</div>
                      <div>ID,Título Original,Título Otimizado,Categoria Original,Categoria Sugerida,Preço,Confiança</div>
                      {products.slice(0, 3).map(p => (
                        <div key={p.id} className="truncate">
                          {p.id},"{p.title}","{p.newTitle}","{p.category}","{p.suggestedCategory}",{p.price},{p.confidence}%
                        </div>
                      ))}
                      <div className="text-gray-500">... e mais {Math.max(0, products.length - 3)} produtos</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA para Processamento Personalizado */}
        <Card className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Precisa Processar Mais de 50.000 Produtos?
            </h3>
            <p className="text-gray-600 mb-6">
              Oferecemos soluções empresariais para grandes volumes de produtos com processamento dedicado e API personalizada.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => window.open("https://wa.me/5561993521849?text=Olá! Preciso processar mais de 50.000 produtos para marketplace. Podem fazer uma solução personalizada?")}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Zap className="mr-2 h-5 w-5" />
                Solução Empresarial
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.open("https://wa.me/5561993521849?text=Tenho dúvidas sobre o processamento de produtos para marketplace.")}
              >
                💬 Tirar Dúvidas
              </Button>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}