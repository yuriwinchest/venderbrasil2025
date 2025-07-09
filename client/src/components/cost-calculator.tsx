import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Calculator, Globe, Smartphone, ShoppingCart, Users, Zap, Heart } from "lucide-react";

interface CostCalculatorProps {
  onScheduleClick: () => void;
}

export default function CostCalculator({ onScheduleClick }: CostCalculatorProps) {
  const [selectedType, setSelectedType] = useState("landing");
  const [pages, setPages] = useState([3]);
  const [features, setFeatures] = useState<string[]>([]);
  const [urgency, setUrgency] = useState("normal");

  const projectTypes = [
    { id: "landing", name: "Landing Page", icon: Globe, basePrice: 800, description: "Página de conversão" },
    { id: "webapp", name: "Sistema Web", icon: Zap, basePrice: 2500, description: "Aplicação completa" },
    { id: "ecommerce", name: "Loja Virtual", icon: ShoppingCart, basePrice: 3500, description: "E-commerce completo" },
    { id: "mobile", name: "App Mobile", icon: Smartphone, basePrice: 4500, description: "Aplicativo nativo" },
  ];

  const featureOptions = [
    { id: "blog", name: "Blog Integrado", price: 300 },
    { id: "cms", name: "Painel Admin", price: 500 },
    { id: "payment", name: "Pagamentos", price: 800 },
    { id: "analytics", name: "Analytics Avançado", price: 200 },
    { id: "seo", name: "SEO Premium", price: 250 },
    { id: "social", name: "Integração Social", price: 150 },
  ];

  const urgencyOptions = [
    { id: "normal", name: "30-45 dias", multiplier: 1 },
    { id: "fast", name: "15-20 dias", multiplier: 1.3 },
    { id: "express", name: "7-10 dias", multiplier: 1.8 },
  ];

  const calculateTotal = () => {
    const baseProject = projectTypes.find(p => p.id === selectedType);
    if (!baseProject) return 0;

    let total = baseProject.basePrice;
    
    // Adicionar custo por páginas extras
    if (pages[0] > 3) {
      total += (pages[0] - 3) * 200;
    }

    // Adicionar funcionalidades
    features.forEach(featureId => {
      const feature = featureOptions.find(f => f.id === featureId);
      if (feature) total += feature.price;
    });

    // Aplicar multiplicador de urgência
    const urgencyMultiplier = urgencyOptions.find(u => u.id === urgency)?.multiplier || 1;
    total *= urgencyMultiplier;

    return Math.round(total);
  };

  const toggleFeature = (featureId: string) => {
    if (features.includes(featureId)) {
      setFeatures(features.filter(f => f !== featureId));
    } else {
      setFeatures([...features, featureId]);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <Calculator className="inline mr-3 h-8 w-8 text-blue-600" />
            Calculadora de Orçamento
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Monte seu projeto e veja o investimento em tempo real
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl text-center">Seu Projeto Personalizado</CardTitle>
            </CardHeader>
            
            <CardContent className="p-8">
              {/* Tipo de Projeto */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Tipo do Projeto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {projectTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Card 
                        key={type.id}
                        className={`cursor-pointer transition-all hover:scale-105 ${
                          selectedType === type.id 
                            ? 'ring-2 ring-blue-500 bg-blue-50' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => setSelectedType(type.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <Icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                          <h4 className="font-semibold text-sm">{type.name}</h4>
                          <p className="text-xs text-gray-600 mb-2">{type.description}</p>
                          <Badge variant="secondary">A partir de R$ {type.basePrice}</Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Número de Páginas */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Número de Páginas: {pages[0]}
                </h3>
                <Slider
                  value={pages}
                  onValueChange={setPages}
                  max={20}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>1 página</span>
                  <span>20+ páginas</span>
                </div>
              </div>

              {/* Funcionalidades Extras */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Funcionalidades Extras</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {featureOptions.map((feature) => (
                    <div
                      key={feature.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${
                        features.includes(feature.id)
                          ? 'bg-blue-100 border-blue-500'
                          : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => toggleFeature(feature.id)}
                    >
                      <div className="text-sm font-medium">{feature.name}</div>
                      <div className="text-xs text-gray-600">+R$ {feature.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Urgência */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Prazo de Entrega</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {urgencyOptions.map((option) => (
                    <Card
                      key={option.id}
                      className={`cursor-pointer transition-all hover:scale-105 ${
                        urgency === option.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setUrgency(option.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <h4 className="font-semibold">{option.name}</h4>
                        <p className="text-sm text-gray-600">
                          {option.multiplier > 1 ? `+${Math.round((option.multiplier - 1) * 100)}%` : 'Preço normal'}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Resultado */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Investimento Estimado
                  </h3>
                  <div className="text-4xl font-bold text-green-600 mb-4">
                    R$ {calculateTotal().toLocaleString('pt-BR')}
                  </div>
                  <p className="text-gray-600 mb-6">
                    *Valores podem variar conforme complexidade específica
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={onScheduleClick}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white px-8"
                    >
                      <Heart className="mr-2 h-5 w-5" />
                      Quero Este Orçamento
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => window.open(`https://wa.me/5561993521849?text=Olá! Calculei um orçamento de R$ ${calculateTotal().toLocaleString('pt-BR')} para meu projeto. Gostaria de conversar!`)}
                    >
                      <Users className="mr-2 h-5 w-5" />
                      Falar no WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}