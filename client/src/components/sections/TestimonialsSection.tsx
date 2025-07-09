// Componente responsável pela seção de depoimentos
// Responsabilidade: Exibir depoimentos de clientes

import { Star } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Maria Silva",
      company: "Loja Online Fashion",
      text: "O site desenvolvido pelo Dim superou nossas expectativas. Nossas vendas online aumentaram 40% no primeiro mês!",
      rating: 5
    },
    {
      name: "João Santos",
      company: "Consultoria Empresarial",
      text: "Profissional excepcional! Entregou tudo no prazo e com qualidade impecável. Recomendo sem hesitar.",
      rating: 5
    },
    {
      name: "Ana Costa",
      company: "Clínica Médica",
      text: "Sistema de agendamento perfeito para nossa clínica. Reduziu 80% das ligações para marcar consultas.",
      rating: 5
    }
  ];

  return (
    <section className="py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-lg sm:text-xl text-gray-600">
            Depoimentos reais de clientes satisfeitos
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-600">{testimonial.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}