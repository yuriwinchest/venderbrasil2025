import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Brain, Calculator, Clock, DollarSign, Lightbulb, Target, TrendingUp, ArrowLeft, Download, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";

const projectAnalysisSchema = z.object({
  projectName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  projectType: z.string().min(1, "Tipo do projeto é obrigatório"),
  targetAudience: z.string().optional(),
});

type ProjectAnalysisFormData = z.infer<typeof projectAnalysisSchema>;

interface ProjectAnalysis {
  id: number;
  projectName: string;
  description: string;
  projectType: string;
  targetAudience: string | null;
  complexityScore: number;
  effortEstimate: string;
  budgetRange: string;
  keyFeatures: string[];
  technicalChallenges: string[];
  recommendations: string[];
  riskFactors: string[];
  aiAnalysis: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectAnalyzer() {
  const [currentAnalysis, setCurrentAnalysis] = useState<ProjectAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<ProjectAnalysisFormData>({
    resolver: zodResolver(projectAnalysisSchema),
    defaultValues: {
      projectName: "",
      description: "",
      projectType: "",
      targetAudience: "",
    },
  });

  const createAnalysisMutation = useMutation({
    mutationFn: async (data: ProjectAnalysisFormData) => {
      const response = await fetch("/api/project-analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao analisar projeto");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      console.log("✅ Análise recebida:", data);
      console.log("🎯 Definindo currentAnalysis...");
      setCurrentAnalysis(data);
      setIsAnalyzing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/project-analyses"] });
      
      // Force re-render
      setTimeout(() => {
        console.log("📊 Estado após análise:", { currentAnalysis: data, isAnalyzing: false });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    },
    onError: (error) => {
      console.error("❌ Erro na análise:", error);
      setIsAnalyzing(false);
      // Show error message to user
      alert("Erro ao processar análise. Tente novamente.");
    },
  });

  const onSubmit = (data: ProjectAnalysisFormData) => {
    console.log("📋 Enviando dados para análise:", data);
    console.log("🔄 Estado atual:", { isAnalyzing, currentAnalysis });
    setIsAnalyzing(true);
    setCurrentAnalysis(null);
    createAnalysisMutation.mutate(data);
  };

  const getComplexityColor = (score: number) => {
    if (score <= 3) return "bg-green-100 text-green-800 border-green-300";
    if (score <= 6) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const getComplexityLabel = (score: number) => {
    if (score <= 3) return "Baixa";
    if (score <= 6) return "Média";
    return "Alta";
  };

  const handleGeneratePDF = async (analysis: any) => {
    try {
      console.log('📄 Iniciando geração do PDF avançado...');
      
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;
      
      // Criar uma versão otimizada para PDF da análise
      const pdfContent = document.createElement('div');
      pdfContent.style.cssText = `
        width: 210mm;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        font-family: 'Inter', system-ui, sans-serif;
        color: white;
        padding: 40px;
        box-sizing: border-box;
      `;
      
      pdfContent.innerHTML = `
        <div style="background: rgba(255,255,255,0.95); color: #1a1a1a; border-radius: 20px; padding: 40px; box-shadow: 0 25px 50px rgba(0,0,0,0.3);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 20px;">
            <h1 style="font-size: 28px; font-weight: 800; color: #667eea; margin: 0 0 10px 0;">🤖 ANÁLISE INTELIGENTE</h1>
            <h2 style="font-size: 20px; color: #4a5568; margin: 0; font-weight: 600;">${analysis.projectName}</h2>
          </div>
          
          <!-- Metrics Grid -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px;">
            <div style="background: linear-gradient(135deg, #4299e1, #3182ce); color: white; padding: 25px; border-radius: 15px; text-align: center;">
              <div style="font-size: 32px; font-weight: 900; margin-bottom: 8px;">${analysis.complexityScore}/10</div>
              <div style="font-size: 14px; opacity: 0.9;">${getComplexityLabel(analysis.complexityScore)} Complexidade</div>
            </div>
            <div style="background: linear-gradient(135deg, #38b2ac, #319795); color: white; padding: 25px; border-radius: 15px; text-align: center;">
              <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">${analysis.effortEstimate}</div>
              <div style="font-size: 14px; opacity: 0.9;">Prazo Estimado</div>
            </div>
            <div style="background: linear-gradient(135deg, #805ad5, #6b46c1); color: white; padding: 25px; border-radius: 15px; text-align: center;">
              <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">${analysis.budgetRange}</div>
              <div style="font-size: 14px; opacity: 0.9;">Investimento</div>
            </div>
          </div>
          
          <!-- Features Section -->
          <div style="margin-bottom: 35px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #2d3748; margin-bottom: 15px; display: flex; align-items: center;">
              🎯 Principais Características
            </h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
              ${analysis.keyFeatures.map((feature: string) => `
                <div style="background: #f7fafc; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #4299e1; font-size: 14px; color: #2d3748;">
                  ${feature}
                </div>
              `).join('')}
            </div>
          </div>
          
          <!-- Recommendations -->
          <div style="margin-bottom: 35px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #2d3748; margin-bottom: 15px;">
              💡 Recomendações Estratégicas
            </h3>
            ${analysis.recommendations.slice(0, 4).map((rec: string) => `
              <div style="background: #f0fff4; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #38a169; margin-bottom: 8px; font-size: 14px; color: #2d3748;">
                ${rec}
              </div>
            `).join('')}
          </div>
          
          <!-- Risk Factors -->
          <div style="margin-bottom: 35px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #2d3748; margin-bottom: 15px;">
              ⚠️ Fatores de Risco
            </h3>
            ${analysis.riskFactors.map((risk: string) => `
              <div style="background: #fffaf0; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #ed8936; margin-bottom: 8px; font-size: 14px; color: #2d3748;">
                ${risk}
              </div>
            `).join('')}
          </div>
          
          <!-- AI Analysis -->
          <div style="background: linear-gradient(135deg, #edf2f7, #e2e8f0); padding: 25px; border-radius: 15px; margin-bottom: 30px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #2d3748; margin-bottom: 15px;">
              🧠 Análise Detalhada da IA
            </h3>
            <div style="font-size: 14px; line-height: 1.6; color: #4a5568; white-space: pre-line;">
              ${analysis.aiAnalysis}
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #718096; font-size: 12px;">
            <div style="margin-bottom: 5px;">📧 contato@venderbrasil.com | 📱 +55 61 99352-1849</div>
            <div>🕒 Gerado em ${new Date().toLocaleString('pt-BR')} | 🚀 VenderBrasil.com</div>
          </div>
        </div>
      `;
      
      // Adicionar ao DOM temporariamente
      document.body.appendChild(pdfContent);
      
      // Capturar como imagem
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        width: 794, // A4 width in pixels
        height: 1123 // A4 height in pixels
      });
      
      // Remover do DOM
      document.body.removeChild(pdfContent);
      
      // Criar PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
      
      // Salvar PDF
      const fileName = `analise-ia-${analysis.projectName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      pdf.save(fileName);
      
      console.log('✅ PDF futurista gerado com sucesso:', fileName);
      alert('📄 PDF minimalista baixado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Verifique se o navegador permite downloads.');
    }
  };

  console.log("🔍 Verificando currentAnalysis:", currentAnalysis);
  console.log("🔍 Estado isAnalyzing:", isAnalyzing);

  // Show results page when analysis is available
  if (currentAnalysis) {
    console.log("✅ Exibindo página de resultados");
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button
                onClick={() => setCurrentAnalysis(null)}
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Nova Análise
              </Button>
              
              <Button
                onClick={() => handleGeneratePDF(currentAnalysis)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar PDF da Análise
              </Button>
            </div>
            
            <Link href="/">
              <Button variant="ghost" className="mb-4 ml-2">
                Voltar ao Site
              </Button>
            </Link>
          </div>

          <Card className="shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Brain className="h-6 w-6" />
                Análise de Projeto: {currentAnalysis.projectName}
              </CardTitle>
              <CardDescription className="text-blue-100">
                Análise completa gerada por Inteligência Artificial
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8">
              {/* Métricas principais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Complexidade</p>
                      <p className="text-2xl font-bold text-blue-900">{currentAnalysis.complexityScore}/10</p>
                    </div>
                    <Badge className={`${getComplexityColor(currentAnalysis.complexityScore)} font-semibold`}>
                      {getComplexityLabel(currentAnalysis.complexityScore)}
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-600">Prazo Estimado</p>
                      <p className="text-xl font-bold text-green-900">{currentAnalysis.effortEstimate}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-purple-600">Orçamento</p>
                      <p className="text-xl font-bold text-purple-900">{currentAnalysis.budgetRange}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Funcionalidades principais */}
              <div className="mb-8">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-gray-800">
                  <Target className="h-5 w-5 text-blue-600" />
                  Funcionalidades Principais
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentAnalysis.keyFeatures.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Desafios técnicos */}
              <div className="mb-8">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-gray-800">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Desafios Técnicos
                </h3>
                <ul className="space-y-2">
                  {currentAnalysis.technicalChallenges.map((challenge, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recomendações */}
              <div className="mb-8">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-gray-800">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Recomendações
                </h3>
                <ul className="space-y-2">
                  {currentAnalysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Fatores de risco */}
              <div className="mb-8">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-gray-800">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                  Fatores de Risco
                </h3>
                <ul className="space-y-2">
                  {currentAnalysis.riskFactors.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Análise detalhada */}
              <div>
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-gray-800">
                  <Brain className="h-5 w-5 text-indigo-600" />
                  Análise Detalhada
                </h3>
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {currentAnalysis.aiAnalysis}
                  </pre>
                </div>
              </div>

              {/* CTA para contato */}
              <Separator className="my-8" />
              
              <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg border">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Gostou da análise?
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Entre em contato conosco para transformar essa análise em realidade. 
                  Desenvolvo sites profissionais a partir de R$500.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      Agendar Conversa
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => window.open('https://wa.me/5561993521849?text=Olá! Vi a análise do meu projeto e gostaria de conversar sobre o desenvolvimento.')}
                  >
                    WhatsApp Direto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Site
            </Button>
          </Link>
        </div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Calculator className="h-6 w-6" />
              Analisador de Projetos com IA
            </CardTitle>
            <CardDescription className="text-blue-100">
              Descubra quanto custará seu projeto e o tempo de desenvolvimento
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Nome do Projeto</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Loja Virtual de Roupas"
                          className="h-12"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Tipo de Projeto</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Selecione o tipo de projeto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="webapp">Site/Aplicação Web</SelectItem>
                          <SelectItem value="ecommerce">E-commerce/Loja Virtual</SelectItem>
                          <SelectItem value="mobile">Aplicativo Mobile</SelectItem>
                          <SelectItem value="landing">Landing Page</SelectItem>
                          <SelectItem value="blog">Blog/Site de Conteúdo</SelectItem>
                          <SelectItem value="sistema">Sistema Personalizado</SelectItem>
                          <SelectItem value="api">API/Backend</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Descrição do Projeto</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva seu projeto: funcionalidades, objetivos, público-alvo..."
                          className="min-h-32 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Público-Alvo (Opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: Pequenas empresas, jovens de 18-35 anos..."
                          className="h-12"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  size="lg"
                  disabled={isAnalyzing}
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Brain className="mr-2 h-5 w-5 animate-spin" />
                      Analisando com IA...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-5 w-5" />
                      Analisar Projeto
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">O que você receberá:</h3>
              <ul className="space-y-1 text-blue-700 text-sm">
                <li>• Análise de complexidade (1-10)</li>
                <li>• Estimativa de prazo de desenvolvimento</li>
                <li>• Faixa de orçamento personalizada</li>
                <li>• Funcionalidades principais identificadas</li>
                <li>• Desafios técnicos e recomendações</li>
                <li>• Análise detalhada por Inteligência Artificial</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}