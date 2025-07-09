import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedicamentos } from '../context/MedicamentosContext';
import { 
  ArrowLeft, 
  Pill, 
  AlertTriangle, 
  Calendar,
  Clock,
  TrendingUp,
  Bell,
  Heart,
  Activity,
  Target,
  CheckCircle,
  X,
  Plus
} from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { medicamentosUsuario, removerMedicamento } = useMedicamentos();
  const [showNotifications, setShowNotifications] = useState(false);
  const [error, setError] = useState('');

  // Cálculos de métricas
  const totalMedicamentos = medicamentosUsuario.length;
  const interacoesDetectadas = medicamentosUsuario.filter(med => med.temInteracao).length;
  const adesaoTratamento = totalMedicamentos > 0 ? 65 : 0; // Simulado
  const dosesPerdidasSemana = 0; // Simulado

  // Próximas medicações (simulado)
  const proximasMedicacoes = [
    { nome: 'Losartana 50mg', horario: '08:00', tomado: false },
    { nome: 'Levotiroxina', horario: '07:30', tomado: true },
    { nome: 'Metformina', horario: '12:00', tomado: false }
  ];

  const atividades = [
    { tipo: 'medicamento', texto: 'Tomou Losartana 50mg', horario: '08:00' },
    { tipo: 'exame', texto: 'Levoteroxina enviado', horario: '07:30' }
  ];

  const handleRemoverMedicacao = async (medicamentoId) => {
    try {
      setError('');
      await removerMedicamento(medicamentoId);
    } catch (err) {
      setError('Não foi possível remover a medicação');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="crossmeds-container" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="crossmeds-header" style={{ background: 'transparent', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/')} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-white">Dashboard CrossMeds</h1>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-white relative"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">2</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-4 mb-4 bg-red-500 text-white p-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Adesão ao Tratamento */}
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-6 h-6 text-blue-500" />
              <span className="text-2xl font-bold text-blue-600">65%</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Adesão ao Tratamento</h3>
            <p className="text-xs text-gray-500">Meta: 95% | Semanal: 95%</p>
          </div>

          {/* Interações Detectadas */}
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <span className="text-2xl font-bold text-orange-600">{interacoesDetectadas}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Interações Detectadas</h3>
            <p className="text-xs text-gray-500">{totalMedicamentos} medicações tomadas</p>
          </div>

          {/* Doses Perdidas */}
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-6 h-6 text-green-500" />
              <span className="text-2xl font-bold text-green-600">{dosesPerdidasSemana}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Doses Perdidas</h3>
            <p className="text-xs text-gray-500">Últimos 7 dias</p>
          </div>

          {/* Monitoramento */}
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-6 h-6 text-red-500" />
              <Activity className="w-4 h-4 text-red-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-700">Monitoramento</h3>
            <p className="text-xs text-gray-500">Controle Médico</p>
            <p className="text-xs text-gray-500">Pressão Arterial</p>
          </div>
        </div>

        {/* Progresso de Adesão */}
        <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Progresso de Adesão</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Adesão Semanal</span>
                <span>65%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-bold text-green-600">0</div>
                <div className="text-gray-500">Tomadas hoje</div>
              </div>
              <div>
                <div className="font-bold text-blue-600">2</div>
                <div className="text-gray-500">Previstas (7) Dias</div>
              </div>
              <div>
                <div className="font-bold text-orange-600">1</div>
                <div className="text-gray-500">Total perdidas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Próximas Medicações */}
        <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💊 Próximas Medicações</h3>
          <div className="space-y-3">
            {proximasMedicacoes.map((med, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${med.tomado ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                  <div>
                    <p className="font-medium text-gray-800">{med.nome}</p>
                    <p className="text-sm text-gray-500">{med.horario}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoverMedicacao(med.nome)}
                  className={`p-2 rounded-full ${med.tomado ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}
                >
                  {med.tomado ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📱 Atividade Recente</h3>
          <div className="space-y-3">
            {atividades.map((atividade, index) => (
              <div key={index} className="flex items-center space-x-3 p-2">
                <div className={`w-2 h-2 rounded-full ${atividade.tipo === 'medicamento' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{atividade.texto}</p>
                  <p className="text-xs text-gray-500">{atividade.horario}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teste de Notificações */}
        <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🔔 Teste de Notificações</h3>
          <p className="text-sm text-gray-600 mb-3">Horário atual: 22:16</p>
          <p className="text-xs text-gray-500 mb-4">Use os botões abaixo para notificações de medicamentos hoje.</p>
          <div className="space-y-2">
            <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg text-sm">
              + Criar Medicação AGORA
            </button>
            <button className="w-full bg-green-100 text-green-700 py-2 px-4 rounded-lg text-sm">
              ✓ Criar para 21 minuto
            </button>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl p-6 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notificações</h3>
              <button onClick={() => setShowNotifications(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-medium text-blue-800">Hora do medicamento</p>
                <p className="text-sm text-blue-600">Losartana 50mg - 08:00</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800">Medicamento tomado</p>
                <p className="text-sm text-green-600">Levotiroxina - 07:30</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;