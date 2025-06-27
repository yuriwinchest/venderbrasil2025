// Componente responsável pela navegação principal
// Responsabilidade: Gerenciar a navegação e estrutura da barra superior

interface NavigationProps {
  onScheduleClick?: () => void;
}

export default function Navigation({ onScheduleClick }: NavigationProps) {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-14 sm:h-16">
          <div className="flex items-center">
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
              Dim Winchester
            </span>
          </div>
          <div className="hidden sm:flex sm:ml-6 md:ml-10 items-baseline space-x-2 sm:space-x-4">
            <a 
              href="#servicos" 
              className="text-gray-600 hover:text-primary px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium"
            >
              Serviços
            </a>
            <a 
              href="#experiencia" 
              className="text-gray-600 hover:text-primary px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium"
            >
              Experiência
            </a>
            <a 
              href="#portfolio" 
              className="text-gray-600 hover:text-primary px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium"
            >
              Portfólio
            </a>
            <a 
              href="#contato" 
              className="text-gray-600 hover:text-primary px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium"
            >
              Contato
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}