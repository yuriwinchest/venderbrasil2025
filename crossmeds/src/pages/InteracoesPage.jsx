import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedicamentos } from '../context/MedicamentosContext';
import { detectarInteracoesMedicamentosas } from '../data/medicamentosCompletos';
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Info,
  Search
} from 'lucide-react';

const InteracoesPage = () => {
  const navigate = useNavigate();
  const { medicamentosUsuario } = useMedicamentos();
  const [mostrarDetalhes, setMostrarDetalhes] = useState({});

  // Usar função importada para detecção de interações
  const detectarInteracoes = () => {
    return detectarInteracoesMedicamentosas(medicamentosUsuario);
  };

  const interacoes = detectarInteracoes();

  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'grave':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'moderado':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'leve':
        return 'text-blue-700 bg-blue-100 border-blue-300';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getNivelIcon = (nivel) => {
    switch (nivel) {
      case 'grave':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'moderado':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'leve':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const toggleDetalhes = (index) => {
    setMostrarDetalhes(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="crossmeds-container">
      {/* Header */}
      <div className="crossmeds-header">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Interações</h1>
          <div className="w-6 h-6" />
        </div>
      </div>

      <div className="p-4">
        {/* Resumo */}
        <div className="crossmeds-card mb-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold">Análise de Interações</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{medicamentosUsuario.length}</div>
              <div className="text-sm text-gray-600">Medicamentos</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{interacoes.length}</div>
              <div className="text-sm text-red-600">Interações Detectadas</div>
            </div>
          </div>
        </div>

        {/* Lista de Medicamentos sem Interações */}
        {medicamentosUsuario.length === 0 && (
          <div className="crossmeds-card text-center py-8">
            <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Nenhum medicamento cadastrado
            </h3>
            <p className="text-gray-500 mb-4">
              Adicione medicamentos para verificar possíveis interações
            </p>
            <button 
              onClick={() => navigate('/medicamentos')}
              className="crossmeds-button crossmeds-button-primary"
            >
              Adicionar Medicamentos
            </button>
          </div>
        )}

        {/* Lista de Interações */}
        {interacoes.length === 0 && medicamentosUsuario.length > 0 && (
          <div className="crossmeds-card text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-medium text-green-700 mb-2">
              Nenhuma interação detectada
            </h3>
            <p className="text-green-600">
              Seus medicamentos parecem seguros quando tomados juntos
            </p>
          </div>
        )}

        {interacoes.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Interações Encontradas
            </h3>
            
            {interacoes.map((interacao, index) => (
              <div key={index} className="crossmeds-card">
                <div 
                  className={`p-3 border rounded-lg ${getNivelColor(interacao.nivel)} mb-3`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getNivelIcon(interacao.nivel)}
                    <span className="font-semibold capitalize">
                      Interação {interacao.nivel}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="font-medium">{interacao.medicamento1.produto}</span>
                    <span className="mx-2 text-gray-500">+</span>
                    <span className="font-medium">{interacao.medicamento2.produto}</span>
                  </div>
                  
                  <p className="text-sm">{interacao.descricao}</p>
                </div>

                <button
                  onClick={() => toggleDetalhes(index)}
                  className="text-blue-600 text-sm font-medium mb-3"
                >
                  {mostrarDetalhes[index] ? 'Ocultar detalhes' : 'Ver detalhes'}
                </button>

                {mostrarDetalhes[index] && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Recomendação:</h4>
                      <p className="text-sm text-blue-700">{interacao.recomendacao}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="border rounded-lg p-3">
                        <h5 className="font-medium mb-1">{interacao.medicamento1.produto}</h5>
                        <p className="text-xs text-gray-600">{interacao.medicamento1.substancia}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Como tomar: {interacao.medicamento1.modoTomar}
                        </p>
                      </div>
                      
                      <div className="border rounded-lg p-3">
                        <h5 className="font-medium mb-1">{interacao.medicamento2.produto}</h5>
                        <p className="text-xs text-gray-600">{interacao.medicamento2.substancia}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Como tomar: {interacao.medicamento2.modoTomar}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Observações importantes */}
        {medicamentosUsuario.length > 0 && (
          <div className="crossmeds-card mt-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-500" />
              Observações Importantes
            </h3>
            
            <div className="space-y-2 text-sm text-gray-700">
              <p>• Esta análise é baseada em interações conhecidas comuns</p>
              <p>• Sempre consulte seu médico antes de fazer alterações</p>
              <p>• Informe todos os medicamentos ao seu médico, incluindo vitaminas</p>
              <p>• Mantenha um intervalo entre medicamentos quando recomendado</p>
              <p>• Em caso de dúvidas, procure orientação farmacêutica</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteracoesPage;