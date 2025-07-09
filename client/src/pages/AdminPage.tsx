import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Calendar, Building, Settings, TrendingUp, FileText, BarChart3 } from "lucide-react";
import { BackToHomeButton } from "@/components/ui/back-to-home-button";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Botão Voltar ao Início */}
      <BackToHomeButton />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Painel Administrativo</h1>
          <p className="text-xl text-gray-600">Gerencie leads, projetos e monitore todo o sistema</p>
        </div>

        {/* Botão Criar Projeto */}
        <div className="mb-8 text-center">
          <Link href="/admin/dashboard">
            <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg rounded-full shadow-lg">
              ✨ Criar Projeto
            </Button>
          </Link>
        </div>

        {/* Cards de Acesso Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/dashboard">
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Leads</h3>
                <p className="text-blue-100">Gerenciar contatos e prospects</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/dashboard">
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6 text-center">
                <Building className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Projetos</h3>
                <p className="text-purple-100">Acompanhar desenvolvimento</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/dashboard">
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Agendamentos</h3>
                <p className="text-green-100">Consultas e reuniões</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/dashboard">
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Analytics</h3>
                <p className="text-orange-100">Métricas e relatórios</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Seção de Ferramentas Avançadas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Ferramentas Avançadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/data-analyzer">
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white">
                <CardContent className="p-6 text-center">
                  <FileText className="h-10 w-10 mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-2">Data Analyzer</h3>
                  <p className="text-cyan-100 text-sm">Análise avançada de dados</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/marketplace-tools">
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                <CardContent className="p-6 text-center">
                  <Settings className="h-10 w-10 mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-2">Marketplace Tools</h3>
                  <p className="text-emerald-100 text-sm">Ferramentas de marketplace</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/dashboard">
              <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-10 w-10 mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-2">99Freelas Analytics</h3>
                  <p className="text-indigo-100 text-sm">Análise de performance</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Completo ao Dashboard</h2>
          <p className="text-gray-600 mb-6">Acesse o dashboard completo para gerenciar todos os aspectos do sistema</p>
          <Link href="/admin/dashboard">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-lg rounded-full shadow-lg">
              Abrir Dashboard Completo
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}