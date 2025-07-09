// Componente da página inicial - responsável apenas pela estrutura da Home
// Responsabilidade: Organizar e renderizar as seções da página inicial

import { useRef } from "react";
import Navigation from "@/components/layout/Navigation";
import HeroSection from "@/components/hero-section";
import BenefitsSection from "@/components/benefits-section";
import ExperienceSection from "@/components/experience-section";
import PortfolioSection from "@/components/portfolio-section";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import SchedulingSection from "@/components/scheduling-section";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/layout/Footer";
import { AdaptiveRecommendationCard } from "@/components/adaptive-recommendation-card";
import DataAnalyzerCTA from "@/components/data-analyzer-cta";
import "../styles/HomePage.css";

export default function HomePage() {
  // Refs para navegação por scroll
  const schedulingRef = useRef<HTMLDivElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);

  // Função para scroll suave até seção de agendamento
  const scrollToScheduling = () => {
    schedulingRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Função para scroll suave até portfólio
  const scrollToPortfolio = () => {
    portfolioRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="home-container">
      {/* Navegação superior */}
      <Navigation onScheduleClick={scrollToScheduling} />
      
      {/* Seção principal/hero */}
      <HeroSection 
        onScheduleClick={scrollToScheduling} 
        onPortfolioClick={scrollToPortfolio} 
      />
      
      {/* SEÇÃO DESTACADA - SERVIÇO PRINCIPAL */}
      <section className="py-16 bg-gradient-to-r from-red-600 via-red-700 to-red-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Título Principal */}
          <div className="mb-8">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
              SEU SITE PRONTO EM
              <span className="block text-yellow-300 text-6xl md:text-7xl">
                ATÉ 10 DIAS
              </span>
            </h2>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
              <p className="text-3xl md:text-4xl font-bold text-red-700 mb-2">
                A partir de R$ 500
              </p>
              <p className="text-xl text-gray-700">
                Site profissional completo com design moderno
              </p>
            </div>
          </div>

          {/* Chamada para Ação */}
          <div className="mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              FALE COM A GENTE AGORA!
            </h3>
            <p className="text-xl text-white/90 mb-6">
              Só marcar na agenda ou chamar no WhatsApp
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Botão Agendar */}
            <button
              onClick={scrollToScheduling}
              className="bg-white text-red-700 px-8 py-4 rounded-xl text-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl min-w-[250px]"
            >
              📅 MARCAR NA AGENDA
            </button>
            
            {/* Botão WhatsApp */}
            <a
              href="https://wa.me/5561993521849?text=Olá!%20Quero%20um%20site%20a%20partir%20de%20R%24%20500%20em%20até%2010%20dias!"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-8 py-4 rounded-xl text-xl font-bold hover:bg-green-600 transition-all transform hover:scale-105 shadow-2xl min-w-[250px] flex items-center justify-center gap-3"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.513z"/>
              </svg>
              CHAMAR NO WHATSAPP
            </a>
          </div>
          
          {/* Informações Adicionais */}
          <div className="mt-8 text-white/80">
            <p className="text-lg">
              💬 WhatsApp: (61) 99352-1849
            </p>
          </div>
        </div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full"></div>
          <div className="absolute top-1/2 -right-8 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-4 left-1/3 w-20 h-20 bg-yellow-300/20 rounded-full"></div>
        </div>
      </section>
      
      {/* Analisador de Dados - Destaque */}
      <DataAnalyzerCTA />
      
      {/* Seção de Ferramentas Avançadas */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ferramentas Avançadas de Análise
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Utilize nossa tecnologia de ponta para análise de dados e otimização de marketplace
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Data Analyzer Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">AI Data Analyzer</h3>
                  <p className="text-white/70">Análise inteligente de datasets</p>
                </div>
              </div>
              <p className="text-white/80 mb-6">
                Faça upload de seus dados e obtenha insights automáticos, correlações, 
                padrões e recomendações estratégicas geradas por inteligência artificial.
              </p>
              <a 
                href="/upload-dados" 
                className="inline-flex items-center bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-blue-600 transition-all"
              >
                ANEXAR ARQUIVO E GERAR GRÁFICOS
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>

            {/* Marketplace Tools Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Marketplace Tools</h3>
                  <p className="text-white/70">Otimização avançada de produtos</p>
                </div>
              </div>
              <p className="text-white/80 mb-6">
                Ferramentas profissionais para otimização de marketplace com processamento 
                em lote, categorização IA e otimização SEO para milhares de produtos.
              </p>
              <a 
                href="/marketplace-tools" 
                className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all"
              >
                Acessar Marketplace Tools
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>

            {/* Financial Analysis Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Gerenciar Finanças</h3>
                  <p className="text-white/70">Análise de extratos bancários</p>
                </div>
              </div>
              <p className="text-white/80 mb-6">
                Na página de análise de dados, clique no botão 'Gerenciar Finanças'. Essa função permite anexar planilhas bancárias e classificar transações entre transferências, receitas e despesas. Ao final, você receberá um Excel formatado, podendo editar, adicionar ou remover colunas conforme necessário.
              </p>
              <a 
                href="/upload-dados" 
                className="inline-flex items-center bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all"
              >
                Gerenciar Finanças
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>

          </div>
        </div>
      </section>
      
      {/* Seção de benefícios */}
      <BenefitsSection />
      
      {/* Como funciona */}
      <HowItWorksSection />
      
      {/* Experiência e tecnologias */}
      <ExperienceSection />
      
      {/* Portfólio */}
      <div ref={portfolioRef}>
        <PortfolioSection />
      </div>
      
      {/* Depoimentos */}
      <TestimonialsSection />
      

      
      {/* Seção de agendamento */}
      <div ref={schedulingRef}>
        <SchedulingSection />
      </div>
      
      {/* Call to Action final */}
      <CTASection onScheduleClick={scrollToScheduling} />
      
      {/* Rodapé */}
      <Footer />
      
      {/* Adaptive Recommendation Engine */}
      <AdaptiveRecommendationCard onContactClick={scrollToScheduling} />
    </div>
  );
}