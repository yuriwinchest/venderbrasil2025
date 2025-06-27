import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import AIInsightsGenerator from "./ai-insights-generator";
import AdvancedAnalyticsDashboard from "./advanced-analytics-dashboard";
import GoogleSheetsLookerIntegration from "./google-sheets-looker-integration";
import MarketplaceProductProcessor from "./marketplace-product-processor";
import AdvancedMarketplaceTools from "./advanced-marketplace-tools";
import { trackEvent } from "./analytics-tracker-simple";
import { 
  Upload, 
  FileText, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Download,
  Trash2,
  Edit,
  Eye,
  Zap,
  Database,
  FileSpreadsheet,
  FileJson,
  Brain,
  ShoppingCart,
  Settings
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart as RechartsPieChart,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area
} from "recharts";

interface DataFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: any[];
  columns: string[];
  uploadedAt: Date;
}

interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  xAxis: string;
  yAxis: string[];
  color: string;
}

export default function DataAnalyzer() {
  const [files, setFiles] = useState<DataFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [showGoogleIntegration, setShowGoogleIntegration] = useState(false);
  const [showMarketplaceProcessor, setShowMarketplaceProcessor] = useState(false);
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rastrear acesso ao analisador de dados
  useEffect(() => {
    trackEvent('data_analyzer_access');
  }, []);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simular progresso de upload
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      let data: any[] = [];
      let columns: string[] = [];

      if (file.type === 'application/json') {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        data = Array.isArray(jsonData) ? jsonData : [jsonData];
        columns = data.length > 0 ? Object.keys(data[0]) : [];
      } else if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          columns = lines[0].split(',').map(col => col.trim().replace(/"/g, ''));
          data = lines.slice(1).map(line => {
            const values = line.split(',').map(val => val.trim().replace(/"/g, ''));
            const obj: any = {};
            columns.forEach((col, index) => {
              const value = values[index];
              obj[col] = isNaN(Number(value)) ? value : Number(value);
            });
            return obj;
          });
        }
      } else {
        // Para outros formatos, criar dados de exemplo
        data = [
          { nome: 'Janeiro', vendas: 4000, gastos: 2400, lucro: 1600 },
          { nome: 'Fevereiro', vendas: 3000, gastos: 1398, lucro: 1602 },
          { nome: 'Março', vendas: 2000, gastos: 9800, lucro: -7800 },
          { nome: 'Abril', vendas: 2780, gastos: 3908, lucro: -1128 },
          { nome: 'Maio', vendas: 1890, gastos: 4800, lucro: -2910 },
          { nome: 'Junho', vendas: 2390, gastos: 3800, lucro: -1410 }
        ];
        columns = ['nome', 'vendas', 'gastos', 'lucro'];
      }

      const newFile: DataFile = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        data,
        columns,
        uploadedAt: new Date()
      };

      setFiles(prev => [...prev, newFile]);
      setSelectedFile(newFile.id);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Erro ao processar arquivo. Verifique o formato.');
    }

    clearInterval(progressInterval);
  };

  const createChart = (type: ChartConfig['type']) => {
    const file = files.find(f => f.id === selectedFile);
    if (!file) return;

    const numericColumns = file.columns.filter(col => {
      return file.data.some(row => typeof row[col] === 'number');
    });

    if (numericColumns.length === 0) {
      alert('Arquivo não possui colunas numéricas para gráficos');
      return;
    }

    const newChart: ChartConfig = {
      id: Date.now().toString(),
      type,
      title: `${type.toUpperCase()} - ${file.name}`,
      xAxis: file.columns[0],
      yAxis: numericColumns.slice(0, 3),
      color: COLORS[charts.length % COLORS.length]
    };

    setCharts(prev => [...prev, newChart]);
  };

  const removeChart = (chartId: string) => {
    setCharts(prev => prev.filter(c => c.id !== chartId));
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setCharts(prev => prev.filter(c => {
      const file = files.find(f => f.id === selectedFile);
      return file?.id !== fileId;
    }));
    if (selectedFile === fileId) {
      setSelectedFile("");
    }
  };

  const renderChart = (chart: ChartConfig) => {
    const file = files.find(f => f.id === selectedFile);
    if (!file) return null;

    const chartData = file.data;

    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              {chart.yAxis.map((axis, index) => (
                <Bar 
                  key={axis} 
                  dataKey={axis} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              {chart.yAxis.map((axis, index) => (
                <Line 
                  key={axis}
                  type="monotone" 
                  dataKey={axis} 
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              {chart.yAxis.map((axis, index) => (
                <Area 
                  key={axis}
                  type="monotone" 
                  dataKey={axis} 
                  stackId="1"
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = chartData.map(item => ({
          name: item[chart.xAxis],
          value: item[chart.yAxis[0]]
        })).filter(item => typeof item.value === 'number');

        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Tooltip />
              <Legend />
              <RechartsPieChart dataKey="value" data={pieData} cx="50%" cy="50%" outerRadius={80}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </RechartsPieChart>
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const generateReport = () => {
    const file = files.find(f => f.id === selectedFile);
    if (!file) return;

    const report = {
      fileName: file.name,
      uploadDate: file.uploadedAt,
      totalRows: file.data.length,
      columns: file.columns,
      charts: charts.length,
      summary: {
        numericColumns: file.columns.filter(col => 
          file.data.some(row => typeof row[col] === 'number')
        ).length,
        textColumns: file.columns.filter(col => 
          file.data.some(row => typeof row[col] === 'string')
        ).length
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${file.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInsightSelect = (insight: any) => {
    // Create chart based on insight
    if (insight.type === 'trend' || insight.type === 'correlation') {
      const file = files.find(f => f.id === selectedFile);
      if (file && insight.data) {
        const chartType = insight.type === 'trend' ? 'line' : 'bar';
        createChart(chartType);
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <Database className="inline mr-3 h-8 w-8 text-purple-600" />
            Analisador de Dados com IA
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            📂 Anexe seus arquivos Excel, CSV ou JSON e veja gráficos profissionais sendo criados automaticamente
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge className="bg-blue-100 text-blue-800 text-sm px-4 py-2">
              📊 Gráficos Automáticos
            </Badge>
            <Badge className="bg-green-100 text-green-800 text-sm px-4 py-2">
              🤖 Análise com IA
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 text-sm px-4 py-2">
              ⚡ Resultados Instantâneos
            </Badge>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Upload Section */}
          <Card className="mb-8 shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-6 w-6" />
                Upload de Arquivos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.xlsx,.xls,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex-shrink-0"
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Selecionar Arquivo
                </Button>
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary"><FileSpreadsheet className="h-3 w-3 mr-1" />CSV</Badge>
                  <Badge variant="secondary"><FileJson className="h-3 w-3 mr-1" />JSON</Badge>
                  <Badge variant="secondary"><FileText className="h-3 w-3 mr-1" />Excel</Badge>
                  <Badge variant="secondary"><FileText className="h-3 w-3 mr-1" />PDF</Badge>
                </div>
              </div>

              {isUploading && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Processando arquivo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Arquivos Carregados */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Arquivos Carregados:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {files.map(file => (
                      <Card 
                        key={file.id}
                        className={`cursor-pointer transition-all hover:scale-105 ${
                          selectedFile === file.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                        }`}
                        onClick={() => setSelectedFile(file.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm truncate">{file.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(file.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-xs text-gray-600">
                            <div>{file.data.length} linhas</div>
                            <div>{file.columns.length} colunas</div>
                            <div>{(file.size / 1024).toFixed(1)} KB</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart Creation */}
          {selectedFile && (
            <Card className="mb-8 shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  Criar Gráficos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-3 mb-4">
                  <Button onClick={() => createChart('bar')} variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Gráfico de Barras
                  </Button>
                  <Button onClick={() => createChart('line')} variant="outline">
                    <LineChart className="mr-2 h-4 w-4" />
                    Gráfico de Linhas
                  </Button>
                  <Button onClick={() => createChart('pie')} variant="outline">
                    <PieChart className="mr-2 h-4 w-4" />
                    Gráfico de Pizza
                  </Button>
                  <Button onClick={() => createChart('area')} variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Gráfico de Área
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={generateReport} className="bg-green-600 hover:bg-green-700">
                    <Download className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </Button>
                  <Button 
                    onClick={() => setShowAIInsights(!showAIInsights)}
                    variant={showAIInsights ? "default" : "outline"}
                    className={showAIInsights ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    {showAIInsights ? 'Ocultar' : 'Mostrar'} Insights IA
                  </Button>
                  <Button 
                    onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
                    variant={showAdvancedAnalytics ? "default" : "outline"}
                    className={showAdvancedAnalytics ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {showAdvancedAnalytics ? 'Ocultar' : 'Mostrar'} Analytics Avançado
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowGoogleIntegration(!showGoogleIntegration);
                      trackEvent('google_sheets_toggle', '/analisar-dados');
                    }}
                    variant={showGoogleIntegration ? "default" : "outline"}
                    className={showGoogleIntegration ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    {showGoogleIntegration ? 'Ocultar' : 'Mostrar'} Google Sheets + Looker
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowMarketplaceProcessor(!showMarketplaceProcessor);
                      trackEvent('marketplace_processor_toggle', '/analisar-dados');
                    }}
                    variant={showMarketplaceProcessor ? "default" : "outline"}
                    className={showMarketplaceProcessor ? "bg-orange-600 hover:bg-orange-700" : ""}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {showMarketplaceProcessor ? 'Ocultar' : 'Mostrar'} Processador Marketplace
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowAdvancedTools(!showAdvancedTools);
                      trackEvent('advanced_tools_toggle', '/analisar-dados');
                    }}
                    variant={showAdvancedTools ? "default" : "outline"}
                    className={showAdvancedTools ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    {showAdvancedTools ? 'Ocultar' : 'Mostrar'} Ferramentas Avançadas
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.open(`https://wa.me/5561993521849?text=Olá! Gerei gráficos incríveis com o analisador de dados. Quero um sistema personalizado!`)}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Quero Sistema Personalizado
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Insights */}
          {selectedFile && showAIInsights && (
            <div className="mb-8">
              <AIInsightsGenerator 
                selectedFile={files.find(f => f.id === selectedFile) || null}
                onInsightSelect={handleInsightSelect}
              />
            </div>
          )}

          {/* Advanced Analytics Dashboard */}
          {selectedFile && showAdvancedAnalytics && (
            <div className="mb-8">
              <AdvancedAnalyticsDashboard 
                data={files.find(f => f.id === selectedFile)?.data || []}
                columns={files.find(f => f.id === selectedFile)?.columns || []}
                fileName={files.find(f => f.id === selectedFile)?.name || ""}
              />
            </div>
          )}

          {/* Google Sheets + Looker Integration */}
          {showGoogleIntegration && (
            <div className="mb-8">
              <GoogleSheetsLookerIntegration />
            </div>
          )}

          {/* Marketplace Product Processor */}
          {showMarketplaceProcessor && (
            <div className="mb-8">
              <MarketplaceProductProcessor />
            </div>
          )}

          {/* Advanced Marketplace Tools */}
          {showAdvancedTools && (
            <div className="mb-8">
              <AdvancedMarketplaceTools />
            </div>
          )}

          {/* Charts Display */}
          {charts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {charts.map(chart => (
                <Card key={chart.id} className="shadow-xl border-0">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{chart.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChart(chart.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderChart(chart)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* CTA Final */}
          {files.length === 0 && (
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-8 text-center">
                <Database className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Comece a Analisar Seus Dados
                </h3>
                <p className="text-gray-600 mb-6">
                  Faça upload de qualquer arquivo e transforme dados em insights visuais
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Fazer Upload do Primeiro Arquivo
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}