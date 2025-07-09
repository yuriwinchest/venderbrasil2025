import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Maria Silva",
      company: "Boutique Flor de Lis",
      text: "O site aumentou minhas vendas em 300% em apenas 2 meses. O investimento valeu cada centavo!",
      rating: 5,
      image: "MS",
      project: "E-commerce de Moda"
    },
    {
      name: "João Santos",
      company: "Santos Advocacia",
      text: "Profissionalismo excepcional. Entregaram exatamente o que prometeram, no prazo combinado.",
      rating: 5,
      image: "JS",
      project: "Site Institucional"
    },
    {
      name: "Ana Costa",
      company: "Clínica Bem Estar",
      text: "Agora recebo 50% mais agendamentos pelo site. A interface é linda e muito fácil de usar.",
      rating: 5,
      image: "AC",
      project: "Sistema de Agendamentos"
    },
    {
      name: "Carlos Oliveira",
      company: "Tech Soluções",
      text: "Sistema robusto e escalável. Suporte fantástico mesmo depois da entrega. Recomendo!",
      rating: 5,
      image: "CO",
      project: "Plataforma SaaS"
    },
    {
      name: "Lucia Ferreira",
      company: "Escola Criativa",
      text: "O app revolucionou nossa comunicação com os pais. Interface intuitiva e funcionalidades perfeitas.",
      rating: 5,
      image: "LF",
      project: "App Educacional"
    },
    {
      name: "Roberto Lima",
      company: "Lima Consultorias",
      text: "Triplicamos nossa geração de leads com a landing page. ROI incrível em poucos meses!",
      rating: 5,
      image: "RL",
      project: "Landing Page"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Mais de 200 projetos entregues com excelência
          </p>
          
          <div className="flex justify-center items-center mt-6 space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">98%</div>
              <div className="text-sm text-gray-600">Satisfação</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">15 dias</div>
              <div className="text-sm text-gray-600">Prazo Médio</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">200+</div>
              <div className="text-sm text-gray-600">Projetos</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.image}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.company}</p>
                  </div>
                </div>
                
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <Quote className="h-6 w-6 text-gray-300 mb-2" />
                <p className="text-gray-700 mb-4 italic leading-relaxed">
                  "{testimonial.text}"
                </p>
                
                <div className="pt-3 border-t border-gray-100">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {testimonial.project}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Quer ser nosso próximo caso de sucesso?</p>
          <div className="flex justify-center space-x-4">
            <div className="flex items-center text-green-600">
              <Star className="h-4 w-4 fill-current mr-1" />
              <span className="text-sm font-medium">4.9/5 Google Reviews</span>
            </div>
            <div className="flex items-center text-blue-600">
              <Star className="h-4 w-4 fill-current mr-1" />
              <span className="text-sm font-medium">100% Recomendação</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}