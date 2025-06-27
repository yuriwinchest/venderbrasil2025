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
      
      {/* Seção de benefícios */}
      <BenefitsSection />
      
      {/* Analisador de Dados */}
      <DataAnalyzerCTA />
      
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