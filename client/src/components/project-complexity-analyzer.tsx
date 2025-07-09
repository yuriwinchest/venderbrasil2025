import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Calculator, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  Clock,
  DollarSign,
  Code,
  Trash2,
  Eye
} from "lucide-react";

const analysisSchema = z.object({
  projectName: z.string().min(1, "Nome do projeto é obrigatório"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  projectType: z.string().min(1, "Tipo do projeto é obrigatório"),
  targetAudience: z.string().optional(),
});

type AnalysisFormData = z.infer<typeof analysisSchema>;

interface ProjectAnalysis {
  id: number;
  projectName: string;
  description: string;
  projectType: string;
  targetAudience?: string;
  complexityScore: number;
  effortEstimate: string;
  budgetRange: string;
  keyFeatures: string[];
  technicalChallenges: string[];
  recommendations: string[];
  riskFactors: string[];
  aiAnalysis: string;
  createdAt: string;
}

export function ProjectComplexityAnalyzer() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<ProjectAnalysis | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AnalysisFormData>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      projectName: "",
      description: "",
      projectType: "",
      targetAudience: "",
    },
  });

  const { data: analyses = [] } = useQuery<ProjectAnalysis[]>({
    queryKey: ["/api/project-analyses"],
  });

  const analyzeProjectMutation = useMutation({
    mutationFn: async (data: AnalysisFormData) => {
      const response = await fetch("/api/project-analyses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to analyze project");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-analyses"] });
      form.reset();
      toast({
        title: "Análise concluída",
        description: "Projeto analisado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao analisar projeto",
        variant: "destructive",
      });
    },
  });

  const deleteAnalysisMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/project-analyses/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete analysis");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/project-analyses"] });
      setSelectedAnalysis(null);
      toast({
        title: "Análise removida",
        description: "Análise deletada com sucesso!",
      });
    },
  });

  const onSubmit = (data: AnalysisFormData) => {
    analyzeProjectMutation.mutate(data);
  };

  const getComplexityColor = (score: number) => {
    if (score <= 3) return "bg-green-500";
    if (score <= 6) return "bg-yellow-500";
    return "bg-red-500";
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

  if (selectedAnalysis) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center">
            <Brain className="mr-2 h-6 w-6" />
            Análise: {selectedAnalysis.projectName}
          </h2>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setSelectedAnalysis(null)}>
              Voltar
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => deleteAnalysisMutation.mutate(selectedAnalysis.id)}
              disabled={deleteAnalysisMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remover
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Métricas Principais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Calculator className="mr-2 h-5 w-5" />
                Complexidade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Nível de Complexidade</span>
                    <Badge variant="secondary" className={getComplexityColor(selectedAnalysis.complexityScore)}>
                      {getComplexityLabel(selectedAnalysis.complexityScore)}
                    </Badge>
                  </div>
                  <Progress value={selectedAnalysis.complexityScore * 10} className="h-2" />
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedAnalysis.complexityScore}/10
                  </p>
                </div>
                
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-blue-500" />
                  <span><strong>Prazo:</strong> {selectedAnalysis.effortEstimate}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                  <span><strong>Orçamento:</strong> {selectedAnalysis.budgetRange}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funcionalidades Principais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="mr-2 h-5 w-5" />
                Funcionalidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {selectedAnalysis.keyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Desafios Técnicos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Code className="mr-2 h-5 w-5" />
                Desafios Técnicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {selectedAnalysis.technicalChallenges.map((challenge, index) => (
                  <li key={index} className="flex items-start">
                    <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{challenge}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recomendações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Lightbulb className="mr-2 h-5 w-5" />
                Recomendações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {selectedAnalysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <Lightbulb className="mr-2 h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Fatores de Risco */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Fatores de Risco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {selectedAnalysis.riskFactors.map((risk, index) => (
                  <li key={index} className="flex items-start">
                    <AlertTriangle className="mr-2 h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Análise Completa da IA */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Brain className="mr-2 h-5 w-5" />
              Análise Detalhada da IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {selectedAnalysis.aiAnalysis}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <Brain className="mr-2 h-6 w-6" />
          Analisador de Complexidade de Projetos
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Formulário de Análise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="mr-2 h-5 w-5" />
              Nova Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Projeto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Sistema de E-commerce" {...field} />
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
                      <FormLabel>Tipo do Projeto</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="webapp">Aplicação Web</SelectItem>
                          <SelectItem value="mobile">Aplicativo Mobile</SelectItem>
                          <SelectItem value="desktop">Aplicativo Desktop</SelectItem>
                          <SelectItem value="api">API/Backend</SelectItem>
                          <SelectItem value="ecommerce">E-commerce</SelectItem>
                          <SelectItem value="saas">SaaS</SelectItem>
                          <SelectItem value="erp">Sistema ERP</SelectItem>
                          <SelectItem value="crm">Sistema CRM</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetAudience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Público-Alvo (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Pequenas empresas, B2C, B2B" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição do Projeto</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva as funcionalidades, objetivos e requisitos do projeto..."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={analyzeProjectMutation.isPending}
                >
                  {analyzeProjectMutation.isPending ? (
                    <>
                      <Brain className="mr-2 h-4 w-4 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Analisar Projeto
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Lista de Análises Anteriores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Análises Anteriores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {analyses.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma análise realizada ainda
                </p>
              ) : (
                analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{analysis.projectName}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {analysis.projectType} • {analysis.effortEstimate}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {analysis.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge 
                          variant="secondary" 
                          className={`${getComplexityColor(analysis.complexityScore)} text-white text-xs`}
                        >
                          {analysis.complexityScore}/10
                        </Badge>
                        <Eye className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}