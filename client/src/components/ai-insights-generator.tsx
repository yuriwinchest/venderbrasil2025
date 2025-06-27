import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  Target, 
  BarChart3,
  Zap,
  Eye,
  Download,
  RefreshCw,
  Sparkles,
  PieChart,
  LineChart
} from "lucide-react";

interface DataFile {
  id: string;
  name: string;
  data: any[];
  columns: string[];
}

interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'correlation' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  data?: any;
  suggestedAction?: string;
}

interface AIInsightsGeneratorProps {
  selectedFile: DataFile | null;
  onInsightSelect?: (insight: AIInsight) => void;
}

export default function AIInsightsGenerator({ selectedFile, onInsightSelect }: AIInsightsGeneratorProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("all");

  // Simulate AI analysis progress
  const generateInsights = async () => {
    if (!selectedFile) return;

    setIsGenerating(true);
    setProgress(0);
    setInsights([]);

    // Simulate analysis steps
    const steps = [
      "Analisando estrutura dos dados...",
      "Detectando padrões e tendências...",
      "Identificando anomalias...",
      "Calculando correlações...",
      "Gerando recomendações...",
      "Finalizando insights..."
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress((i + 1) * (100 / steps.length));
    }

    // Generate insights based on data analysis
    const generatedInsights = analyzeDataset(selectedFile);
    setInsights(generatedInsights);
    setIsGenerating(false);
  };

  // AI-powered data analysis logic
  const analyzeDataset = (file: DataFile): AIInsight[] => {
    const { data, columns } = file;
    const insights: AIInsight[] = [];

    // Find numeric columns
    const numericColumns = columns.filter(col => 
      data.some(row => typeof row[col] === 'number' && !isNaN(row[col]))
    );

    // Find categorical columns
    const categoricalColumns = columns.filter(col => 
      data.some(row => typeof row[col] === 'string')
    );

    // Trend Analysis
    if (numericColumns.length > 0) {
      const mainColumn = numericColumns[0];
      const values = data.map(row => row[mainColumn]).filter(val => typeof val === 'number');
      
      if (values.length > 2) {
        const trend = calculateTrend(values);
        insights.push({
          id: `trend-${mainColumn}`,
          type: 'trend',
          title: `Tendência em ${mainColumn}`,
          description: trend.direction === 'up' 
            ? `Crescimento consistente de ${trend.percentage.toFixed(1)}% detectado`
            : trend.direction === 'down'
            ? `Declínio de ${Math.abs(trend.percentage).toFixed(1)}% identificado`
            : 'Comportamento estável observado',
          confidence: trend.confidence,
          impact: trend.percentage > 20 ? 'high' : trend.percentage > 10 ? 'medium' : 'low',
          data: { column: mainColumn, trend: trend.direction, change: trend.percentage },
          suggestedAction: trend.direction === 'down' 
            ? 'Investigar causas do declínio e implementar ações corretivas'
            : 'Capitalizar na tendência positiva com investimentos estratégicos'
        });
      }
    }

    // Anomaly Detection
    if (numericColumns.length > 0) {
      numericColumns.forEach(col => {
        const anomalies = detectAnomalies(data, col);
        if (anomalies.length > 0) {
          insights.push({
            id: `anomaly-${col}`,
            type: 'anomaly',
            title: `Anomalias em ${col}`,
            description: `${anomalies.length} valores anômalos detectados`,
            confidence: 85,
            impact: anomalies.length > data.length * 0.1 ? 'high' : 'medium',
            data: { column: col, anomalies },
            suggestedAction: 'Verificar qualidade dos dados e investigar outliers'
          });
        }
      });
    }

    // Correlation Analysis
    if (numericColumns.length >= 2) {
      const correlations = findCorrelations(data, numericColumns);
      correlations.forEach(corr => {
        if (Math.abs(corr.value) > 0.7) {
          insights.push({
            id: `correlation-${corr.col1}-${corr.col2}`,
            type: 'correlation',
            title: `Correlação: ${corr.col1} ↔ ${corr.col2}`,
            description: `${corr.value > 0 ? 'Correlação positiva' : 'Correlação negativa'} forte (${(corr.value * 100).toFixed(1)}%)`,
            confidence: Math.abs(corr.value) * 100,
            impact: 'high',
            data: corr,
            suggestedAction: 'Utilizar esta relação para previsões e otimizações'
          });
        }
      });
    }

    // Distribution Analysis
    if (categoricalColumns.length > 0) {
      categoricalColumns.forEach(col => {
        const distribution = analyzeDistribution(data, col);
        if (distribution.skew > 0.8) {
          insights.push({
            id: `distribution-${col}`,
            type: 'recommendation',
            title: `Distribuição Desbalanceada: ${col}`,
            description: `${distribution.dominant.value} representa ${distribution.dominant.percentage.toFixed(1)}% dos dados`,
            confidence: 90,
            impact: 'medium',
            data: distribution,
            suggestedAction: 'Considerar balanceamento dos dados para análises mais precisas'
          });
        }
      });
    }

    // Predictive Insights
    if (numericColumns.length > 0 && data.length > 10) {
      const predictions = generatePredictions(data, numericColumns[0]);
      insights.push({
        id: `prediction-${numericColumns[0]}`,
        type: 'prediction',
        title: `Previsão para ${numericColumns[0]}`,
        description: `Próximo valor estimado: ${predictions.nextValue.toFixed(2)}`,
        confidence: predictions.confidence,
        impact: 'high',
        data: predictions,
        suggestedAction: 'Usar previsões para planejamento estratégico'
      });
    }

    return insights;
  };

  // Analysis helper functions
  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return { direction: 'stable', percentage: 0, confidence: 0 };
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = ((avgSecond - avgFirst) / avgFirst) * 100;
    const direction = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';
    const confidence = Math.min(95, Math.abs(change) * 3);
    
    return { direction, percentage: change, confidence };
  };

  const detectAnomalies = (data: any[], column: string) => {
    const values = data.map(row => row[column]).filter(val => typeof val === 'number');
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
    
    return data.filter(row => {
      const val = row[column];
      return typeof val === 'number' && Math.abs(val - mean) > 2 * stdDev;
    });
  };

  const findCorrelations = (data: any[], columns: string[]) => {
    const correlations = [];
    
    for (let i = 0; i < columns.length; i++) {
      for (let j = i + 1; j < columns.length; j++) {
        const col1 = columns[i];
        const col2 = columns[j];
        
        const values1 = data.map(row => row[col1]).filter(val => typeof val === 'number');
        const values2 = data.map(row => row[col2]).filter(val => typeof val === 'number');
        
        if (values1.length === values2.length && values1.length > 5) {
          const correlation = calculateCorrelation(values1, values2);
          correlations.push({ col1, col2, value: correlation });
        }
      }
    }
    
    return correlations;
  };

  const calculateCorrelation = (x: number[], y: number[]) => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const analyzeDistribution = (data: any[], column: string) => {
    const counts: { [key: string]: number } = {};
    data.forEach(row => {
      const val = String(row[column]);
      counts[val] = (counts[val] || 0) + 1;
    });
    
    const entries = Object.entries(counts);
    const maxEntry = entries.reduce((max, entry) => entry[1] > max[1] ? entry : max);
    const total = data.length;
    
    return {
      dominant: { value: maxEntry[0], percentage: (maxEntry[1] / total) * 100 },
      skew: maxEntry[1] / total,
      distribution: counts
    };
  };

  const generatePredictions = (data: any[], column: string) => {
    const values = data.map(row => row[column]).filter(val => typeof val === 'number');
    const recentValues = values.slice(-5);
    const trend = recentValues.reduce((sum, val, i) => sum + val * (i + 1), 0) / 
                  recentValues.reduce((sum, _, i) => sum + (i + 1), 0);
    
    return {
      nextValue: trend,
      confidence: Math.min(85, values.length * 2),
      trend: trend > values[values.length - 1] ? 'increasing' : 'decreasing'
    };
  };

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'trend': return TrendingUp;
      case 'anomaly': return AlertTriangle;
      case 'correlation': return Target;
      case 'recommendation': return Lightbulb;
      case 'prediction': return Eye;
      default: return Brain;
    }
  };

  const getImpactColor = (impact: AIInsight['impact']) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
    }
  };

  const filterInsights = (type: string) => {
    return type === 'all' ? insights : insights.filter(insight => insight.type === type);
  };

  useEffect(() => {
    if (selectedFile && selectedFile.data.length > 0) {
      generateInsights();
    }
  }, [selectedFile]);

  return (
    <Card className="shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6" />
          Insights de IA - Análise Avançada
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {!selectedFile ? (
          <div className="text-center py-12">
            <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Selecione um arquivo para análise
            </h3>
            <p className="text-gray-500">
              A IA irá gerar insights automáticos baseados nos seus dados
            </p>
          </div>
        ) : (
          <>
            {/* Analysis Controls */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Button 
                onClick={generateInsights}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {isGenerating ? 'Analisando...' : 'Gerar Insights'}
              </Button>
              
              <Button variant="outline" disabled={insights.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Exportar Relatório
              </Button>
            </div>

            {/* Progress Bar */}
            {isGenerating && (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Processando com IA...</span>
                  <span>{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Insights Tabs */}
            {insights.length > 0 && (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-6 w-full mb-6">
                  <TabsTrigger value="all">Todos ({insights.length})</TabsTrigger>
                  <TabsTrigger value="trend">Tendências</TabsTrigger>
                  <TabsTrigger value="anomaly">Anomalias</TabsTrigger>
                  <TabsTrigger value="correlation">Correlações</TabsTrigger>
                  <TabsTrigger value="recommendation">Recomendações</TabsTrigger>
                  <TabsTrigger value="prediction">Previsões</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filterInsights(activeTab).map((insight) => {
                      const Icon = getInsightIcon(insight.type);
                      return (
                        <Card 
                          key={insight.id}
                          className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                          onClick={() => onInsightSelect?.(insight)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Icon className="h-5 w-5 text-purple-600" />
                                <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                              </div>
                              <Badge className={getImpactColor(insight.impact)}>
                                {insight.impact}
                              </Badge>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-3">
                              {insight.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">Confiança:</span>
                                <div className="flex items-center gap-1">
                                  <Progress value={insight.confidence} className="w-16 h-2" />
                                  <span className="text-xs font-medium">{insight.confidence.toFixed(0)}%</span>
                                </div>
                              </div>
                              
                              {insight.suggestedAction && (
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-3 w-3 mr-1" />
                                  Ver Ação
                                </Button>
                              )}
                            </div>

                            {insight.suggestedAction && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <h5 className="text-xs font-medium text-blue-800 mb-1">Ação Recomendada:</h5>
                                <p className="text-xs text-blue-700">{insight.suggestedAction}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {/* Summary Stats */}
            {insights.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {insights.filter(i => i.impact === 'high').length}
                  </div>
                  <div className="text-xs text-blue-700">Alto Impacto</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {insights.filter(i => i.type === 'trend').length}
                  </div>
                  <div className="text-xs text-green-700">Tendências</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {insights.filter(i => i.type === 'anomaly').length}
                  </div>
                  <div className="text-xs text-yellow-700">Anomalias</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length)}%
                  </div>
                  <div className="text-xs text-purple-700">Confiança Média</div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}