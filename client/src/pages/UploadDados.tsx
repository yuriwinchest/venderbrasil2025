import { useState, useRef } from 'react';
import { Upload, FileText, TrendingUp, DollarSign, PieChart, BarChart3, Download, Settings, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import AdvancedSpreadsheetManager from '@/components/financial/AdvancedSpreadsheetManager';
import EnhancedFinancialManager from '@/components/financial/EnhancedFinancialManager';

interface Transaction {
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense' | 'transfer';
}

interface TransactionCategory {
  name: string;
  icon: string;
  color: string;
}

export default function UploadDados() {
  const [mode, setMode] = useState<'data-analyzer' | 'financial-manager'>('data-analyzer');
  const [bankFile, setBankFile] = useState<File | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isProcessingFinancial, setIsProcessingFinancial] = useState(false);
  const [editableColumns, setEditableColumns] = useState<string[]>(['date', 'description', 'amount', 'category', 'type']);
  const [customCategories, setCustomCategories] = useState<TransactionCategory[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const bankFileInputRef = useRef<HTMLInputElement>(null);

  const processBankFile = async (file: File) => {
    setIsProcessingFinancial(true);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const processedTransactions: Transaction[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length >= 3) {
          const dateIndex = headers.findIndex(h => h.includes('data') || h.includes('date'));
          const descIndex = headers.findIndex(h => h.includes('descrição') || h.includes('description') || h.includes('histórico'));
          const amountIndex = headers.findIndex(h => h.includes('valor') || h.includes('amount') || h.includes('montante'));
          
          const date = values[dateIndex] || `2024-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`;
          const description = values[descIndex] || `Transação ${i}`;
          const amount = parseFloat(values[amountIndex]?.replace(/[^\d.-]/g, '') || '0');
          
          let category = 'Outros';
          let type: 'income' | 'expense' | 'transfer' = 'expense';
          
          if (amount > 0) {
            type = 'income';
            if (description.toLowerCase().includes('salário') || description.toLowerCase().includes('salary')) {
              category = 'Salário';
            } else if (description.toLowerCase().includes('transferência') || description.toLowerCase().includes('transfer')) {
              category = 'Transferência Recebida';
              type = 'transfer';
            } else {
              category = 'Receita';
            }
          } else {
            type = 'expense';
            if (description.toLowerCase().includes('transferência') || description.toLowerCase().includes('transfer')) {
              category = 'Transferência Enviada';
              type = 'transfer';
            } else if (description.toLowerCase().includes('supermercado') || description.toLowerCase().includes('mercado')) {
              category = 'Alimentação';
            } else if (description.toLowerCase().includes('combustível') || description.toLowerCase().includes('gasolina')) {
              category = 'Transporte';
            } else if (description.toLowerCase().includes('farmácia')) {
              category = 'Saúde';
            } else {
              category = 'Despesa Geral';
            }
          }
          
          processedTransactions.push({
            date,
            description,
            amount: Math.abs(amount),
            category,
            type
          });
        }
      }
      
      setTransactions(processedTransactions);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
    } finally {
      setIsProcessingFinancial(false);
    }
  };

  const generateExcelReport = () => {
    const filteredTransactions = transactions.filter(t => {
      const categoryMatch = filterCategory === 'all' || t.category === filterCategory;
      const typeMatch = filterType === 'all' || t.type === filterType;
      return categoryMatch && typeMatch;
    });

    const csvContent = [
      editableColumns.join(','),
      ...filteredTransactions.map(t => 
        editableColumns.map(col => {
          switch(col) {
            case 'date': return t.date;
            case 'description': return `"${t.description}"`;
            case 'amount': return t.amount;
            case 'category': return t.category;
            case 'type': return t.type;
            default: return '';
          }
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalTransfers = transactions.filter(t => t.type === 'transfer').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const categoryStats = transactions.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = 0;
    acc[t.category] += t.amount;
    return acc;
  }, {} as Record<string, number>);

  const insights = [
    {
      title: "Maior Categoria de Gastos",
      value: Object.entries(categoryStats).sort(([,a], [,b]) => b - a)[0]?.[0] || "N/A",
      amount: Object.entries(categoryStats).sort(([,a], [,b]) => b - a)[0]?.[1] || 0,
      icon: TrendingUp,
      color: "text-red-400"
    },
    {
      title: "Saldo do Período",
      value: balance >= 0 ? "Positivo" : "Negativo",
      amount: balance,
      icon: DollarSign,
      color: balance >= 0 ? "text-green-400" : "text-red-400"
    },
    {
      title: "Total de Transações",
      value: transactions.length.toString(),
      amount: transactions.length,
      icon: BarChart3,
      color: "text-blue-400"
    }
  ];

  // Funções para as melhorias
  const handleFileUpload = (files: FileList) => {
    if (files.length > 0) {
      setBankFile(files[0]);
      processBankFile(files[0]);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Filtrar transações baseado no termo de busca
  };

  // Renderizar o sistema financeiro se estiver no modo correto
  if (mode === 'financial-manager') {
    return (
      <EnhancedFinancialManager
        onFileUpload={handleFileUpload}
        onSearch={handleSearch}
        showTutorial={showTutorial}
        onTutorialToggle={() => setShowTutorial(!showTutorial)}
      >
        <AdvancedSpreadsheetManager />
      </EnhancedFinancialManager>
    );
  }

  return (
    <EnhancedFinancialManager
      onFileUpload={handleFileUpload}
      onSearch={handleSearch}
      showTutorial={showTutorial}
      onTutorialToggle={() => setShowTutorial(!showTutorial)}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-6 pt-8">
        {/* Navegação entre modos */}
        <div className="flex items-center justify-between mb-8">
          <a 
            href="/" 
            className="text-white hover:text-purple-300 flex items-center space-x-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Voltar ao Início</span>
          </a>
          
          <div className="flex space-x-2">
            <Button
              onClick={() => setMode('data-analyzer')}
              variant={mode === 'data-analyzer' ? 'default' : 'outline'}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analisador de Dados
            </Button>
            <Button
              onClick={() => setMode('financial-manager')}
              variant={mode === 'financial-manager' ? 'default' : 'outline'}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Gerenciar Finanças
            </Button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            {mode === 'data-analyzer' ? 'Upload de Dados Financeiros' : 'Gerenciador de Planilhas'}
          </h1>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto">
            {mode === 'data-analyzer' 
              ? 'Faça upload do seu extrato bancário e gere relatórios Excel personalizados com análise inteligente de transações.'
              : 'Sistema avançado para gerenciar suas planilhas financeiras com editor de colunas e múltiplas visualizações.'
            }
          </p>
          
          {/* Botões Principais */}
          <div className="text-center mb-8 space-y-4">
            <Button 
              onClick={() => bankFileInputRef.current?.click()}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold px-8 py-6 text-xl md:text-2xl rounded-full shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 mr-4"
            >
              <Upload className="mr-3 h-6 w-6" />
              ANEXAR ARQUIVO E GERAR GRÁFICOS
              <TrendingUp className="ml-3 h-6 w-6" />
            </Button>
            
            <Button 
              onClick={() => setMode('financial-manager')}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-8 py-6 text-xl md:text-2xl rounded-full shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105"
            >
              <Calculator className="mr-3 h-6 w-6" />
              GERENCIAR FINANÇAS
              <DollarSign className="ml-3 h-6 w-6" />
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-green-300 text-sm bg-green-900/30 rounded-lg px-4 py-2 max-w-2xl mx-auto">
                💡 <strong>Gerenciar Finanças:</strong> Na página de análise de dados, clique no botão 'Gerenciar Finanças'. 
                Essa função permite anexar planilhas bancárias e classificar transações entre transferências, receitas e despesas. 
                Ao final, você receberá um Excel formatado, podendo editar, adicionar ou remover colunas conforme necessário.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload de Arquivo
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                Análise Financeira
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar Excel
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-300">
                    <FileText className="w-5 h-5" />
                    Upload de Extrato Bancário
                  </CardTitle>
                  <p className="text-slate-300">
                    Envie seu arquivo CSV do banco para análise automática das transações.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Input
                        ref={bankFileInputRef}
                        type="file"
                        accept=".csv,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setBankFile(file);
                            processBankFile(file);
                          }
                        }}
                        className="flex-1 bg-slate-700 border-green-500/30 text-white"
                      />
                      <Button 
                        onClick={() => bankFileInputRef.current?.click()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Selecionar Arquivo
                      </Button>
                    </div>

                    {bankFile && (
                      <div className="bg-slate-700/50 p-4 rounded-lg">
                        <p className="text-green-400 mb-2">✓ Arquivo selecionado: {bankFile.name}</p>
                        {isProcessingFinancial && (
                          <div className="space-y-2">
                            <Progress value={75} className="w-full" />
                            <p className="text-sm text-slate-300">Processando transações...</p>
                          </div>
                        )}
                        {transactions.length > 0 && (
                          <p className="text-blue-400">
                            ✓ {transactions.length} transações processadas com sucesso
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis">
              <div className="grid gap-6">
                {/* Dashboard de Métricas */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100">Total Receitas</p>
                          <p className="text-2xl font-bold">R$ {totalIncome.toLocaleString('pt-BR')}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-red-100">Total Despesas</p>
                          <p className="text-2xl font-bold">R$ {totalExpenses.toLocaleString('pt-BR')}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-red-200 rotate-180" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`bg-gradient-to-br ${balance >= 0 ? 'from-blue-600 to-blue-700' : 'from-orange-600 to-orange-700'} text-white`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100">Saldo Final</p>
                          <p className="text-2xl font-bold">R$ {balance.toLocaleString('pt-BR')}</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-blue-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Insights Inteligentes */}
                <Card className="bg-slate-800/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-purple-300">Insights Financeiros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {insights.map((insight, index) => (
                        <div 
                          key={index}
                          className="bg-slate-700/50 p-4 rounded-lg border border-slate-600/30 hover:border-purple-500/30 transition-colors cursor-pointer"
                          onClick={() => setSelectedInsight(selectedInsight === index ? null : index)}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <insight.icon className={`w-5 h-5 ${insight.color}`} />
                            <span className="text-slate-300 text-sm">{insight.title}</span>
                          </div>
                          <p className="text-lg font-semibold text-white">{insight.value}</p>
                          {typeof insight.amount === 'number' && (
                            <p className="text-sm text-slate-400">
                              R$ {insight.amount.toLocaleString('pt-BR')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Transações por Categoria */}
                <Card className="bg-slate-800/50 border-purple-500/20">
                  <CardHeader>
                    <CardTitle className="text-purple-300">Distribuição por Categorias</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(categoryStats)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([category, amount]) => (
                        <div key={category} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                          <span className="text-slate-300">{category}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-purple-300 border-purple-500/30">
                              R$ {amount.toLocaleString('pt-BR')}
                            </Badge>
                            <div className="w-24 bg-slate-600 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ 
                                  width: `${(amount / Math.max(...Object.values(categoryStats))) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="export">
              <Card className="bg-slate-800/50 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-300">
                    <Settings className="w-5 h-5" />
                    Configurar Relatório Excel
                  </CardTitle>
                  <p className="text-slate-300">
                    Personalize as colunas do seu relatório antes de exportar.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Configuração de Colunas */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Colunas do Relatório</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {[
                        { key: 'date', label: 'Data' },
                        { key: 'description', label: 'Descrição' },
                        { key: 'amount', label: 'Valor' },
                        { key: 'category', label: 'Categoria' },
                        { key: 'type', label: 'Tipo' }
                      ].map(col => (
                        <label key={col.key} className="flex items-center gap-2 text-slate-300">
                          <input
                            type="checkbox"
                            checked={editableColumns.includes(col.key)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditableColumns([...editableColumns, col.key]);
                              } else {
                                setEditableColumns(editableColumns.filter(c => c !== col.key));
                              }
                            }}
                            className="rounded border-purple-500/30"
                          />
                          {col.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Filtros */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Filtrar por Categoria
                      </label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="all">Todas as Categorias</option>
                        {Object.keys(categoryStats).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Filtrar por Tipo
                      </label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="all">Todos os Tipos</option>
                        <option value="income">Receitas</option>
                        <option value="expense">Despesas</option>
                        <option value="transfer">Transferências</option>
                      </select>
                    </div>
                  </div>

                  {/* Botão de Exportação */}
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Relatório Personalizado</p>
                      <p className="text-sm text-slate-300">
                        {transactions.filter(t => {
                          const categoryMatch = filterCategory === 'all' || t.category === filterCategory;
                          const typeMatch = filterType === 'all' || t.type === filterType;
                          return categoryMatch && typeMatch;
                        }).length} transações serão exportadas
                      </p>
                    </div>
                    <Button
                      onClick={generateExcelReport}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={transactions.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
    </EnhancedFinancialManager>
  );
}