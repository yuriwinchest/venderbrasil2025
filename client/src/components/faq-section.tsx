import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle } from "lucide-react";

export default function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs = [
    {
      question: "Quanto tempo leva para desenvolver meu site?",
      answer: "O prazo varia conforme a complexidade: Landing pages ficam prontas em 5-7 dias, sites institucionais em 10-15 dias, e e-commerce em 20-30 dias. Prazos expressos disponíveis com acréscimo de 30%."
    },
    {
      question: "Posso fazer alterações durante o desenvolvimento?",
      answer: "Sim! Incluímos até 3 rodadas de revisões no valor do projeto. Alterações adicionais são cobradas à parte para manter a qualidade e prazo de entrega."
    },
    {
      question: "O site será responsivo (mobile-friendly)?",
      answer: "Absolutamente! Todos os nossos projetos são desenvolvidos mobile-first, garantindo perfeita visualização em smartphones, tablets e desktops. É padrão, sem custo adicional."
    },
    {
      question: "Vocês fazem a hospedagem do site?",
      answer: "Sim, oferecemos hospedagem profissional por R$ 29,90/mês incluindo SSL, backups diários, suporte técnico e garantia de 99,9% de uptime. Você também pode usar sua própria hospedagem."
    },
    {
      question: "Como funciona o pagamento?",
      answer: "50% na aprovação do projeto e 50% na entrega final. Aceitamos PIX, cartão de crédito (até 12x) e transferência bancária. Para projetos acima de R$ 5.000, podemos parcelar em até 3x."
    },
    {
      question: "Terei acesso ao código-fonte?",
      answer: "Sim! Após o pagamento final, você recebe todo o código-fonte e documentação. O site é 100% seu, sem dependências ou taxas mensais obrigatórias."
    },
    {
      question: "Vocês oferecem suporte pós-entrega?",
      answer: "Oferecemos 30 dias de suporte gratuito para correção de bugs. Depois disso, temos planos de manutenção a partir de R$ 149/mês incluindo atualizações e suporte prioritário."
    },
    {
      question: "Posso ver exemplos de trabalhos anteriores?",
      answer: "Claro! Temos um portfólio com mais de 200 projetos concluídos. Durante nossa conversa inicial, apresentamos cases similares ao seu segmento de negócio."
    },
    {
      question: "Garantem posicionamento no Google?",
      answer: "Aplicamos todas as melhores práticas de SEO técnico (velocidade, estrutura, meta tags). Posicionamento orgânico depende de conteúdo e concorrência, mas nossos sites sempre saem otimizados."
    },
    {
      question: "E se eu não gostar do resultado final?",
      answer: "Temos 98% de aprovação, mas se não ficar satisfeito, refazemos até acertar ou devolvemos 100% do valor pago. Sua satisfação é nossa prioridade."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <HelpCircle className="inline mr-3 h-8 w-8 text-blue-600" />
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tire todas suas dúvidas antes de começar seu projeto
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-300 border-0 shadow-md"
              >
                <CardContent className="p-0">
                  <button
                    className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                    onClick={() => toggleFAQ(index)}
                  >
                    <h3 className="font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </h3>
                    {openFAQ === index ? (
                      <ChevronUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openFAQ === index && (
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA após FAQ */}
          <div className="text-center mt-12">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Ainda tem dúvidas?
                </h3>
                <p className="text-gray-600 mb-6">
                  Converse diretamente conosco! Respondemos em até 2 horas.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.open("https://wa.me/5561993521849?text=Olá! Tenho algumas dúvidas sobre desenvolvimento de sites.")}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Falar no WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => window.open("tel:+5561993521849")}
                  >
                    📞 Ligar Agora
                  </Button>
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  <p>📱 (61) 99352-1849 | 📧 contato@venderbrasil.com</p>
                  <p className="mt-1">⏰ Atendimento: Segunda a Sábado, 8h às 23h</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}