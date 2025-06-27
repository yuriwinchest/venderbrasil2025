import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  FileSpreadsheet, 
  BarChart3, 
  Link as LinkIcon, 
  Eye, 
  Download,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Database,
  Zap,
  Settings,
  Play
} from "lucide-react";

interface GoogleSheetsData {
  id: string;
  name: string;
  url: string;
  data: any[];
  columns: string[];
  lastSync: Date;
  status: 'connected' | 'syncing' | 'error';
}

interface LookerDashboard {
  id: string;
  name: string;
  url: string;
  charts: number;
  createdAt: Date;
  status: 'creating' | 'ready' | 'error';
}

export default function GoogleSheetsLookerIntegration() {
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [connectedSheets, setConnectedSheets] = useState<GoogleSheetsData[]>([]);
  const [lookerDashboards, setLookerDashboards] = useState<LookerDashboard[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCreatingDashboard, setIsCreatingDashboard] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [activeTab, setActiveTab] = useState("connect");

  // Conectar com Google Sheets
  const connectGoogleSheets = async () => {
    if (!sheetsUrl.trim()) return;

    setIsConnecting(true);
    setConnectionProgress(0);

    // Simular processo de conexão
    const steps = [
      "Validando URL do Google Sheets...",
      "Autenticando com Google API...",
      "Extraindo dados da planilha...",
      "Processando colunas e tipos...",
      "Finalizando conexão..."
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setConnectionProgress((i + 1) * 20);
    }

    // Simular dados extraídos
    const newSheet: GoogleSheetsData = {
      id: `sheet-${Date.now()}`,
      name: extractSheetName(sheetsUrl),
      url: sheetsUrl,
      data: generateSampleData(),
      columns: ["Data", "Vendas", "Região", "Produto", "Valor", "Cliente"],
      lastSync: new Date(),
      status: 'connected'
    };

    setConnectedSheets(prev => [...prev, newSheet]);
    setSheetsUrl("");
    setIsConnecting(false);
    setConnectionProgress(100);
  };

  // Criar dashboard no Looker
  const createLookerDashboard = async (sheetId: string) => {
    const sheet = connectedSheets.find(s => s.id === sheetId);
    if (!sheet) return;

    setIsCreatingDashboard(true);

    // Simular criação do dashboard
    await new Promise(resolve => setTimeout(resolve, 3000));

    const newDashboard: LookerDashboard = {
      id: `dashboard-${Date.now()}`,
      name: `Dashboard - ${sheet.name}`,
      url: `https://looker.company.com/dashboards/${Date.now()}`,
      charts: Math.floor(Math.random() * 8) + 3,
      createdAt: new Date(),
      status: 'ready'
    };

    setLookerDashboards(prev => [...prev, newDashboard]);
    setIsCreatingDashboard(false);
  };

  // Funções auxiliares
  const extractSheetName = (url: string) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? `Planilha ${match[1].substring(0, 8)}` : "Planilha do Google";
  };

  const generateSampleData = () => {
    const regioes = ["Norte", "Sul", "Sudeste", "Nordeste"];
    const produtos = ["Produto A", "Produto B", "Produto C", "Produto D"];
    const clientes = ["Cliente Alpha", "Cliente Beta", "Cliente Gamma", "Cliente Delta"];
    
    return Array.from({ length: 50 }, (_, i) => ({
      Data: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
      Vendas: Math.floor(Math.random() * 1000) + 100,
      Região: regioes[Math.floor(Math.random() * regioes.length)],
      Produto: produtos[Math.floor(Math.random() * produtos.length)],
      Valor: (Math.random() * 5000 + 500).toFixed(2),
      Cliente: clientes[Math.floor(Math.random() * clientes.length)]
    }));
  };

  const syncSheet = async (sheetId: string) => {
    setConnectedSheets(prev => 
      prev.map(sheet => 
        sheet.id === sheetId 
          ? { ...sheet, status: 'syncing' as const }
          : sheet
      )
    );

    await new Promise(resolve => setTimeout(resolve, 2000));

    setConnectedSheets(prev => 
      prev.map(sheet => 
        sheet.id === sheetId 
          ? { ...sheet, status: 'connected' as const, lastSync: new Date() }
          : sheet
      )
    );
  };

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6" />
          Google Sheets + Looker Integration
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full mb-6">
            <TabsTrigger value="connect">Conectar Sheets</TabsTrigger>
            <TabsTrigger value="analyze">Análise de Dados</TabsTrigger>
            <TabsTrigger value="dashboards">Dashboards Looker</TabsTrigger>
          </TabsList>

          {/* Tab: Conectar Google Sheets */}
          <TabsContent value="connect">
            <div className="space-y-6">
              <Alert>
                <FileSpreadsheet className="h-4 w-4" />
                <AlertDescription>
                  Cole a URL da sua planilha do Google Sheets para conectar e analisar os dados
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Label htmlFor="sheets-url">URL do Google Sheets</Label>
                <div className="flex gap-3">
                  <Input
                    id="sheets-url"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    value={sheetsUrl}
                    onChange={(e) => setSheetsUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={connectGoogleSheets}
                    disabled={isConnecting || !sheetsUrl.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isConnecting ? (
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LinkIcon className="mr-2 h-4 w-4" />
                    )}
                    {isConnecting ? 'Conectando...' : 'Conectar'}
                  </Button>
                </div>
              </div>

              {isConnecting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Conectando com Google Sheets...</span>
                    <span>{connectionProgress}%</span>
                  </div>
                  <Progress value={connectionProgress} className="h-2" />
                </div>
              )}

              {/* Planilhas Conectadas */}
              {connectedSheets.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Planilhas Conectadas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {connectedSheets.map(sheet => (
                      <Card key={sheet.id} className="border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{sheet.name}</h4>
                              <p className="text-sm text-gray-600">
                                {sheet.data.length} linhas • {sheet.columns.length} colunas
                              </p>
                            </div>
                            <Badge 
                              className={
                                sheet.status === 'connected' ? 'bg-green-100 text-green-800' :
                                sheet.status === 'syncing' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }
                            >
                              {sheet.status === 'connected' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {sheet.status === 'syncing' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                              {sheet.status === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                              {sheet.status === 'connected' ? 'Conectado' : 
                               sheet.status === 'syncing' ? 'Sincronizando' : 'Erro'}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {sheet.columns.slice(0, 3).map(col => (
                              <Badge key={col} variant="outline" className="text-xs">
                                {col}
                              </Badge>
                            ))}
                            {sheet.columns.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{sheet.columns.length - 3} mais
                              </Badge>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => syncSheet(sheet.id)}
                              disabled={sheet.status === 'syncing'}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Sync
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedSheet(sheet.id);
                                setActiveTab("analyze");
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Analisar
                            </Button>
                          </div>

                          <div className="text-xs text-gray-500 mt-2">
                            Última sincronização: {sheet.lastSync.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab: Análise de Dados */}
          <TabsContent value="analyze">
            {selectedSheet ? (
              <div className="space-y-6">
                {(() => {
                  const sheet = connectedSheets.find(s => s.id === selectedSheet);
                  if (!sheet) return null;

                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Análise: {sheet.name}</h3>
                        <Button 
                          onClick={() => createLookerDashboard(sheet.id)}
                          disabled={isCreatingDashboard}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isCreatingDashboard ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <BarChart3 className="mr-2 h-4 w-4" />
                          )}
                          {isCreatingDashboard ? 'Criando Dashboard...' : 'Criar Dashboard Looker'}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="p-4 text-center">
                            <Database className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-blue-800">{sheet.data.length}</div>
                            <div className="text-sm text-blue-600">Total de Registros</div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-green-50 border-green-200">
                          <CardContent className="p-4 text-center">
                            <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-green-800">{sheet.columns.length}</div>
                            <div className="text-sm text-green-600">Colunas</div>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-purple-50 border-purple-200">
                          <CardContent className="p-4 text-center">
                            <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                            <div className="text-2xl font-bold text-purple-800">98%</div>
                            <div className="text-sm text-purple-600">Qualidade dos Dados</div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle>Preview dos Dados</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse border border-gray-200">
                              <thead>
                                <tr className="bg-gray-50">
                                  {sheet.columns.map(col => (
                                    <th key={col} className="border border-gray-200 p-2 text-left text-sm font-medium">
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {sheet.data.slice(0, 5).map((row, index) => (
                                  <tr key={index} className="hover:bg-gray-50">
                                    {sheet.columns.map(col => (
                                      <td key={col} className="border border-gray-200 p-2 text-sm">
                                        {row[col]}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {sheet.data.length > 5 && (
                            <div className="text-center mt-4 text-sm text-gray-600">
                              Mostrando 5 de {sheet.data.length} registros
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Insights Automáticos</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="font-medium text-blue-800">Tendência de Vendas</div>
                                <div className="text-sm text-blue-600">Crescimento de 23% nos últimos 3 meses</div>
                              </div>
                              <div className="p-3 bg-green-50 rounded-lg">
                                <div className="font-medium text-green-800">Região Top</div>
                                <div className="text-sm text-green-600">Sudeste representa 45% das vendas</div>
                              </div>
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <div className="font-medium text-purple-800">Produto Estrela</div>
                                <div className="text-sm text-purple-600">Produto A lidera com 38% das vendas</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Ações Recomendadas</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div>
                                  <div className="font-medium">Expandir no Nordeste</div>
                                  <div className="text-sm text-gray-600">Potencial de crescimento de 35%</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div>
                                  <div className="font-medium">Investir em Produto A</div>
                                  <div className="text-sm text-gray-600">Margem alta e demanda crescente</div>
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                <div>
                                  <div className="font-medium">Otimizar Cliente Beta</div>
                                  <div className="text-sm text-gray-600">Aumentar frequência de compras</div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileSpreadsheet className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Selecione uma planilha para analisar
                </h3>
                <p className="text-gray-500">
                  Conecte uma planilha do Google Sheets primeiro
                </p>
              </div>
            )}
          </TabsContent>

          {/* Tab: Dashboards Looker */}
          <TabsContent value="dashboards">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Dashboards do Looker</h3>
                <Badge className="bg-blue-100 text-blue-800">
                  {lookerDashboards.length} dashboards criados
                </Badge>
              </div>

              {lookerDashboards.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-300">
                  <CardContent className="p-12 text-center">
                    <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      Nenhum dashboard criado ainda
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Conecte uma planilha e crie seu primeiro dashboard no Looker
                    </p>
                    <Button 
                      onClick={() => setActiveTab("connect")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Conectar Google Sheets
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {lookerDashboards.map(dashboard => (
                    <Card key={dashboard.id} className="border-blue-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-lg">{dashboard.name}</h4>
                            <p className="text-sm text-gray-600">
                              {dashboard.charts} gráficos • Criado em {dashboard.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                          <Badge 
                            className={
                              dashboard.status === 'ready' ? 'bg-green-100 text-green-800' :
                              dashboard.status === 'creating' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {dashboard.status === 'ready' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {dashboard.status === 'creating' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                            {dashboard.status === 'ready' ? 'Pronto' : 
                             dashboard.status === 'creating' ? 'Criando' : 'Erro'}
                          </Badge>
                        </div>

                        <div className="bg-gray-100 rounded-lg p-4 mb-4">
                          <div className="text-sm text-gray-600 mb-2">Preview do Dashboard:</div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white p-2 rounded text-xs text-center">Gráfico de Vendas</div>
                            <div className="bg-white p-2 rounded text-xs text-center">Análise Regional</div>
                            <div className="bg-white p-2 rounded text-xs text-center">Top Produtos</div>
                            <div className="bg-white p-2 rounded text-xs text-center">Métricas KPI</div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => window.open(dashboard.url, '_blank')}
                            disabled={dashboard.status !== 'ready'}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Abrir Looker
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-3 w-3 mr-1" />
                            Configurar
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            Exportar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Final */}
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Quer uma Solução Personalizada?
            </h3>
            <p className="text-gray-600 mb-6">
              Precisa de integração avançada com Google Sheets e Looker? 
              Criamos soluções sob medida para sua empresa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => window.open("https://wa.me/5561993521849?text=Olá! Quero uma solução personalizada de Google Sheets + Looker para minha empresa.")}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="mr-2 h-5 w-5" />
                Solicitar Orçamento Personalizado
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.open("https://wa.me/5561993521849?text=Tenho dúvidas sobre a integração Google Sheets + Looker. Podem me ajudar?")}
              >
                💬 Tirar Dúvidas no WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}