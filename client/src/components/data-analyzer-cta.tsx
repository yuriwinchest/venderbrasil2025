import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  BarChart3, 
  Database, 
  FileSpreadsheet,
  Brain,
  Zap,
  ArrowRight,
  Play,
  ShoppingCart
} from "lucide-react";
import { Link } from "wouter";

export default function DataAnalyzerCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            🚀 Transforme Seus Dados em Insights Poderosos
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Faça upload de planilhas, CSV ou JSON e gere gráficos profissionais com IA em segundos
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Main CTA Card */}
          <Card className="shadow-2xl border-0 overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white text-center">
              <Database className="h-16 w-16 mx-auto mb-4 opacity-90" />
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Analisador de Dados com IA
              </h3>
              <p className="text-lg text-indigo-100 mb-6 max-w-2xl mx-auto">
                Arraste seus arquivos, clique e veja a mágica acontecer!
              </p>
              
              <Link href="/analisar-dados">
                <Button 
                  size="lg" 
                  className="bg-white text-indigo-600 hover:bg-gray-100 text-xl px-8 py-4 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Upload className="mr-3 h-6 w-6" />
                  ANEXAR ARQUIVO E GERAR GRÁFICOS
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
              
              <div className="mt-4 text-sm text-indigo-200">
                ✨ Gratuito • 📊 Resultados instantâneos • 🤖 Powered by AI
              </div>
            </div>
          </Card>

          {/* How it Works Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  1. Anexe Seu Arquivo
                </h3>
                <p className="text-gray-600">
                  Arraste e solte ou clique para fazer upload de Excel, CSV, JSON ou PDF
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  <Badge variant="secondary">Excel</Badge>
                  <Badge variant="secondary">CSV</Badge>
                  <Badge variant="secondary">JSON</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  2. IA Analisa Automaticamente
                </h3>
                <p className="text-gray-600">
                  Nossa IA identifica padrões, tendências e gera insights inteligentes
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  <Badge className="bg-purple-100 text-purple-800">Tendências</Badge>
                  <Badge className="bg-purple-100 text-purple-800">Correlações</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  3. Gráficos Profissionais
                </h3>
                <p className="text-gray-600">
                  Receba gráficos interativos, relatórios e insights acionáveis
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  <Badge className="bg-green-100 text-green-800">Barras</Badge>
                  <Badge className="bg-green-100 text-green-800">Pizza</Badge>
                  <Badge className="bg-green-100 text-green-800">Linhas</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <ShoppingCart className="h-6 w-6" />
                  Marketplace + ChatGPT
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-orange-700">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Processa 50.000+ produtos automaticamente
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Recategorização inteligente com ChatGPT
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Otimização de títulos para SEO
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Exportação pronta para marketplace
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <FileSpreadsheet className="h-6 w-6" />
                  Google Sheets + Looker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-green-700">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Conecta diretamente com Google Sheets
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Dashboards automáticos no Looker
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Sincronização em tempo real
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Relatórios profissionais prontos
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Final CTA */}
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0">
            <CardContent className="p-12 text-center">
              <h3 className="text-3xl font-bold mb-4">
                Pronto para Descobrir Insights Ocultos?
              </h3>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Seus dados têm histórias para contar. Nossa IA + Google Sheets + Looker vai revelá-las.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link href="/analisar-dados">
                  <Button 
                    size="lg" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-10 py-4 font-bold shadow-xl"
                  >
                    <Play className="mr-3 h-6 w-6" />
                    COMEÇAR AGORA - É GRÁTIS
                  </Button>
                </Link>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-gray-900 text-lg px-8 py-4"
                  onClick={() => window.open("https://wa.me/5561993521849?text=Olá! Quero saber mais sobre o analisador de dados com IA.")}
                >
                  📱 Falar no WhatsApp
                </Button>
              </div>
              
              <div className="mt-8 text-sm text-gray-400">
                <p>⚡ Análise instantânea • 🔒 Dados seguros • 📈 Resultados profissionais</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}