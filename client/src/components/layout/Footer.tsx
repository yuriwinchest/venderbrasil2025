// Componente responsável pelo rodapé da página
// Responsabilidade: Exibir informações de contato e links do rodapé

import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Informações de Contato */}
          <div>
            <h3 className="text-xl font-bold mb-4">Dim Winchester</h3>
            <p className="text-gray-300 mb-4">
              Desenvolvedor Full Stack especializado em soluções web que geram resultados.
            </p>
            <div className="space-y-2">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-sm">(61) 99352-1849</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm">dimwinchester2025@gmail.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">Brasília, DF</span>
              </div>
            </div>
          </div>

          {/* Serviços */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Serviços</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Sites Institucionais</li>
              <li>E-commerce</li>
              <li>Aplicativos Mobile</li>
              <li>Sistemas Web</li>
              <li>Consultoria Tech</li>
            </ul>
          </div>

          {/* Links Úteis */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#servicos" className="hover:text-white transition-colors">Serviços</a></li>
              <li><a href="#experiencia" className="hover:text-white transition-colors">Experiência</a></li>
              <li><a href="#portfolio" className="hover:text-white transition-colors">Portfólio</a></li>
              <li><a href="#contato" className="hover:text-white transition-colors">Contato</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Dim Winchester. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}