import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ExternalLink, Pill, Users, Activity } from 'lucide-react';

export default function CrossMedsPage() {
  const openCrossMeds = () => {
    // Abrir CrossMeds em nova aba na porta 3001
    window.open('https://' + window.location.hostname.replace('5000', '3001').replace('80', '3001') + ':3001', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              CrossMeds
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gerenciador de Medicamentos Inteligente para Idosos
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Base com 25.700+ medicamentos ANVISA • Detecção de Interações • Relatórios Médicos
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-teal-600">
                <Pill className="w-5 h-5" />
                Autocompletar Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Sistema adaptado para idosos com busca desde a primeira letra digitada.
                Base completa da ANVISA com informações detalhadas.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Activity className="w-5 h-5" />
                Detecção de Interações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Análise automática de interações medicamentosas com alertas visuais
                e recomendações práticas para idosos.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Users className="w-5 h-5" />
                Perfil do Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Cálculo automático de IMC e HbA1c estimada. Geração de relatórios
                médicos completos em PDF.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* App Preview */}
        <Card className="mb-8 overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-4">
                Interface Amigável para Idosos
              </h2>
              <p className="text-blue-100 mb-6">
                Design simples, textos grandes, cores contrastantes e navegação intuitiva
              </p>
              
              <Button
                onClick={openCrossMeds}
                size="lg"
                className="bg-white text-teal-600 hover:bg-gray-100 font-semibold px-8 py-3"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Abrir CrossMeds
              </Button>
            </div>

            <div className="p-8 bg-gray-50">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Funcionalidades Principais:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Cadastro fácil de medicamentos com autocompletar</li>
                    <li>• Tabela interativa de medicamentos do paciente</li>
                    <li>• Sistema de lembretes com horários personalizados</li>
                    <li>• Análise de interações medicamentosas</li>
                    <li>• Cálculo automático de IMC e HbA1c</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Dados Completos:</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Base com 25.700+ medicamentos ANVISA</li>
                    <li>• Informações de dosagem e modo de tomar</li>
                    <li>• Patologias relacionadas aos medicamentos</li>
                    <li>• Geração de relatórios médicos em PDF</li>
                    <li>• Sistema offline para maior segurança</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Como Usar o CrossMeds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="p-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-teal-600 font-bold">1</span>
                </div>
                <h4 className="font-semibold mb-2">Clique em "Abrir CrossMeds"</h4>
                <p className="text-sm text-gray-600">O app abrirá em uma nova aba</p>
              </div>
              
              <div className="p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h4 className="font-semibold mb-2">Adicione Medicamentos</h4>
                <p className="text-sm text-gray-600">Use o autocompletar para encontrar seus medicamentos</p>
              </div>
              
              <div className="p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h4 className="font-semibold mb-2">Configure o Perfil</h4>
                <p className="text-sm text-gray-600">Adicione dados pessoais e exames</p>
              </div>
              
              <div className="p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">4</span>
                </div>
                <h4 className="font-semibold mb-2">Gere Relatórios</h4>
                <p className="text-sm text-gray-600">Baixe relatórios em PDF para o médico</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Bottom */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Pronto para gerenciar seus medicamentos de forma inteligente?
          </p>
          <Button
            onClick={openCrossMeds}
            size="lg"
            className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white px-8 py-3"
          >
            <Shield className="w-5 h-5 mr-2" />
            Acessar CrossMeds Agora
          </Button>
        </div>
      </div>
    </div>
  );
}