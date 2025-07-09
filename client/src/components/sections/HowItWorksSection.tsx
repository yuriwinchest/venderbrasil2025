// Componente responsável pela seção "Como funciona"
// Responsabilidade: Exibir o processo em 4 passos

export default function HowItWorksSection() {
  const steps = [
    { 
      step: 1, 
      title: "Agende uma Conversa", 
      description: "Conte sobre seu projeto e suas necessidades" 
    },
    { 
      step: 2, 
      title: "Definimos o Projeto", 
      description: "Criamos o escopo e fechamos o orçamento" 
    },
    { 
      step: 3, 
      title: "Desenvolvimento", 
      description: "Criamos seu site com as melhores tecnologias" 
    },
    { 
      step: 4, 
      title: "Entrega e Suporte", 
      description: "Seu site no ar com suporte completo" 
    }
  ];

  return (
    <section className="py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Como funciona?
          </h2>
          <p className="text-lg sm:text-xl text-gray-600">
            Processo simples em 4 passos
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((item) => (
            <div key={item.step} className="text-center">
              <div className="bg-primary w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-white text-lg sm:text-xl font-bold">
                  {item.step}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}