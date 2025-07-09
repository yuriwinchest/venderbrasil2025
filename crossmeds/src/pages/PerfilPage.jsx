import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedicamentos } from '../context/MedicamentosContext';
import { obterTodasPatologias } from '../data/medicamentosCompletos';
import { 
  ArrowLeft, 
  User, 
  Heart,
  Activity,
  Scale,
  Ruler,
  Droplets,
  TrendingUp,
  AlertCircle,
  Save,
  Edit
} from 'lucide-react';

const PerfilPage = () => {
  const navigate = useNavigate();
  const { perfilPaciente, medicamentosUsuario, atualizarPerfil, calcularIMC, calcularHbA1c } = useMedicamentos();
  const [editando, setEditando] = useState(false);
  const [dados, setDados] = useState(perfilPaciente);

  const patologias = obterTodasPatologias(medicamentosUsuario);
  const imc = calcularIMC();
  const hba1c = calcularHbA1c();

  const handleSalvar = () => {
    atualizarPerfil(dados);
    setEditando(false);
  };

  const handleCancelar = () => {
    setDados(perfilPaciente);
    setEditando(false);
  };

  const getIMCClassificacao = (imc) => {
    if (!imc) return null;
    const valor = parseFloat(imc);
    
    if (valor < 18.5) return { texto: 'Abaixo do peso', cor: 'text-blue-600' };
    if (valor < 25) return { texto: 'Peso normal', cor: 'text-green-600' };
    if (valor < 30) return { texto: 'Sobrepeso', cor: 'text-yellow-600' };
    return { texto: 'Obesidade', cor: 'text-red-600' };
  };

  const getHbA1cClassificacao = (hba1c) => {
    if (!hba1c) return null;
    const valor = parseFloat(hba1c);
    
    if (valor < 5.7) return { texto: 'Normal', cor: 'text-green-600' };
    if (valor < 6.5) return { texto: 'Pré-diabetes', cor: 'text-yellow-600' };
    return { texto: 'Diabetes', cor: 'text-red-600' };
  };

  const imcClassificacao = getIMCClassificacao(imc);
  const hba1cClassificacao = getHbA1cClassificacao(hba1c);

  return (
    <div className="crossmeds-container">
      {/* Header */}
      <div className="crossmeds-header">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Perfil do Paciente</h1>
          <button 
            onClick={() => setEditando(!editando)}
            className="text-white"
          >
            <Edit className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Dados Pessoais */}
        <div className="crossmeds-card">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-blue-500" />
            <h2 className="text-lg font-semibold">Dados Pessoais</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                {editando ? (
                  <input
                    type="text"
                    value={dados.nome}
                    onChange={(e) => setDados(prev => ({ ...prev, nome: e.target.value }))}
                    className="crossmeds-input"
                    placeholder="Nome completo"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded border">{dados.nome || 'Não informado'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Idade</label>
                {editando ? (
                  <input
                    type="number"
                    value={dados.idade}
                    onChange={(e) => setDados(prev => ({ ...prev, idade: e.target.value }))}
                    className="crossmeds-input"
                    placeholder="Idade em anos"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded border">
                    {dados.idade ? `${dados.idade} anos` : 'Não informado'}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Alergias</label>
              {editando ? (
                <textarea
                  value={dados.alergias}
                  onChange={(e) => setDados(prev => ({ ...prev, alergias: e.target.value }))}
                  className="crossmeds-input"
                  placeholder="Liste alergias medicamentosas ou alimentares"
                  rows="2"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded border">
                  {dados.alergias || 'Nenhuma alergia informada'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Observações</label>
              {editando ? (
                <textarea
                  value={dados.observacoes}
                  onChange={(e) => setDados(prev => ({ ...prev, observacoes: e.target.value }))}
                  className="crossmeds-input"
                  placeholder="Observações gerais sobre a saúde"
                  rows="3"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded border">
                  {dados.observacoes || 'Nenhuma observação'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Medidas Físicas */}
        <div className="crossmeds-card">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-6 h-6 text-green-500" />
            <h2 className="text-lg font-semibold">Medidas e Exames</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Scale className="w-4 h-4" />
                  Peso (kg)
                </label>
                {editando ? (
                  <input
                    type="number"
                    step="0.1"
                    value={dados.peso}
                    onChange={(e) => setDados(prev => ({ ...prev, peso: e.target.value }))}
                    className="crossmeds-input"
                    placeholder="Ex: 70.5"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded border">
                    {dados.peso ? `${dados.peso} kg` : 'Não informado'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Ruler className="w-4 h-4" />
                  Altura (m)
                </label>
                {editando ? (
                  <input
                    type="number"
                    step="0.01"
                    value={dados.altura}
                    onChange={(e) => setDados(prev => ({ ...prev, altura: e.target.value }))}
                    className="crossmeds-input"
                    placeholder="Ex: 1.70"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded border">
                    {dados.altura ? `${dados.altura} m` : 'Não informado'}
                  </p>
                )}
              </div>
            </div>

            {/* IMC Calculado */}
            {imc && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">IMC Calculado</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-700">{imc}</span>
                  {imcClassificacao && (
                    <span className={`text-sm font-medium ${imcClassificacao.cor}`}>
                      ({imcClassificacao.texto})
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Droplets className="w-4 h-4" />
                  Glicose (mg/dL)
                </label>
                {editando ? (
                  <input
                    type="number"
                    value={dados.glicose}
                    onChange={(e) => setDados(prev => ({ ...prev, glicose: e.target.value }))}
                    className="crossmeds-input"
                    placeholder="Ex: 120"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded border">
                    {dados.glicose ? `${dados.glicose} mg/dL` : 'Não informado'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  Pressão Arterial
                </label>
                {editando ? (
                  <input
                    type="text"
                    value={dados.pressao}
                    onChange={(e) => setDados(prev => ({ ...prev, pressao: e.target.value }))}
                    className="crossmeds-input"
                    placeholder="Ex: 120/80"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded border">
                    {dados.pressao ? `${dados.pressao} mmHg` : 'Não informado'}
                  </p>
                )}
              </div>
            </div>

            {/* HbA1c Estimada */}
            {hba1c && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">HbA1c Estimada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-yellow-700">{hba1c}%</span>
                  {hba1cClassificacao && (
                    <span className={`text-sm font-medium ${hba1cClassificacao.cor}`}>
                      ({hba1cClassificacao.texto})
                    </span>
                  )}
                </div>
                <p className="text-xs text-yellow-600 mt-1">
                  Estimativa baseada na glicose atual. Valores normais: &lt; 5,7%
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Colesterol (mg/dL)</label>
              {editando ? (
                <input
                  type="number"
                  value={dados.colesterol}
                  onChange={(e) => setDados(prev => ({ ...prev, colesterol: e.target.value }))}
                  className="crossmeds-input"
                  placeholder="Ex: 200"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded border">
                  {dados.colesterol ? `${dados.colesterol} mg/dL` : 'Não informado'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Patologias Detectadas */}
        {patologias.length > 0 && (
          <div className="crossmeds-card">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h2 className="text-lg font-semibold">Patologias Relacionadas</h2>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              Baseado nos medicamentos cadastrados:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {patologias.map((patologia, index) => (
                <div key={index} className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-sm text-red-700">{patologia}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        {editando && (
          <div className="flex gap-3">
            <button
              onClick={handleCancelar}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              className="flex-1 crossmeds-button crossmeds-button-primary"
            >
              <Save className="w-5 h-5 mr-2" />
              Salvar
            </button>
          </div>
        )}

        {/* Botão para Relatório */}
        <button
          onClick={() => navigate('/relatorio')}
          className="w-full crossmeds-button crossmeds-button-secondary p-4"
        >
          Gerar Relatório Completo
        </button>
      </div>
    </div>
  );
};

export default PerfilPage;