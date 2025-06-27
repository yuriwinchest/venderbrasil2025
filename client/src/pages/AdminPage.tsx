import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminPanel from "@/components/admin-panel";
import AdminAnalytics from "@/components/admin-analytics";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-gray-600 mt-2">Gerencie leads, projetos e monitore o sistema</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            <TabsTrigger value="costs">Custos</TabsTrigger>
            <TabsTrigger value="guidelines">Orientações</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <AdminPanel isOpen={true} onClose={() => {}} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Seção de Leads em desenvolvimento</p>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Seção de Agendamentos em desenvolvimento</p>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Seção de Projetos em desenvolvimento</p>
            </div>
          </TabsContent>

          <TabsContent value="costs" className="space-y-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Seção de Custos em desenvolvimento</p>
            </div>
          </TabsContent>

          <TabsContent value="guidelines" className="space-y-6">
            <div className="text-center py-8">
              <p className="text-gray-500">Seção de Orientações em desenvolvimento</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}