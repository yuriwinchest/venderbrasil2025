import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMedicamentos } from '../context/MedicamentosContext';
import { obterTodasPatologias } from '../data/medicamentosCompletos';
import { 
  ArrowLeft, 
  Download, 
  Printer,
  FileText,
  Calendar,
  User,
  Pill,
  AlertTriangle,
  Heart,
  Activity
} from 'lucide-react';

const RelatorioPage = () => {
  const navigate = useNavigate();
  const { perfilPaciente, medicamentosUsuario, calcularIMC, calcularHbA1c } = useMedicamentos();
  
  const patologias = obterTodasPatologias(medicamentosUsuario);
  const imc = calcularIMC();
  const hba1c = calcularHbA1c();
  const dataAtual = new Date().toLocaleDateString('pt-BR');

  const gerarPDF = async () => {
    // Implementação simplificada para gerar PDF
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();
      
      // Cabeçalho
      doc.setFontSize(18);
      doc.text('RELATÓRIO MÉDICO - CROSSMEDS', 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Data: ${dataAtual}`, 20, 35);
      
      let yPosition = 50;
      
      // Dados do Paciente
      doc.setFontSize(14);
      doc.text('DADOS DO PACIENTE', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      if (perfilPaciente.nome) {
        doc.text(`Nome: ${perfilPaciente.nome}`, 20, yPosition);
        yPosition += 7;
      }
      if (perfilPaciente.idade) {
        doc.text(`Idade: ${perfilPaciente.idade} anos`, 20, yPosition);
        yPosition += 7;
      }
      
      // Medidas
      if (perfilPaciente.peso && perfilPaciente.altura) {
        doc.text(`Peso: ${perfilPaciente.peso} kg | Altura: ${perfilPaciente.altura} m`, 20, yPosition);
        yPosition += 7;
        if (imc) {
          doc.text(`IMC: ${imc}`, 20, yPosition);
          yPosition += 7;
        }
      }
      
      // Exames
      if (perfilPaciente.glicose) {
        doc.text(`Glicose: ${perfilPaciente.glicose} mg/dL`, 20, yPosition);
        if (hba1c) {
          doc.text(` | HbA1c estimada: ${hba1c}%`, 100, yPosition);
        }
        yPosition += 7;
      }
      
      if (perfilPaciente.pressao) {
        doc.text(`Pressão Arterial: ${perfilPaciente.pressao} mmHg`, 20, yPosition);
        yPosition += 7;
      }
      
      if (perfilPaciente.colesterol) {
        doc.text(`Colesterol: ${perfilPaciente.colesterol} mg/dL`, 20, yPosition);
        yPosition += 7;
      }
      
      yPosition += 10;
      
      // Medicamentos
      doc.setFontSize(14);
      doc.text('MEDICAMENTOS EM USO', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(9);
      medicamentosUsuario.forEach((med, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(`${index + 1}. ${med.produto}`, 20, yPosition);
        yPosition += 5;
        doc.text(`   Substância: ${med.substancia}`, 25, yPosition);
        yPosition += 5;
        doc.text(`   Dosagem: ${med.dosagem || 'Não informada'}`, 25, yPosition);
        yPosition += 5;
        doc.text(`   Frequência: ${med.frequencia || 'Não informada'}`, 25, yPosition);
        yPosition += 5;
        if (med.horarios && med.horarios.length > 0) {
          doc.text(`   Horários: ${med.horarios.join(', ')}`, 25, yPosition);
          yPosition += 5;
        }
        doc.text(`   Como tomar: ${med.modoTomar}`, 25, yPosition);
        yPosition += 8;
      });
      
      // Patologias
      if (patologias.length > 0) {
        yPosition += 5;
        doc.setFontSize(14);
        doc.text('PATOLOGIAS RELACIONADAS', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        patologias.forEach((patologia, index) => {
          doc.text(`• ${patologia}`, 25, yPosition);
          yPosition += 7;
        });
      }
      
      // Alergias
      if (perfilPaciente.alergias) {
        yPosition += 5;
        doc.setFontSize(14);
        doc.text('ALERGIAS', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        const alergias = doc.splitTextToSize(perfilPaciente.alergias, 170);
        doc.text(alergias, 20, yPosition);
        yPosition += alergias.length * 5;
      }
      
      // Observações
      if (perfilPaciente.observacoes) {
        yPosition += 5;
        doc.setFontSize(14);
        doc.text('OBSERVAÇÕES', 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        const observacoes = doc.splitTextToSize(perfilPaciente.observacoes, 170);
        doc.text(observacoes, 20, yPosition);
      }
      
      // Rodapé
      doc.setFontSize(8);
      doc.text('Relatório gerado pelo CrossMeds - Gerenciador de Medicamentos', 20, 280);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 285);
      
      doc.save(`relatorio-crossmeds-${dataAtual.replace(/\//g, '-')}.pdf`);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  const imprimirRelatorio = () => {
    window.print();
  };

  return (
    <div className="crossmeds-container">
      {/* Header */}
      <div className="crossmeds-header no-print">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Relatório</h1>
          <div className="flex gap-2">
            <button 
              onClick={imprimirRelatorio}
              className="text-white"
            >
              <Printer className="w-6 h-6" />
            </button>
            <button 
              onClick={gerarPDF}
              className="text-white"
            >
              <Download className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo do Relatório */}
      <div className="p-4 print-content">
        {/* Cabeçalho do Relatório */}
        <div className="crossmeds-card mb-4 print-header">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-blue-500" />
              <h1 className="text-2xl font-bold">RELATÓRIO MÉDICO</h1>
            </div>
            <p className="text-lg text-gray-600">CrossMeds - Gerenciador de Medicamentos</p>
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2 mt-2">
              <Calendar className="w-4 h-4" />
              Data: {dataAtual}
            </p>
          </div>
        </div>

        {/* Dados do Paciente */}
        <div className="crossmeds-card mb-4">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold">DADOS DO PACIENTE</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Nome:</strong> {perfilPaciente.nome || 'Não informado'}</p>
              <p><strong>Idade:</strong> {perfilPaciente.idade ? `${perfilPaciente.idade} anos` : 'Não informado'}</p>
            </div>
            <div>
              <p><strong>Peso:</strong> {perfilPaciente.peso ? `${perfilPaciente.peso} kg` : 'Não informado'}</p>
              <p><strong>Altura:</strong> {perfilPaciente.altura ? `${perfilPaciente.altura} m` : 'Não informado'}</p>
              {imc && <p><strong>IMC:</strong> {imc}</p>}
            </div>
          </div>

          {(perfilPaciente.glicose || perfilPaciente.pressao || perfilPaciente.colesterol) && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Exames Laboratoriais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {perfilPaciente.glicose && (
                  <p><strong>Glicose:</strong> {perfilPaciente.glicose} mg/dL {hba1c && `(HbA1c: ${hba1c}%)`}</p>
                )}
                {perfilPaciente.pressao && (
                  <p><strong>Pressão:</strong> {perfilPaciente.pressao} mmHg</p>
                )}
                {perfilPaciente.colesterol && (
                  <p><strong>Colesterol:</strong> {perfilPaciente.colesterol} mg/dL</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Medicamentos */}
        <div className="crossmeds-card mb-4">
          <div className="flex items-center gap-3 mb-4">
            <Pill className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-semibold">MEDICAMENTOS EM USO</h2>
          </div>

          {medicamentosUsuario.length === 0 ? (
            <p className="text-gray-500">Nenhum medicamento cadastrado</p>
          ) : (
            <div className="space-y-4">
              {medicamentosUsuario.map((med, index) => (
                <div key={med.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{index + 1}. {med.produto}</h3>
                    <span className="text-sm text-gray-500">{med.laboratorio}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Substância Ativa:</strong> {med.substancia}</p>
                      <p><strong>Apresentação:</strong> {med.apresentacao}</p>
                      <p><strong>Dosagem:</strong> {med.dosagem || 'Não informada'}</p>
                    </div>
                    <div>
                      <p><strong>Frequência:</strong> {med.frequencia || 'Não informada'}</p>
                      {med.horarios && med.horarios.length > 0 && (
                        <p><strong>Horários:</strong> {med.horarios.join(', ')}</p>
                      )}
                      <p><strong>Como tomar:</strong> {med.modoTomar}</p>
                    </div>
                  </div>
                  
                  {med.observacao && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <p className="text-sm"><strong>Observação:</strong> {med.observacao}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Patologias */}
        {patologias.length > 0 && (
          <div className="crossmeds-card mb-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-semibold">PATOLOGIAS RELACIONADAS</h2>
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              Baseado nos medicamentos em uso:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {patologias.map((patologia, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  <span>{patologia}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alergias */}
        {perfilPaciente.alergias && (
          <div className="crossmeds-card mb-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-semibold">ALERGIAS</h2>
            </div>
            <p className="bg-yellow-50 p-3 rounded border border-yellow-200">
              {perfilPaciente.alergias}
            </p>
          </div>
        )}

        {/* Observações */}
        {perfilPaciente.observacoes && (
          <div className="crossmeds-card mb-4">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-gray-500" />
              <h2 className="text-xl font-semibold">OBSERVAÇÕES GERAIS</h2>
            </div>
            <p className="bg-gray-50 p-3 rounded border">
              {perfilPaciente.observacoes}
            </p>
          </div>
        )}

        {/* Rodapé do Relatório */}
        <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t print-footer">
          <p>Relatório gerado pelo <strong>CrossMeds</strong> - Gerenciador de Medicamentos</p>
          <p>Data de geração: {new Date().toLocaleString('pt-BR')}</p>
          <p className="mt-2 text-xs">
            Este relatório é baseado nas informações fornecidas pelo paciente.
            Sempre consulte um profissional de saúde para orientações médicas.
          </p>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="p-4 no-print">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={imprimirRelatorio}
            className="crossmeds-button crossmeds-button-secondary"
          >
            <Printer className="w-5 h-5 mr-2" />
            Imprimir
          </button>
          <button
            onClick={gerarPDF}
            className="crossmeds-button crossmeds-button-primary"
          >
            <Download className="w-5 h-5 mr-2" />
            Baixar PDF
          </button>
        </div>
      </div>

      {/* CSS para impressão */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-content {
            padding: 0 !important;
            margin: 0 !important;
          }
          .crossmeds-card {
            box-shadow: none !important;
            border: 1px solid #ccc !important;
            margin-bottom: 20px !important;
          }
          .print-header {
            border-bottom: 2px solid #333 !important;
            margin-bottom: 30px !important;
          }
          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            border-top: 1px solid #ccc;
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default RelatorioPage;