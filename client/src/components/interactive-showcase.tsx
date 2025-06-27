import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Smartphone, 
  ShoppingCart, 
  Users, 
  Eye, 
  ExternalLink,
  Zap,
  Heart,
  TrendingUp
} from "lucide-react";

interface ShowcaseProps {
  onScheduleClick: () => void;
}

export default function InteractiveShowcase({ onScheduleClick }: ShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "Todos", icon: Globe },
    { id: "ecommerce", name: "E-commerce", icon: ShoppingCart },
    { id: "landing", name: "Landing Pages", icon: Zap },
    { id: "webapp", name: "Sistemas", icon: Users },
    { id: "mobile", name: "Apps", icon: Smartphone },
  ];

  const projects = [
    {
      id: 1,
      title: "Loja Virtual Premium",
      category: "ecommerce",
      image: "🛍️",
      description: "E-commerce completo com carrinho, pagamentos e gestão de estoque",
      tech: ["React", "Node.js", "PostgreSQL"],
      results: "+300% vendas",
      investment: "R$ 4.500",
      timeframe: "3 semanas",
      features: ["Pagamentos", "Estoque", "Analytics", "Mobile"],
      demoUrl: "#"
    },
    {
      id: 2,
      title: "Landing Page Conversão",
      category: "landing",
      image: "🚀",
      description: "Página de alta conversão para captação de leads qualificados",
      tech: ["React", "Tailwind", "Analytics"],
      results: "+500% leads",
      investment: "R$ 1.200",
      timeframe: "1 semana",
      features: ["SEO", "Analytics", "Forms", "Mobile"],
      demoUrl: "#"
    },
    {
      id: 3,
      title: "Sistema de Gestão",
      category: "webapp",
      image: "⚡",
      description: "Plataforma completa para gestão empresarial e relatórios",
      tech: ["React", "Express", "Dashboard"],
      results: "+80% eficiência",
      investment: "R$ 6.800",
      timeframe: "4 semanas",
      features: ["Dashboard", "Relatórios", "Usuários", "API"],
      demoUrl: "#"
    },
    {
      id: 4,
      title: "App Delivery",
      category: "mobile",
      image: "📱",
      description: "Aplicativo completo para delivery com tracking em tempo real",
      tech: ["React Native", "Firebase", "Maps"],
      results: "+1000 downloads",
      investment: "R$ 8.500",
      timeframe: "6 semanas",
      features: ["GPS", "Pagamentos", "Push", "Chat"],
      demoUrl: "#"
    },
    {
      id: 5,
      title: "Site Institucional",
      category: "landing",
      image: "🏢",
      description: "Website corporativo com design moderno e otimização SEO",
      tech: ["React", "CMS", "SEO"],
      results: "+200% visitas",
      investment: "R$ 2.100",
      timeframe: "2 semanas",
      features: ["CMS", "SEO", "Blog", "Analytics"],
      demoUrl: "#"
    },
    {
      id: 6,
      title: "Marketplace B2B",
      category: "ecommerce",
      image: "🏪",
      description: "Plataforma marketplace para conectar fornecedores e compradores",
      tech: ["React", "Node.js", "Payments"],
      results: "+50 empresas",
      investment: "R$ 12.000",
      timeframe: "8 semanas",
      features: ["Multi-vendor", "Comissões", "Chat", "Analytics"],
      demoUrl: "#"
    }
  ];

  const filteredProjects = activeCategory === "all" 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Portfolio Interativo
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Projetos reais que geraram resultados extraordinários
          </p>
        </div>

        {/* Filtros de Categoria */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 ${
                  activeCategory === category.id 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-blue-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {category.name}
              </Button>
            );
          })}
        </div>

        {/* Grid de Projetos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-center">
                <div className="text-6xl mb-2">{project.image}</div>
                <h3 className="text-xl font-bold text-white">{project.title}</h3>
              </div>
              
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">{project.description}</p>
                
                {/* Tecnologias */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <Badge key={tech} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {project.features.map((feature) => (
                      <div key={feature} className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
                    <div className="text-xs font-medium text-green-600">{project.results}</div>
                  </div>
                  <div className="text-center">
                    <Heart className="h-4 w-4 text-blue-600 mx-auto mb-1" />
                    <div className="text-xs font-medium text-blue-600">{project.investment}</div>
                  </div>
                  <div className="text-center">
                    <Zap className="h-4 w-4 text-purple-600 mx-auto mb-1" />
                    <div className="text-xs font-medium text-purple-600">{project.timeframe}</div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => window.open(project.demoUrl)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver Demo
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
                    onClick={onScheduleClick}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Quero Igual
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Final */}
        <div className="text-center mt-12">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-green-50 to-blue-50 border-0">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Pronto para Seu Projeto?
              </h3>
              <p className="text-gray-600 mb-6">
                Cada projeto é único. Vamos criar algo especial para seu negócio também!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={onScheduleClick}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Começar Meu Projeto
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.open("https://wa.me/5561993521849?text=Olá! Vi o portfolio e gostaria de conversar sobre meu projeto.")}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Falar no WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}