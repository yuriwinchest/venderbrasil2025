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
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Zap, 
  Brain,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Target,
  BarChart3,
  Filter,
  Wand2,
  Layers,
  Clock,
  Shield,
  FileText,
  Download,
  Upload
} from "lucide-react";

interface MarketplaceConfig {
  platform: string;
  language: string;
  currency: string;
  region: string;
  targetAudience: string;
  competitionLevel: string;
}

interface ProcessingPipeline {
  stage: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  timeEstimate: string;
  results?: any;
}

export default function AdvancedMarketplaceTools() {
  const [activeTab, setActiveTab] = useState("optimization");
  const [config, setConfig] = useState<MarketplaceConfig>({
    platform: "mercadolivre",
    language: "pt-BR",
    currency: "BRL",
    region: "brasil",
    targetAudience: "geral",
    competitionLevel: "alto"
  });
  const [pipeline, setPipeline] = useState<ProcessingPipeline[]>([
    { stage: "Validação de dados", status: 'pending', progress: 0, timeEstimate: "30s" },
    { stage: "Análise de categoria", status: 'pending', progress: 0, timeEstimate: "2min" },
    { stage: "Otimização de títulos", status: 'pending', progress: 0, timeEstimate: "3min" },
    { stage: "Verificação SEO", status: 'pending', progress: 0, timeEstimate: "1min" },
    { stage: "Compatibilidade de mercado", status: 'pending', progress: 0, timeEstimate: "1min" },
    { stage: "Geração de arquivo", status: 'pending', progress: 0, timeEstimate: "30s" }
  ]);
  const [realTimeCompatibility, setRealTimeCompatibility] = useState(true);
  const [intelligentCategories, setIntelligentCategories] = useState(true);
  const [seoOptimization, setSeoOptimization] = useState(true);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [processing, setProcessing] = useState(false);

  const marketplaces = [
    { id: "mercadolivre", name: "Mercado Livre", icon: "🛒", rules: ["Título máx 60 chars", "Até 6 fotos", "Descrição HTML"] },
    { id: "shopee", name: "Shopee", icon: "🛍️", rules: ["Título máx 120 chars", "Até 9 fotos", "Tags obrigatórias"] },
    { id: "amazon", name: "Amazon", icon: "📦", rules: ["Título máx 200 chars", "Bullets points", "A+ Content"] },
    { id: "magalu", name: "Magazine Luiza", icon: "🏪", rules: ["Título máx 100 chars", "Até 10 fotos", "Vídeo opcional"] },
    { id: "americanas", name: "Americanas", icon: "🏢", rules: ["Título máx 80 chars", "Até 8 fotos", "Ficha técnica"] }
  ];

  const startPipeline = async () => {
    setProcessing(true);
    
    for (let i = 0; i < pipeline.length; i++) {
      // Atualizar status para processando
      setPipeline(prev => prev.map((stage, index) => 
        index === i ? { ...stage, status: 'processing', progress: 0 } : stage
      ));

      // Simular processamento com progresso
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setPipeline(prev => prev.map((stage, index) => 
          index === i ? { ...stage, progress } : stage
        ));
      }

      // Marcar como concluído
      setPipeline(prev => prev.map((stage, index) => 
        index === i ? { ...stage, status: 'completed', progress: 100 } : stage
      ));
    }

    setProcessing(false);
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Ferramentas Avançadas de Marketplace
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full mb-6">
            <TabsTrigger value="optimization">Otimização Avançada</TabsTrigger>
            <TabsTrigger value="pipeline">Pipeline de Lotes</TabsTrigger>
            <TabsTrigger value="intelligence">IA Dinâmica</TabsTrigger>
            <TabsTrigger value="seo">SEO Inteligente</TabsTrigger>
            <TabsTrigger value="compatibility">Compatibilidade</TabsTrigger>
          </TabsList>

          {/* Tab 1: Ferramenta de Otimização Avançada */}
          <TabsContent value="optimization">
            <div className="space-y-6">
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  Ferramenta de otimização de produto de mercado avançada com IA
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Configurações de Mercado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="platform">Plataforma</Label>
                      <Select value={config.platform} onValueChange={(value) => setConfig(prev => ({ ...prev, platform: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {marketplaces.map(marketplace => (
                            <SelectItem key={marketplace.id} value={marketplace.id}>
                              {marketplace.icon} {marketplace.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="region">Região de Mercado</Label>
                      <Select value={config.region} onValueChange={(value) => setConfig(prev => ({ ...prev, region: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brasil">🇧🇷 Brasil</SelectItem>
                          <SelectItem value="argentina">🇦🇷 Argentina</SelectItem>
                          <SelectItem value="mexico">🇲🇽 México</SelectItem>
                          <SelectItem value="chile">🇨🇱 Chile</SelectItem>
                          <SelectItem value="colombia">🇨🇴 Colômbia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="audience">Público-Alvo</Label>
                      <Select value={config.targetAudience} onValueChange={(value) => setConfig(prev => ({ ...prev, targetAudience: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="geral">👥 Público Geral</SelectItem>
                          <SelectItem value="jovem">🧒 Jovem (18-25)</SelectItem>
                          <SelectItem value="adulto">👨 Adulto (26-45)</SelectItem>
                          <SelectItem value="senior">👴 Senior (46+)</SelectItem>
                          <SelectItem value="premium">💎 Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="competition">Nível de Competição</Label>
                      <Select value={config.competitionLevel} onValueChange={(value) => setConfig(prev => ({ ...prev, competitionLevel: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixo">🟢 Baixo</SelectItem>
                          <SelectItem value="medio">🟡 Médio</SelectItem>
                          <SelectItem value="alto">🔴 Alto</SelectItem>
                          <SelectItem value="extremo">⚫ Extremo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configurações Avançadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="realtime">Compatibilidade em Tempo Real</Label>
                      <Switch 
                        checked={realTimeCompatibility} 
                        onCheckedChange={setRealTimeCompatibility}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="categories">IA Dinâmica de Categorias</Label>
                      <Switch 
                        checked={intelligentCategories} 
                        onCheckedChange={setIntelligentCategories}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="seo">Otimização SEO Inteligente</Label>
                      <Switch 
                        checked={seoOptimization} 
                        onCheckedChange={setSeoOptimization}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="batch">Processamento em Lotes</Label>
                      <Switch 
                        checked={batchProcessing} 
                        onCheckedChange={setBatchProcessing}
                      />
                    </div>

                    <div className="pt-4">
                      <Label>Limites da Plataforma Selecionada:</Label>
                      <div className="mt-2 space-y-1">
                        {marketplaces.find(m => m.id === config.platform)?.rules.map((rule, index) => (
                          <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                            {rule}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button 
                onClick={startPipeline}
                disabled={processing}
                size="lg"
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {processing ? (
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-5 w-5" />
                )}
                {processing ? 'Processando...' : 'Iniciar Otimização Avançada'}
              </Button>
            </div>
          </TabsContent>

          {/* Tab 2: Pipeline de Processamento */}
          <TabsContent value="pipeline">
            <div className="space-y-6">
              <Alert>
                <Layers className="h-4 w-4" />
                <AlertDescription>
                  Pipeline de processamento de lote de produtos de marketplace
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {pipeline.map((stage, index) => (
                  <Card key={index} className={`border-l-4 ${
                    stage.status === 'completed' ? 'border-green-500 bg-green-50' :
                    stage.status === 'processing' ? 'border-blue-500 bg-blue-50' :
                    stage.status === 'error' ? 'border-red-500 bg-red-50' :
                    'border-gray-300'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          {stage.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {stage.status === 'processing' && <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />}
                          {stage.status === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                          {stage.status === 'pending' && <Clock className="h-5 w-5 text-gray-400" />}
                          
                          <h3 className="font-semibold">{stage.stage}</h3>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            stage.status === 'completed' ? 'default' :
                            stage.status === 'processing' ? 'secondary' :
                            stage.status === 'error' ? 'destructive' :
                            'outline'
                          }>
                            {stage.status === 'completed' ? 'Concluído' :
                             stage.status === 'processing' ? 'Processando' :
                             stage.status === 'error' ? 'Erro' :
                             'Aguardando'}
                          </Badge>
                          
                          <span className="text-sm text-gray-500">{stage.timeEstimate}</span>
                        </div>
                      </div>
                      
                      {stage.status === 'processing' && (
                        <Progress value={stage.progress} className="h-2" />
                      )}
                      
                      {stage.status === 'completed' && stage.progress === 100 && (
                        <div className="text-sm text-green-600 mt-2">
                          ✓ Etapa concluída com sucesso
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-800">
                      {pipeline.filter(s => s.status === 'completed').length}
                    </div>
                    <div className="text-sm text-blue-600">Etapas Concluídas</div>
                  </CardContent>
                </Card>

                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-800">
                      {pipeline.filter(s => s.status === 'processing').length}
                    </div>
                    <div className="text-sm text-yellow-600">Em Processamento</div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-gray-800">
                      {pipeline.filter(s => s.status === 'pending').length}
                    </div>
                    <div className="text-sm text-gray-600">Aguardando</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Inteligência Dinâmica */}
          <TabsContent value="intelligence">
            <div className="space-y-6">
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  Mecanismo de Inteligência Dinâmica da Categoria
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      IA de Categorização
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-800 mb-2">Análise Semântica</h4>
                        <p className="text-sm text-blue-600">
                          Analisa títulos e descrições usando processamento de linguagem natural
                        </p>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Aprendizado de Padrões</h4>
                        <p className="text-sm text-green-600">
                          Aprende com produtos similares e tendências de mercado
                        </p>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-semibold text-purple-800 mb-2">Categorização Contextual</h4>
                        <p className="text-sm text-purple-600">
                          Considera preço, marca e características específicas
                        </p>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-lg">
                        <h4 className="font-semibold text-orange-800 mb-2">Validação Automática</h4>
                        <p className="text-sm text-orange-600">
                          Verifica compatibilidade com regras do marketplace
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Análise de Tendências
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Eletrônicos</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
                          </div>
                          <span className="text-sm font-semibold">85%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Roupas & Moda</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '72%'}}></div>
                          </div>
                          <span className="text-sm font-semibold">72%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Casa & Jardim</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{width: '68%'}}></div>
                          </div>
                          <span className="text-sm font-semibold">68%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Esporte & Lazer</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{width: '61%'}}></div>
                          </div>
                          <span className="text-sm font-semibold">61%</span>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <h5 className="font-semibold text-yellow-800 mb-1">💡 Insight</h5>
                        <p className="text-sm text-yellow-700">
                          Eletrônicos têm 23% mais conversão quando categorizados corretamente
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab 4: SEO Inteligente */}
          <TabsContent value="seo">
            <div className="space-y-6">
              <Alert>
                <Wand2 className="h-4 w-4" />
                <AlertDescription>
                  Melhoramento de Título Inteligente e SEO
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wand2 className="h-5 w-5" />
                      Otimização de Títulos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="text-sm font-medium text-gray-600 mb-2">Título Original:</div>
                        <div className="text-sm bg-red-50 p-2 rounded">
                          Smartphone Samsung
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <div className="text-sm font-medium text-gray-600 mb-2">Título Otimizado:</div>
                        <div className="text-sm bg-green-50 p-2 rounded">
                          Smartphone Samsung Galaxy A54 128GB Original + Garantia Nacional - Oferta
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-gray-600">SEO Score:</div>
                          <div className="text-green-600 font-bold">92/100</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-600">Palavras-chave:</div>
                          <div className="text-blue-600 font-bold">8 encontradas</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Análise SEO
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Densidade de palavras-chave</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
                          </div>
                          <span className="text-sm font-semibold text-green-600">Ótimo</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tamanho do título</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{width: '75%'}}></div>
                          </div>
                          <span className="text-sm font-semibold text-blue-600">Bom</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Call-to-action</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{width: '88%'}}></div>
                          </div>
                          <span className="text-sm font-semibold text-purple-600">Ótimo</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm">Relevância de categoria</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{width: '95%'}}></div>
                          </div>
                          <span className="text-sm font-semibold text-orange-600">Excelente</span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <h5 className="font-semibold text-sm">Palavras-chave encontradas:</h5>
                        <div className="flex flex-wrap gap-1">
                          {["smartphone", "samsung", "galaxy", "128gb", "original", "garantia", "nacional", "oferta"].map(keyword => (
                            <Badge key={keyword} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tab 5: Verificador de Compatibilidade */}
          <TabsContent value="compatibility">
            <div className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Verificador de compatibilidade de mercado em tempo real
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Status de Compatibilidade
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {marketplaces.map(marketplace => (
                        <div key={marketplace.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{marketplace.icon}</span>
                            <div>
                              <div className="font-medium">{marketplace.name}</div>
                              <div className="text-sm text-gray-500">
                                {marketplace.id === config.platform ? 'Plataforma Ativa' : 'Verificação Disponível'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {marketplace.id === config.platform ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ativo
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                Verificar
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Regras de Validação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Título dentro do limite</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">✓</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Categoria válida</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">✓</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Preço formatado</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">✓</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">Descrição pode ser melhorada</span>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">!</Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Verificação em tempo real</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Auto</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Relatório de Compatibilidade
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">98%</div>
                      <div className="text-sm text-green-700">Compatibilidade Geral</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">11.247</div>
                      <div className="text-sm text-blue-700">Produtos Verificados</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">42</div>
                      <div className="text-sm text-purple-700">Correções Sugeridas</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">0.3s</div>
                      <div className="text-sm text-orange-700">Tempo Médio</div>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Baixar Relatório Completo (PDF)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Final */}
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Precisa de Processamento Empresarial?
            </h3>
            <p className="text-gray-600 mb-6">
              Oferecemos soluções personalizadas para grandes volumes e integrações específicas de marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => window.open("https://wa.me/5561993521849?text=Olá! Preciso de uma solução empresarial para processamento de marketplace.")}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Zap className="mr-2 h-5 w-5" />
                Solução Empresarial
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.open("https://wa.me/5561993521849?text=Tenho dúvidas sobre as ferramentas avançadas de marketplace.")}
              >
                💬 Consultoria Personalizada
              </Button>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}