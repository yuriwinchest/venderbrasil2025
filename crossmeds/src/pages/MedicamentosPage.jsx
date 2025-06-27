import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedicamentos } from '../context/MedicamentosContext';
import { autocompletarMedicamento, extrairDosagemSugerida, frequenciasComuns, horariosSugeridos } from '../data/medicamentosCompletos';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Trash2, 
  Edit3,
  Clock,
  AlertTriangle
} from 'lucide-react';

const MedicamentosPage = () => {
  const navigate = useNavigate();
  const { medicamentosUsuario, adicionarMedicamento, removerMedicamento } = useMedicamentos();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [termoBusca, setTermoBusca] = useState('');
  const [medicamentoSelecionado, setMedicamentoSelecionado] = useState(null);
  const [resultadosBusca, setResultadosBusca] = useState([]);
  const [formulario, setFormulario] = useState({
    dosagem: '',
    frequencia: '',
    horarios: [''],
    viaAdministracao: 'oral',
    observacoes: '',
    lembretes: true
  });

  const handleBuscarMedicamento = (termo) => {
    setTermoBusca(termo);
    if (termo.length >= 1) { // Para idosos: buscar desde 1 letra
      const resultados = autocompletarMedicamento(termo);
      setResultadosBusca(resultados);
    } else {
      setResultadosBusca([]);
    }
  };

  const handleSelecionarMedicamento = (medicamento) => {
    setMedicamentoSelecionado(medicamento);
    setTermoBusca(medicamento.produto);
    setResultadosBusca([]);
    
    // Preencher dosagem automaticamente se disponível na apresentação
    const dosagem = extrairDosagemSugerida(medicamento.apresentacao);
    if (dosagem) {
      setFormulario(prev => ({ ...prev, dosagem }));
    }
  };

  // Função removida - agora usando da base de dados

  const handleAdicionarHorario = () => {
    setFormulario(prev => ({
      ...prev,
      horarios: [...prev.horarios, '']
    }));
  };

  const handleRemoverHorario = (index) => {
    setFormulario(prev => ({
      ...prev,
      horarios: prev.horarios.filter((_, i) => i !== index)
    }));
  };

  const handleHorarioChange = (index, valor) => {
    setFormulario(prev => ({
      ...prev,
      horarios: prev.horarios.map((h, i) => i === index ? valor : h)
    }));
  };

  const handleSalvarMedicamento = () => {
    if (!medicamentoSelecionado || !formulario.dosagem) {
      alert('Selecione um medicamento e informe a dosagem');
      return;
    }

    const novoMedicamento = {
      ...medicamentoSelecionado,
      ...formulario,
      horarios: formulario.horarios.filter(h => h.trim() !== '')
    };

    adicionarMedicamento(novoMedicamento);
    
    // Resetar formulário
    setMostrarFormulario(false);
    setMedicamentoSelecionado(null);
    setTermoBusca('');
    setFormulario({
      dosagem: '',
      frequencia: '',
      horarios: [''],
      viaAdministracao: 'oral',
      observacoes: '',
      lembretes: true
    });
  };

  return (
    <div className="crossmeds-container">
      {/* Header */}
      <div className="crossmeds-header">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Medicamentos</h1>
          <button 
            onClick={() => setMostrarFormulario(true)}
            className="text-white"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Lista de medicamentos */}
      <div className="p-4">
        {medicamentosUsuario.length === 0 ? (
          <div className="crossmeds-card text-center py-8">
            <div className="text-gray-500 mb-4">
              <Search className="w-12 h-12 mx-auto mb-2" />
              <p>Nenhum medicamento cadastrado</p>
            </div>
            <button 
              onClick={() => setMostrarFormulario(true)}
              className="crossmeds-button crossmeds-button-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Primeiro Medicamento
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {medicamentosUsuario.map((med) => (
              <div key={med.id} className="crossmeds-card">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{med.produto}</h3>
                    <p className="text-sm text-gray-600">{med.substancia}</p>
                    <p className="text-sm text-gray-500">{med.laboratorio}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-blue-500">
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => removerMedicamento(med.id)}
                      className="text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Dosagem:</span>
                    <span className="ml-2">{med.dosagem}</span>
                  </div>
                  <div>
                    <span className="font-medium">Frequência:</span>
                    <span className="ml-2">{med.frequencia}</span>
                  </div>
                </div>

                {med.horarios && med.horarios.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Horários:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {med.horarios.map((horario, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                          {horario}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">
                    <strong>Como tomar:</strong> {med.modoTomar}
                  </p>
                  {med.observacao && (
                    <p className="text-xs text-gray-600 mt-1">
                      <strong>Observação:</strong> {med.observacao}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de adicionar medicamento */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Adicionar Medicamento</h2>
              
              {/* Busca de medicamento */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Nome do Medicamento
                </label>
                <input
                  type="text"
                  value={termoBusca}
                  onChange={(e) => handleBuscarMedicamento(e.target.value)}
                  placeholder="Digite o nome do medicamento..."
                  className="crossmeds-input"
                />
                
                {/* Resultados da busca */}
                {resultadosBusca.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                    {resultadosBusca.map((med) => (
                      <button
                        key={med.id}
                        onClick={() => handleSelecionarMedicamento(med)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{med.produto}</div>
                        <div className="text-sm text-gray-600">{med.substancia}</div>
                        <div className="text-xs text-gray-500">{med.laboratorio}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Medicamento selecionado */}
              {medicamentoSelecionado && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium">{medicamentoSelecionado.produto}</div>
                  <div className="text-sm text-gray-600">{medicamentoSelecionado.substancia}</div>
                  <div className="text-xs text-gray-500">
                    {medicamentoSelecionado.apresentacao}
                  </div>
                </div>
              )}

              {/* Dosagem */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Dosagem
                </label>
                <input
                  type="text"
                  value={formulario.dosagem}
                  onChange={(e) => setFormulario(prev => ({ ...prev, dosagem: e.target.value }))}
                  placeholder="Ex: 500mg, 1 comprimido"
                  className="crossmeds-input"
                />
              </div>

              {/* Frequência */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Frequência
                </label>
                <select
                  value={formulario.frequencia}
                  onChange={(e) => {
                    const freq = e.target.value;
                    setFormulario(prev => ({ 
                      ...prev, 
                      frequencia: freq,
                      horarios: horariosSugeridos[freq] || ['']
                    }));
                  }}
                  className="crossmeds-input"
                >
                  <option value="">Selecione...</option>
                  {frequenciasComuns.map(freq => (
                    <option key={freq} value={freq}>{freq}</option>
                  ))}
                </select>
              </div>

              {/* Horários */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Horários
                </label>
                {formulario.horarios.map((horario, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="time"
                      value={horario}
                      onChange={(e) => handleHorarioChange(index, e.target.value)}
                      className="crossmeds-input flex-1"
                    />
                    {formulario.horarios.length > 1 && (
                      <button
                        onClick={() => handleRemoverHorario(index)}
                        className="text-red-500 px-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleAdicionarHorario}
                  className="text-blue-500 text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar horário
                </button>
              </div>

              {/* Lembretes */}
              <div className="mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formulario.lembretes}
                    onChange={(e) => setFormulario(prev => ({ ...prev, lembretes: e.target.checked }))}
                  />
                  <span className="text-sm">Receber lembretes</span>
                </label>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarFormulario(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarMedicamento}
                  className="flex-1 crossmeds-button crossmeds-button-primary"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicamentosPage;