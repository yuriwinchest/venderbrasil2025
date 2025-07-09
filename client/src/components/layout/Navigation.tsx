// Componente responsável pela navegação principal
// Responsabilidade: Gerenciar a navegação e estrutura da barra superior

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  onScheduleClick?: () => void;
}

export default function Navigation({ onScheduleClick }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { href: "#servicos", label: "Serviços" },
    { href: "#experiencia", label: "Experiência" },
    { href: "#portfolio", label: "Portfólio" },
    { href: "#contato", label: "Contato" }
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo - Mobile e Desktop */}
          <div className="flex items-center">
            <span className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dim Winchester
            </span>
          </div>
          
          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <a 
                key={item.href}
                href={item.href} 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-blue-50"
              >
                {item.label}
              </a>
            ))}
            <Button 
              onClick={onScheduleClick}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105"
            >
              Agendar Reunião
            </Button>
          </div>

          {/* Botão Menu Mobile */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </Button>
          </div>
        </div>

        {/* Menu Mobile Expandido */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {menuItems.map((item) => (
                <a 
                  key={item.href}
                  href={item.href} 
                  className="block text-gray-700 hover:text-blue-600 py-3 px-4 rounded-lg text-base font-medium transition-colors duration-200 hover:bg-blue-50 border-b border-gray-100 last:border-0"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Button 
                onClick={() => {
                  onScheduleClick?.();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-xl font-medium text-lg transition-all duration-200 transform active:scale-95 mt-4"
              >
                Agendar Reunião
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}