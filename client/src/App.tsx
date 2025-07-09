// Componente principal da aplicação - responsável apenas pelo roteamento
// Responsabilidade: Configurar providers globais e gerenciar rotas

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EmotionResponsiveWrapper } from "@/components/emotion-responsive-wrapper";
import { InteractiveFeaturesProvider } from "@/components/interactive-features/InteractiveFeaturesProvider";
import HomePage from "@/pages/HomePage";
import AdminPage from "@/pages/AdminPage";
import AdminDashboard from "@/pages/AdminDashboard";
import DataAnalyzer from "@/pages/DataAnalyzer";
import MarketplaceTools from "@/pages/MarketplaceTools";
import CrossMedsPage from "@/pages/CrossMedsPage";
import NotFound from "@/pages/not-found";

// Componente responsável pelo roteamento da aplicação
function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/analisar-dados" component={DataAnalyzer} />
      <Route path="/upload-dados" component={DataAnalyzer} />
      <Route path="/marketplace-tools" component={MarketplaceTools} />
      <Route path="/crossmeds" component={CrossMedsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Componente raiz que configura os providers globais
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="app-container overflow-x-hidden">
          <EmotionResponsiveWrapper enableDebug={import.meta.env.DEV}>
            <InteractiveFeaturesProvider>
              <Toaster />
              <Router />
            </InteractiveFeaturesProvider>
          </EmotionResponsiveWrapper>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
