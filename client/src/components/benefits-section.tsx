import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Smartphone, Shield } from "lucide-react";

export default function BenefitsSection() {
  const benefits = [
    {
      icon: Rocket,
      title: "Entrega Rápida",
      description: "Seu site fica pronto em até 7 dias úteis, sem complicação",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: Smartphone,
      title: "100% Responsivo",
      description: "Funciona perfeitamente em celular, tablet e desktop",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      icon: Shield,
      title: "Garantia Total",
      description: "30 dias de suporte gratuito e correções incluídas",
      bgColor: "bg-emerald-100",
      iconColor: "text-emerald-600"
    }
  ];

  return (
    <section id="servicos" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Por que escolher nossos serviços?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Mais de 40 sites entregues com satisfação garantida
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="transition-transform hover:scale-105 shadow-lg border-0">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 ${benefit.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <Icon className={`h-8 w-8 ${benefit.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
