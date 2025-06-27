import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedicamentos } from '../context/MedicamentosContext';
import { 
  Pill, 
  AlertTriangle, 
  User, 
  FileText,
  Plus,
  Search,
  Shield
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const { medicamentosUsuario } = useMedicamentos();

  const totalMedicamentos = medicamentosUsuario.length;
  const medicamentosComInteracao = medicamentosUsuario.filter(med => 
    med.temInteracao || false
  ).length;

  const obterSaudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Bom dia!';
    if (hora < 18) return 'Boa tarde!';
    return 'Boa noite!';
  };

  return (
    <div className="crossmeds-container">
      {/* Header com logo e saudação */}
      <div className="crossmeds-header">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">CrossMeds</h1>
        <p className="text-blue-100 mt-2">Gerenciador de Medicamentos</p>
        <p className="text-sm text-blue-200 mt-1">
          {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {obterSaudacao()}
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <div className="crossmeds-card text-center">
          <Pill className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{totalMedicamentos}</div>
          <div className="text-sm text-gray-600">Medicamentos</div>
        </div>
        
        <div className="crossmeds-card text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{medicamentosComInteracao}</div>
          <div className="text-sm text-gray-600">Interações</div>
        </div>
      </div>

      {/* Próximas doses */}
      <div className="crossmeds-card">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Pill className="w-5 h-5 mr-2 text-blue-500" />
          Próximas Doses
        </h3>
        
        {medicamentosUsuario.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Nenhum medicamento cadastrado
          </p>
        ) : (
          <div className="space-y-3">
            {medicamentosUsuario.slice(0, 3).map((med) => (
              <div key={med.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{med.produto}</div>
                  <div className="text-sm text-gray-600">{med.dosagem} - {med.horarios?.[0] || '08:00'}</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-500 text-white text-sm rounded">
                    Tomar
                  </button>
                  <button className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded">
                    Pendente
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Atalhos rápidos */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <button 
          onClick={() => navigate('/medicamentos')}
          className="crossmeds-button crossmeds-button-primary p-6"
        >
          <Plus className="w-6 h-6" />
          <span>Adicionar Medicamento</span>
        </button>
        
        <button 
          onClick={() => navigate('/interacoes')}
          className="crossmeds-button crossmeds-button-secondary p-6"
        >
          <Search className="w-6 h-6" />
          <span>Verificar Interações</span>
        </button>
      </div>

      {/* Navegação inferior */}
      <div className="crossmeds-nav">
        <div className="flex justify-around items-center px-4">
          <button 
            onClick={() => navigate('/')}
            className="flex flex-col items-center p-2 text-blue-500"
          >
            <Pill className="w-6 h-6" />
            <span className="text-xs mt-1">Medicamentos</span>
          </button>
          
          <button 
            onClick={() => navigate('/interacoes')}
            className="flex flex-col items-center p-2 text-gray-400"
          >
            <AlertTriangle className="w-6 h-6" />
            <span className="text-xs mt-1">Interações</span>
          </button>
          
          <button 
            onClick={() => navigate('/perfil')}
            className="flex flex-col items-center p-2 text-gray-400"
          >
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Perfil</span>
          </button>
          
          <button 
            onClick={() => navigate('/relatorio')}
            className="flex flex-col items-center p-2 text-gray-400"
          >
            <FileText className="w-6 h-6" />
            <span className="text-xs mt-1">Relatório</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;