import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  BarChart3, 
  FileSpreadsheet, 
  Zap, 
  Upload,
  Eye,
  Download,
  TrendingUp,
  PieChart,
  LineChart
} from "lucide-react";
import { Link } from "wouter";

export default function DataToolsPreview() {
  const features = [
    {
      icon: Upload,
      title: "Upload Múltiplos Formatos",
      description: "CSV, JSON, Excel, PDF - todos suportados",
      highlight: "Arraste e solte"
    },
    {
      icon: BarChart3,
      title: "Gráficos Interativos",
      description: "Barras, linhas, pizza e área em tempo real",
      highlight: "Dinâmicos"
    },
    {
      icon: Database,
      title: "Análise Inteligente",
      description: "Detecta automaticamente tipos de dados",
      highlight: "IA integrada"
    },
    {
      icon: Download,
      title: "Relatórios Avançados",
      description: "Exporte insights em múltiplos formatos",
      highlight: "Profissionais"
    }
  ];

  const sampleCharts = [
    { type: "Vendas por Mês", icon: LineChart, color: "from-blue-500 to-blue-600" },
    { type: "Market Share", icon: PieChart, color: "from-green-500 to-green-600" },
    { type: "Performance", icon: BarChart3, color: "from-purple-500 to-purple-600" },
    { type: "Tendências", icon: TrendingUp, color: "from-orange-500 to-orange-600" }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <Database className="inline mr-3 h-8 w-8 text-blue-600" />
            Ferramentas de Análise de Dados
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transforme planilhas em insights visuais poderosos
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Preview Demo */}
          <Card className="mb-12 shadow-2xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="text-xl font-bold mb-2">Analisador de Dados - Demo</h3>
                  <p className="text-slate-300">Faça upload e veja a mágica acontecer</p>
                </div>
                <Link href="/analisar-dados">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Eye className="mr-2 h-4 w-4" />
                    Testar Agora
                  </Button>
                </Link>
              </div>
            </div>
            
            <CardContent className="p-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
                {sampleCharts.map((chart, index) => {
                  const Icon = chart.icon;
                  return (
                    <div 
                      key={index}
                      className={`p-8 bg-gradient-to-br ${chart.color} text-white text-center hover:scale-105 transition-transform cursor-pointer`}
                    >
                      <Icon className="h-8 w-8 mx-auto mb-3" />
                      <div className="text-sm font-semibold">{chart.type}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
                    <Badge className="bg-green-100 text-green-800">{feature.highlight}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Use Cases */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <FileSpreadsheet className="mr-2 h-5 w-5 text-blue-600" />
                  Vendas & Marketing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Análise de performance de vendas</li>
                  <li>• ROI de campanhas</li>
                  <li>• Funil de conversão</li>
                  <li>• Segmentação de clientes</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                  Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Fluxo de caixa</li>
                  <li>• Análise de custos</li>
                  <li>• Projeções financeiras</li>
                  <li>• Indicadores de performance</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Database className="mr-2 h-5 w-5 text-purple-600" />
                  Operacional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Controle de estoque</li>
                  <li>• Produtividade da equipe</li>
                  <li>• Métricas de qualidade</li>
                  <li>• Análise de processos</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Pronto para Transformar Seus Dados?
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Teste nossa ferramenta gratuitamente ou contrate um sistema personalizado
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/analisar-dados">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                    <Zap className="mr-2 h-5 w-5" />
                    Testar Ferramenta Grátis
                  </Button>
                </Link>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                  onClick={() => window.open("https://wa.me/5561993521849?text=Olá! Quero um sistema de análise de dados personalizado para minha empresa.")}
                >
                  <Database className="mr-2 h-5 w-5" />
                  Sistema Personalizado
                </Button>
              </div>
              
              <div className="mt-6 text-sm text-blue-100">
                <p>✨ Gratuito para testar • 🚀 Ilimitado para empresas • 📊 Suporte completo</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}