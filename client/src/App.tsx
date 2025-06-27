// Componente principal da aplicação - responsável apenas pelo roteamento
// Responsabilidade: Configurar providers globais e gerenciar rotas

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EmotionResponsiveWrapper } from "@/components/emotion-responsive-wrapper";
import HomePage from "@/pages/HomePage";
import AdminPage from "@/pages/AdminPage";
import AdminDashboard from "@/pages/admin-dashboard";
import CrossMedsPage from "@/pages/CrossMedsPage";
import ProjectAnalyzer from "@/pages/project-analyzer";
import DataAnalyzer from "@/components/data-analyzer";
import NotFound from "@/pages/not-found";

// Componente responsável pelo roteamento da aplicação
function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin-old" component={AdminDashboard} />
      <Route path="/crossmeds" component={CrossMedsPage} />
      <Route path="/analisar-projeto" component={ProjectAnalyzer} />
      <Route path="/analisar-dados">
        <div className="min-h-screen bg-gray-50">
          <DataAnalyzer />
        </div>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

// Componente raiz que configura os providers globais
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <EmotionResponsiveWrapper enableDebug={import.meta.env.DEV}>
          <Toaster />
          <Router />
        </EmotionResponsiveWrapper>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
