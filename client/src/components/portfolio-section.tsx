import { Card, CardContent } from "@/components/ui/card";

export default function PortfolioSection() {
  const portfolio = [
    {
      title: "Amor Beleza",
      description: "E-commerce de produtos de beleza com sistema completo",
      price: "R$ 800",
      duration: "7 dias",
      link: "https://www.amorbeleza.com.br/",
      category: "E-commerce"
    },
    {
      title: "O Cheirosa",
      description: "Loja virtual de perfumes e cosméticos premium",
      price: "R$ 750",
      duration: "6 dias",
      link: "https://ocheirosa.com.br/",
      category: "E-commerce"
    },
    {
      title: "Dermabox",
      description: "Plataforma de produtos dermatológicos especializados",
      price: "R$ 900",
      duration: "8 dias",
      link: "https://www.dermabox.com.br/",
      category: "E-commerce"
    },
    {
      title: "Pink Glamm",
      description: "Boutique online de moda e acessórios femininos",
      price: "R$ 650",
      duration: "5 dias",
      link: "https://pinkglamm.com.br/",
      category: "E-commerce"
    },
    {
      title: "Loja Havi",
      description: "Marketplace de produtos variados com checkout otimizado",
      price: "R$ 700",
      duration: "6 dias",
      link: "https://lojahavi.com/",
      category: "E-commerce"
    },
    {
      title: "Dalla Shop",
      description: "E-commerce moderno com design responsivo",
      price: "R$ 600",
      duration: "5 dias",
      link: "https://www.dalla.shop/",
      category: "E-commerce"
    },
    {
      title: "Beleza Exterior",
      description: "Loja especializada em produtos de beleza exterior",
      price: "R$ 750",
      duration: "6 dias",
      link: "https://www.lojabelezaexterior.com.br/",
      category: "E-commerce"
    },
    {
      title: "H3 Consultoria",
      description: "Site institucional para empresa de consultoria",
      price: "R$ 500",
      duration: "4 dias",
      link: "https://h3.com.br/",
      category: "Institucional"
    },
    {
      title: "Natascha Ortuno",
      description: "Portfólio profissional com design elegante",
      price: "R$ 450",
      duration: "3 dias",
      link: "https://nataschaortuno.com/",
      category: "Portfólio"
    },
    {
      title: "CrossMeds",
      description: "Plataforma médica com sistema de agendamento",
      price: "R$ 1200",
      duration: "10 dias",
      link: "https://crossmeds.com.br/",
      category: "Plataforma"
    }
  ];

  return (
    <section id="portfolio" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Projetos Realizados
          </h2>
          <p className="text-xl text-gray-600">
            Veja alguns dos nossos trabalhos
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {portfolio.slice(0, 9).map((project, index) => (
            <Card key={index} className="overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-gray-200 group bg-white shadow-lg">
              <div className="relative">
                <div className="w-full h-56 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-indigo-700/90"></div>
                  <div className="text-center relative z-10">
                    <div className="text-2xl font-bold text-white mb-3 drop-shadow-lg">{project.title}</div>
                    <div className="inline-block text-sm text-white font-semibold bg-white/20 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/30">
                      {project.category}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 w-16 h-16 bg-white/15 rounded-full backdrop-blur-sm border border-white/30"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 bg-white/15 rounded-full backdrop-blur-sm border border-white/30"></div>
                  
                  {/* Pattern overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-8 left-8 w-4 h-4 border-2 border-white rotate-45"></div>
                    <div className="absolute top-16 right-12 w-3 h-3 bg-white rounded-full"></div>
                    <div className="absolute bottom-12 left-16 w-2 h-8 bg-white/50 rounded-full"></div>
                    <div className="absolute bottom-8 right-8 w-6 h-6 border border-white rounded-full"></div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all duration-300 shadow-xl transform translate-y-4 group-hover:translate-y-0 border-2 border-white/20 backdrop-blur-sm"
                  >
                    Ver Site →
                  </a>
                </div>
              </div>
              <CardContent className="p-6 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                  <span className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    {project.category}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed font-medium mb-4">{project.description}</p>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Prazo:</span> {project.duration}
                  </div>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Ver Projeto
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {portfolio.length > 9 && (
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">E mais {portfolio.length - 9} projetos entregues com sucesso!</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-2xl mx-auto">
              {portfolio.slice(9).map((project, index) => (
                <a
                  key={index + 9}
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                >
                  <div className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                    {project.title}
                  </div>
                  <div className="text-xs font-medium text-gray-600 mt-1 group-hover:text-blue-600">{project.category}</div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
