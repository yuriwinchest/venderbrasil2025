import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Database, BarChart3, FileSpreadsheet, Brain } from "lucide-react";
import DataAnalyzer from "@/components/data-analyzer";
import { BackToHomeButton } from "@/components/ui/back-to-home-button";

export default function DataUploader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Botão Voltar ao Início */}
      <div className="fixed top-4 left-4 z-50">
        <BackToHomeButton />
      </div>
      
      {/* Header da Página */}
      <div className="pt-20 pb-8">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-6">
            <Upload className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Upload de Arquivos
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Faça upload de qualquer arquivo e transforme dados em insights visuais
          </p>
          
          {/* Badges de Recursos */}
          <div className="flex justify-center gap-3 flex-wrap mb-8">
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">CSV, Excel, JSON</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Gráficos Automáticos</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-full shadow-sm border flex items-center gap-2">
              <Brain className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium">Análise com IA</span>
            </div>
          </div>
          

        </div>
      </div>

      {/* Componente de Upload de Dados */}
      <DataAnalyzer />
    </div>
  );
}