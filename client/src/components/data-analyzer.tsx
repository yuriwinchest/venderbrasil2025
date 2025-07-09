import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as XLSX from 'xlsx';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import AIInsightsGenerator from "./ai-insights-generator";
import AdvancedAnalyticsDashboard from "./advanced-analytics-dashboard";
import GoogleSheetsLookerIntegration from "./google-sheets-looker-integration";
import MarketplaceProductProcessor from "./marketplace-product-processor";
import AdvancedMarketplaceTools from "./advanced-marketplace-tools";
import { trackEvent } from "./analytics-tracker-simple";
import { 
  Upload, 
  FileText, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Download,
  Trash2,
  Edit,
  Eye,
  Zap,
  Database,
  FileSpreadsheet,
  FileJson,
  Brain,
  ShoppingCart,
  Settings,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  CreditCard,
  Wallet,
  PiggyBank,
  Calculator,
  Filter,
  CheckCircle,
  AlertCircle,
  Save,
  Plus,
  Minus,
  RefreshCw,
  X
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart as RechartsPieChart,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area
} from "recharts";

interface DataFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: any[];
  columns: string[];
  uploadedAt: Date;
}

interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  xAxis: string;
  yAxis: string[];
  color: string;
}

// Interface para transações financeiras
interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'receita' | 'despesa' | 'transferencia';
  category: string;
  subcategory?: string;
  account?: string;
  balance?: number;
  edited?: boolean;
}

interface FinancialData {
  id: string;
  name: string;
  transactions: FinancialTransaction[];
  summary: {
    totalReceitas: number;
    totalDespesas: number;
    totalTransferencias: number;
    saldoFinal: number;
  };
  uploadedAt: Date;
}

export default function DataAnalyzer() {
  const [activeTab, setActiveTab] = useState<'geral' | 'financeiro'>('geral');
  const [files, setFiles] = useState<DataFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [showGoogleIntegration, setShowGoogleIntegration] = useState(false);
  const [showMarketplaceProcessor, setShowMarketplaceProcessor] = useState(false);
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados específicos para análise financeira
  const [financialFiles, setFinancialFiles] = useState<FinancialData[]>([]);
  const [selectedFinancialFile, setSelectedFinancialFile] = useState<string>("");
  const [showTransactionEditor, setShowTransactionEditor] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [customColumns, setCustomColumns] = useState<string[]>(['Data', 'Descrição', 'Valor', 'Tipo', 'Categoria', 'Subcategoria', 'Conta', 'Saldo']);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [additionalTables, setAdditionalTables] = useState<Array<{
    id: string;
    name: string;
    columns: string[];
    data: FinancialTransaction[];
    parentTableId?: string;
    filterType?: string;
    filterValue?: string;
  }>>([]);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [selectedTableForSub, setSelectedTableForSub] = useState<string>('');
  const [selectedColumnForSub, setSelectedColumnForSub] = useState<string>('');
  const [showMergeTablesModal, setShowMergeTablesModal] = useState(false);
  const [selectedTablesForMerge, setSelectedTablesForMerge] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const financialFileInputRef = useRef<HTMLInputElement>(null);

  // Rastrear acesso ao analisador de dados
  useEffect(() => {
    trackEvent('data_analyzer_access');
  }, []);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simular progresso de upload
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      let data: any[] = [];
      let columns: string[] = [];

      if (file.type === 'application/json') {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        data = Array.isArray(jsonData) ? jsonData : [jsonData];
        columns = data.length > 0 ? Object.keys(data[0]) : [];
      } else if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          columns = lines[0].split(',').map(col => col.trim().replace(/"/g, ''));
          data = lines.slice(1).map(line => {
            const values = line.split(',').map(val => val.trim().replace(/"/g, ''));
            const obj: any = {};
            columns.forEach((col, index) => {
              const value = values[index];
              obj[col] = isNaN(Number(value)) ? value : Number(value);
            });
            return obj;
          });
        }
      } else {
        // Para outros formatos, criar dados de exemplo
        data = [
          { nome: 'Janeiro', vendas: 4000, gastos: 2400, lucro: 1600 },
          { nome: 'Fevereiro', vendas: 3000, gastos: 1398, lucro: 1602 },
          { nome: 'Março', vendas: 2000, gastos: 9800, lucro: -7800 },
          { nome: 'Abril', vendas: 2780, gastos: 3908, lucro: -1128 },
          { nome: 'Maio', vendas: 1890, gastos: 4800, lucro: -2910 },
          { nome: 'Junho', vendas: 2390, gastos: 3800, lucro: -1410 }
        ];
        columns = ['nome', 'vendas', 'gastos', 'lucro'];
      }

      const newFile: DataFile = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        data,
        columns,
        uploadedAt: new Date()
      };

      setFiles(prev => [...prev, newFile]);
      setSelectedFile(newFile.id);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Erro ao processar arquivo. Verifique o formato.');
    }

    clearInterval(progressInterval);
  };

  const createChart = (type: ChartConfig['type']) => {
    const file = files.find(f => f.id === selectedFile);
    if (!file) return;

    const numericColumns = file.columns.filter(col => {
      return file.data.some(row => typeof row[col] === 'number');
    });

    if (numericColumns.length === 0) {
      alert('Arquivo não possui colunas numéricas para gráficos');
      return;
    }

    const newChart: ChartConfig = {
      id: Date.now().toString(),
      type,
      title: `${type.toUpperCase()} - ${file.name}`,
      xAxis: file.columns[0],
      yAxis: numericColumns.slice(0, 3),
      color: COLORS[charts.length % COLORS.length]
    };

    setCharts(prev => [...prev, newChart]);
  };

  const removeChart = (chartId: string) => {
    setCharts(prev => prev.filter(c => c.id !== chartId));
  };

  // Funções específicas para análise financeira
  const categorizeTransaction = (description: string, amount: number): { type: 'receita' | 'despesa' | 'transferencia', category: string, subcategory: string } => {
    const desc = description.toLowerCase();
    
    // Detectar transferências
    if (desc.includes('transf') || desc.includes('ted') || desc.includes('doc') || desc.includes('pix') || 
        desc.includes('entre contas') || desc.includes('transferencia')) {
      return { type: 'transferencia', category: 'Transferência', subcategory: 'Entre Contas' };
    }
    
    // Detectar receitas (valores positivos)
    if (amount > 0) {
      if (desc.includes('salario') || desc.includes('ordenado') || desc.includes('vencimento')) {
        return { type: 'receita', category: 'Trabalho', subcategory: 'Salário' };
      }
      if (desc.includes('freelance') || desc.includes('consultor') || desc.includes('servico')) {
        return { type: 'receita', category: 'Trabalho', subcategory: 'Freelance' };
      }
      if (desc.includes('venda') || desc.includes('vendas') || desc.includes('produto')) {
        return { type: 'receita', category: 'Vendas', subcategory: 'Produto' };
      }
      if (desc.includes('dividendo') || desc.includes('investimento') || desc.includes('aplicacao')) {
        return { type: 'receita', category: 'Investimentos', subcategory: 'Dividendos' };
      }
      if (desc.includes('aluguel') || desc.includes('locacao')) {
        return { type: 'receita', category: 'Imóveis', subcategory: 'Aluguel' };
      }
      return { type: 'receita', category: 'Outras Receitas', subcategory: 'Diversos' };
    }
    
    // Detectar despesas (valores negativos)
    if (desc.includes('mercado') || desc.includes('supermercado') || desc.includes('alimentacao')) {
      return { type: 'despesa', category: 'Alimentação', subcategory: 'Supermercado' };
    }
    if (desc.includes('restaurante') || desc.includes('lanchonete') || desc.includes('delivery')) {
      return { type: 'despesa', category: 'Alimentação', subcategory: 'Restaurante' };
    }
    if (desc.includes('gasolina') || desc.includes('combustivel') || desc.includes('posto')) {
      return { type: 'despesa', category: 'Transporte', subcategory: 'Combustível' };
    }
    if (desc.includes('uber') || desc.includes('taxi') || desc.includes('metro') || desc.includes('onibus')) {
      return { type: 'despesa', category: 'Transporte', subcategory: 'Público' };
    }
    if (desc.includes('energia') || desc.includes('luz') || desc.includes('celpe')) {
      return { type: 'despesa', category: 'Casa', subcategory: 'Energia Elétrica' };
    }
    if (desc.includes('agua') || desc.includes('saneamento') || desc.includes('compesa')) {
      return { type: 'despesa', category: 'Casa', subcategory: 'Água' };
    }
    if (desc.includes('internet') || desc.includes('telefone') || desc.includes('celular')) {
      return { type: 'despesa', category: 'Casa', subcategory: 'Telecomunicações' };
    }
    if (desc.includes('aluguel') || desc.includes('locacao') || desc.includes('condominio')) {
      return { type: 'despesa', category: 'Casa', subcategory: 'Aluguel' };
    }
    if (desc.includes('medico') || desc.includes('farmacia') || desc.includes('medicamento') || desc.includes('hospital')) {
      return { type: 'despesa', category: 'Saúde', subcategory: 'Médico' };
    }
    if (desc.includes('shopping') || desc.includes('loja') || desc.includes('compra')) {
      return { type: 'despesa', category: 'Compras', subcategory: 'Varejo' };
    }
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('amazon') || desc.includes('streaming')) {
      return { type: 'despesa', category: 'Entretenimento', subcategory: 'Streaming' };
    }
    if (desc.includes('banco') || desc.includes('tarifa') || desc.includes('anuidade') || desc.includes('juros')) {
      return { type: 'despesa', category: 'Bancos', subcategory: 'Tarifas' };
    }
    
    return { type: 'despesa', category: 'Outras Despesas', subcategory: 'Diversos' };
  };

  const handleFinancialFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      let rawData: any[] = [];
      
      if (file.type === 'application/json') {
        const text = await file.text();
        rawData = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(col => col.trim().replace(/"/g, ''));
          rawData = lines.slice(1).map(line => {
            const values = line.split(',').map(val => val.trim().replace(/"/g, ''));
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = values[index];
            });
            return obj;
          });
        }
      } else {
        // Dados de exemplo para demonstração
        rawData = [
          { data: '2024-01-15', descricao: 'Salário Janeiro', valor: '5000.00', conta: 'Conta Corrente' },
          { data: '2024-01-16', descricao: 'Supermercado Extra', valor: '-280.50', conta: 'Conta Corrente' },
          { data: '2024-01-17', descricao: 'Transferência PIX', valor: '-1000.00', conta: 'Conta Corrente' },
          { data: '2024-01-18', descricao: 'Freelance Design', valor: '1200.00', conta: 'Conta Corrente' },
          { data: '2024-01-19', descricao: 'Gasolina Posto Shell', valor: '-120.00', conta: 'Cartão de Crédito' },
          { data: '2024-01-20', descricao: 'Netflix Assinatura', valor: '-29.90', conta: 'Cartão de Crédito' },
          { data: '2024-01-21', descricao: 'Dividendos Ações', valor: '350.00', conta: 'Conta Poupança' },
          { data: '2024-01-22', descricao: 'Conta de Luz CELPE', valor: '-185.40', conta: 'Débito Automático' }
        ];
      }

      // Processar e categorizar transações
      const transactions: FinancialTransaction[] = rawData.map((row, index) => {
        const amount = parseFloat(String(row.valor || row.amount || row.value || '0').replace(/[^\d.-]/g, ''));
        const description = String(row.descricao || row.description || row.desc || `Transação ${index + 1}`);
        const date = row.data || row.date || new Date().toISOString().split('T')[0];
        const account = row.conta || row.account || 'Conta Principal';
        
        const categorization = categorizeTransaction(description, amount);
        
        return {
          id: `${Date.now()}-${index}`,
          date,
          description,
          amount,
          type: categorization.type,
          category: categorization.category,
          subcategory: categorization.subcategory,
          account,
          balance: 0, // Será calculado depois
          edited: false
        };
      });

      // Calcular saldo e totais
      let runningBalance = 0;
      transactions.forEach(transaction => {
        runningBalance += transaction.amount;
        transaction.balance = runningBalance;
      });

      const summary = {
        totalReceitas: transactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0),
        totalDespesas: Math.abs(transactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0)),
        totalTransferencias: Math.abs(transactions.filter(t => t.type === 'transferencia').reduce((sum, t) => sum + t.amount, 0)),
        saldoFinal: runningBalance
      };

      const newFinancialFile: FinancialData = {
        id: Date.now().toString(),
        name: file.name,
        transactions,
        summary,
        uploadedAt: new Date()
      };

      setFinancialFiles(prev => [...prev, newFinancialFile]);
      setSelectedFinancialFile(newFinancialFile.id);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      console.error('Erro ao processar arquivo financeiro:', error);
      setIsUploading(false);
      setUploadProgress(0);
      alert('Erro ao processar arquivo financeiro. Verifique o formato.');
    }

    clearInterval(progressInterval);
  };

  const generateFinancialExcel = () => {
    const financialFile = financialFiles.find(f => f.id === selectedFinancialFile);
    if (!financialFile) return;

    // Criar dados para Excel baseados nas colunas personalizadas
    const excelData = financialFile.transactions.map(transaction => {
      const row: any = {};
      customColumns.forEach(column => {
        switch (column) {
          case 'Data':
            row[column] = transaction.date;
            break;
          case 'Descrição':
            row[column] = transaction.description;
            break;
          case 'Valor':
            row[column] = transaction.amount;
            break;
          case 'Tipo':
            row[column] = transaction.type;
            break;
          case 'Categoria':
            row[column] = transaction.category;
            break;
          case 'Subcategoria':
            row[column] = transaction.subcategory || '';
            break;
          case 'Conta':
            row[column] = transaction.account || '';
            break;
          case 'Saldo':
            row[column] = transaction.balance || 0;
            break;
          default:
            row[column] = '';
        }
      });
      return row;
    });

    // Converter para CSV para download
    const csvContent = [
      customColumns.join(','),
      ...excelData.map(row => customColumns.map(col => `"${row[col] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analise_financeira_${financialFile.name}_${new Date().getTime()}.csv`;
    link.click();
  };

  const addCustomColumn = () => {
    const columnName = prompt('Nome da nova coluna:');
    if (columnName && !customColumns.includes(columnName)) {
      setCustomColumns(prev => [...prev, columnName]);
    }
  };

  const removeCustomColumn = (columnName: string) => {
    setCustomColumns(prev => prev.filter(col => col !== columnName));
  };

  const editTransaction = (transaction: FinancialTransaction) => {
    setEditingTransaction(transaction);
    setShowTransactionEditor(true);
  };

  const saveTransactionEdit = (updatedTransaction: FinancialTransaction) => {
    setFinancialFiles(prev => prev.map(file => ({
      ...file,
      transactions: file.transactions.map(t => 
        t.id === updatedTransaction.id ? { ...updatedTransaction, edited: true } : t
      )
    })));
    setShowTransactionEditor(false);
    setEditingTransaction(null);
  };

  // Função para alternar seleção de colunas
  const toggleColumnSelection = (column: string) => {
    setSelectedColumns(prev => 
      prev.includes(column) 
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  // Função para criar tabela personalizada
  const createCustomTable = () => {
    if (selectedColumns.length === 0) {
      alert('Selecione pelo menos uma coluna');
      return;
    }

    const financialFile = financialFiles.find(f => f.id === selectedFinancialFile);
    if (!financialFile) return;

    const tableName = `Tabela ${additionalTables.length + 1}`;
    
    const newTable = {
      id: Date.now().toString(),
      name: tableName,
      columns: selectedColumns,
      data: financialFile.transactions
    };

    setAdditionalTables(prev => [...prev, newTable]);
    setShowColumnSelector(false);
    setSelectedColumns([]);
  };

  // Função para remover tabela personalizada
  const removeCustomTable = (tableId: string) => {
    setAdditionalTables(prev => prev.filter(table => table.id !== tableId));
  };

  // Função para obter valores únicos de uma coluna
  const getUniqueValuesFromColumn = (tableId: string, column: string) => {
    let sourceData: FinancialTransaction[] = [];
    
    if (tableId === 'main') {
      const financialFile = financialFiles.find(f => f.id === selectedFinancialFile);
      sourceData = financialFile?.transactions || [];
    } else {
      const table = additionalTables.find(t => t.id === tableId);
      sourceData = table?.data || [];
    }

    const values = new Set<string>();
    sourceData.forEach(transaction => {
      switch(column) {
        case 'Tipo':
          values.add(transaction.type);
          break;
        case 'Categoria':
          values.add(transaction.category);
          break;
        case 'Subcategoria':
          if (transaction.subcategory) values.add(transaction.subcategory);
          break;
        case 'Conta':
          if (transaction.account) values.add(transaction.account);
          break;
        case 'Data':
          // Agrupar por mês/ano
          const date = new Date(transaction.date);
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
          values.add(monthYear);
          break;
        default:
          break;
      }
    });

    return Array.from(values);
  };

  // Função para criar sub-categorias
  const createSubCategoryTable = (filterValue: string) => {
    let sourceData: FinancialTransaction[] = [];
    let sourceTableName = '';
    
    if (selectedTableForSub === 'main') {
      const financialFile = financialFiles.find(f => f.id === selectedFinancialFile);
      sourceData = financialFile?.transactions || [];
      sourceTableName = 'Tabela Principal';
    } else {
      const table = additionalTables.find(t => t.id === selectedTableForSub);
      sourceData = table?.data || [];
      sourceTableName = table?.name || '';
    }

    // Filtrar dados baseado na coluna e valor selecionados
    const filteredData = sourceData.filter(transaction => {
      switch(selectedColumnForSub) {
        case 'Tipo':
          return transaction.type === filterValue;
        case 'Categoria':
          return transaction.category === filterValue;
        case 'Subcategoria':
          return transaction.subcategory === filterValue;
        case 'Conta':
          return transaction.account === filterValue;
        case 'Data':
          const date = new Date(transaction.date);
          const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
          return monthYear === filterValue;
        default:
          return true;
      }
    });

    const tableName = `${sourceTableName} - ${selectedColumnForSub}: ${filterValue}`;
    
    const newTable = {
      id: Date.now().toString(),
      name: tableName,
      columns: customColumns,
      data: filteredData,
      parentTableId: selectedTableForSub,
      filterType: selectedColumnForSub,
      filterValue: filterValue
    };

    setAdditionalTables(prev => [...prev, newTable]);
    setShowSubCategoryModal(false);
    setSelectedTableForSub('');
    setSelectedColumnForSub('');
  };

  // Funcionalidades de Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.type === 'application/json' || file.name.endsWith('.csv') || file.name.endsWith('.json')) {
        handleFinancialFileUpload({ target: { files: [file] } } as any);
      }
    }
  };

  // Sistema de Undo/Redo
  const saveState = () => {
    const currentState = {
      financialFiles,
      additionalTables,
      customColumns,
      selectedFinancialFile,
      timestamp: Date.now()
    };
    setUndoStack(prev => [...prev, currentState].slice(-10)); // Máximo 10 estados
    setRedoStack([]); // Limpar redo quando nova ação é feita
  };

  const undo = () => {
    if (undoStack.length === 0) return;
    
    const currentState = {
      financialFiles,
      additionalTables,
      customColumns,
      selectedFinancialFile,
      timestamp: Date.now()
    };
    
    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, currentState]);
    setUndoStack(prev => prev.slice(0, -1));
    
    // Restaurar estado anterior
    setFinancialFiles(previousState.financialFiles);
    setAdditionalTables(previousState.additionalTables);
    setCustomColumns(previousState.customColumns);
    setSelectedFinancialFile(previousState.selectedFinancialFile);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    
    const currentState = {
      financialFiles,
      additionalTables,
      customColumns,
      selectedFinancialFile,
      timestamp: Date.now()
    };
    
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, currentState]);
    setRedoStack(prev => prev.slice(0, -1));
    
    // Restaurar próximo estado
    setFinancialFiles(nextState.financialFiles);
    setAdditionalTables(nextState.additionalTables);
    setCustomColumns(nextState.customColumns);
    setSelectedFinancialFile(nextState.selectedFinancialFile);
  };

  // Sistema de Favoritos
  const toggleFavorite = (filterId: string) => {
    setFavorites(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  // Busca avançada
  const filteredTransactions = (transactions: FinancialTransaction[]) => {
    if (!searchTerm) return transactions;
    
    return transactions.filter(transaction =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.subcategory && transaction.subcategory.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // Tutorial Steps
  const tutorialSteps = [
    {
      title: "Bem-vindo ao Analisador Financeiro!",
      content: "Vou te mostrar como usar todas as funcionalidades",
      target: "upload-section"
    },
    {
      title: "Upload de Arquivos",
      content: "Arraste e solte arquivos CSV ou JSON aqui, ou clique para selecionar",
      target: "file-upload"
    },
    {
      title: "Tabelas Personalizadas",
      content: "Crie filtros avançados para analisar dados específicos",
      target: "custom-table-button"
    },
    {
      title: "Unir Tabelas",
      content: "Combine múltiplas análises em um único arquivo Excel",
      target: "merge-button"
    },
    {
      title: "Atalhos do Teclado",
      content: "Ctrl+Z (desfazer), Ctrl+Y (refazer), Ctrl+F (buscar)",
      target: "shortcuts"
    }
  ];

  const nextTutorialStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
      setTutorialStep(0);
    }
  };

  const prevTutorialStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  // Shortcuts de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'f':
            e.preventDefault();
            document.getElementById('search-input')?.focus();
            break;
          case 's':
            e.preventDefault();
            // Auto-save (já está implementado automaticamente)
            break;
        }
      }
      
      if (e.key === 'Escape') {
        setShowSubCategoryModal(false);
        setShowMergeTablesModal(false);
        setShowTutorial(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack]);

  // Simulação de progress para melhor UX
  const simulateProgress = async (action: string) => {
    setIsProcessing(true);
    setProcessProgress(0);
    
    for (let i = 0; i <= 100; i += 10) {
      setProcessProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsProcessing(false);
    setProcessProgress(0);
  };

  // Função para abrir modal de sub-categoria
  const openSubCategoryModal = (tableId: string) => {
    setSelectedTableForSub(tableId);
    setShowSubCategoryModal(true);
  };

  // Função para unir múltiplas tabelas em um único Excel separando por tipo
  const generateMergedExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    let mergedData: any[] = [];
    
    // Coletar todas as transações das tabelas selecionadas
    let allTransactions: FinancialTransaction[] = [];
    
    selectedTablesForMerge.forEach((tableId) => {
      let tableData: FinancialTransaction[] = [];
      
      if (tableId === 'main') {
        const financialFile = financialFiles.find(f => f.id === selectedFinancialFile);
        if (financialFile) {
          tableData = financialFile.transactions;
        }
      } else {
        const customTable = additionalTables.find(t => t.id === tableId);
        if (customTable) {
          tableData = customTable.data;
        }
      }
      
      allTransactions = [...allTransactions, ...tableData];
    });
    
    // Agrupar transações por tipo
    const receitas = allTransactions.filter(t => t.type === 'receita').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const despesas = allTransactions.filter(t => t.type === 'despesa').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const transferencias = allTransactions.filter(t => t.type === 'transferencia').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Colunas padrão para o Excel
    const columns = ['Data', 'Descrição', 'Valor', 'Tipo', 'Categoria', 'Subcategoria', 'Conta', 'Saldo'];
    
    // Seção RECEITAS
    if (receitas.length > 0) {
      // Título da seção
      mergedData.push({
        'Data': '=== TABELA 1 - TIPO: RECEITA ===',
        'Descrição': '',
        'Valor': '',
        'Tipo': '',
        'Categoria': '',
        'Subcategoria': '',
        'Conta': '',
        'Saldo': ''
      });
      
      // Linha em branco
      mergedData.push({});
      
      // Dados das receitas
      receitas.forEach(transaction => {
        mergedData.push({
          'Data': transaction.date,
          'Descrição': transaction.description,
          'Valor': transaction.amount,
          'Tipo': transaction.type,
          'Categoria': transaction.category,
          'Subcategoria': transaction.subcategory || '',
          'Conta': transaction.account || '',
          'Saldo': transaction.balance || ''
        });
      });
      
      // Resumo das receitas
      const totalReceitas = receitas.reduce((sum, t) => sum + t.amount, 0);
      mergedData.push({});
      mergedData.push({
        'Data': '',
        'Descrição': 'RESUMO - Tabela 1 - Tipo: receita',
        'Valor': '',
        'Tipo': '',
        'Categoria': '',
        'Subcategoria': '',
        'Conta': '',
        'Saldo': ''
      });
      mergedData.push({
        'Data': '',
        'Descrição': 'Total Receitas',
        'Valor': totalReceitas,
        'Tipo': 'receita',
        'Categoria': '',
        'Subcategoria': '',
        'Conta': '',
        'Saldo': ''
      });
      mergedData.push({
        'Data': '',
        'Descrição': 'Total Despesas',
        'Valor': 0,
        'Tipo': 'despesa',
        'Categoria': '',
        'Subcategoria': '',
        'Conta': '',
        'Saldo': ''
      });
      mergedData.push({
        'Data': '',
        'Descrição': 'Total Transferências',
        'Valor': 0,
        'Tipo': 'transferencia',
        'Categoria': '',
        'Subcategoria': '',
        'Conta': '',
        'Saldo': ''
      });
      mergedData.push({
        'Data': '',
        'Descrição': 'Saldo Final',
        'Valor': totalReceitas,
        'Tipo': 'saldo',
        'Categoria': '',
        'Subcategoria': '',
        'Conta': '',
        'Saldo': ''
      });
    }
    
    // Seção DESPESAS
    if (despesas.length > 0) {
      // Espaço entre seções
      mergedData.push({});
      mergedData.push({});
      
      // Título da seção
      mergedData.push({
        'Data': '=== TABELA 1 - TIPO: DESPESA ===',
        'Descrição': '',
        'Valor': '',
        'Tipo': '',
        'Categoria': '',
        'Subcategoria': '',
        'Conta': '',
        'Saldo': ''
      });
      
      // Linha em branco
      mergedData.push({});
      
      // Dados das despesas
      despesas.forEach(transaction => {
        mergedData.push({
          'Data': transaction.date,
          'Descrição': transaction.description,
          'Valor': transaction.amount,
          'Tipo': transaction.type,
          'Categoria': transaction.category,
          'Subcategoria': transaction.subcategory || '',
          'Conta': transaction.account || '',
          'Saldo': transaction.balance || ''
        });
      });
      
      // Resumo das despesas
      const totalDespesas = despesas.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const totalReceitas = receitas.reduce((sum, t) => sum + t.amount, 0);
      
      mergedData.push({});
      mergedData.push({
        'Data': '',
        'Descrição': 'RESUMO - Tabela 1 - Tipo: despesa',
        'Valor': '',
        'Tipo': '',
        'Categoria': '',
        'Subcategoria': '',
        'Conta': '',
        'Saldo': ''
      });
      mergedData.push({
        'Data': '',
        'Descrição': 'Total Receitas',
        'Valor': totalReceitas,
        'Tipo': 'receita',
        'Categoria': '',
        'Subcategoria': '',
        'Conta': '',
        'Saldo': ''
      });
      mergedData.push({
        'Data': '',
        'Descrição': 'Total Despesas',
        'Valor': totalDespesas,
        'Tipo': 'despesa',
        'Categoria': '',
        'Subcategoria': '',
        'Conta': '',
        'Saldo': ''
      });
      mergedData.push({
        'Data': '',
        'Descrição': 'Total Transferências',
        'Valor': 0,
        'Tipo': 'transferencia',
        'Categoria': '',
        'Subcategoria': '',
        'Conta': '',
        'Saldo': ''
      });
      mergedData.push({
        'Data': '',
        'Descrição': 'Saldo Final',
        'Valor': totalReceitas - totalDespesas,
        'Tipo': 'saldo',
        'Categoria': '',
        'Subcategoria': '',
        'Conta': '',
        'Saldo': ''
      });
    }
    
    // Seção TRANSFERÊNCIAS (se houver)
    if (transferencias.length > 0) {
      // Espaço entre seções
      mergedData.push({});
      mergedData.push({});
      
      // Título da seção
      mergedData.push({
        'Data': '=== TABELA 1 - TIPO: TRANSFERÊNCIA ===',
        'Descrição': '',
        'Valor': '',
        'Tipo': '',
        'Categoria': '',
        'Subcategoria': '',
        'Conta': '',
        'Saldo': ''
      });
      
      // Linha em branco
      mergedData.push({});
      
      // Dados das transferências
      transferencias.forEach(transaction => {
        mergedData.push({
          'Data': transaction.date,
          'Descrição': transaction.description,
          'Valor': transaction.amount,
          'Tipo': transaction.type,
          'Categoria': transaction.category,
          'Subcategoria': transaction.subcategory || '',
          'Conta': transaction.account || '',
          'Saldo': transaction.balance || ''
        });
      });
    }
    
    // Criar planilha
    const worksheet = XLSX.utils.json_to_sheet(mergedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tabelas_Unidas');
    
    // Gerar e baixar arquivo
    const fileName = `Tabelas_Unidas_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    // Fechar modal
    setShowMergeTablesModal(false);
    setSelectedTablesForMerge([]);
    
    alert(`✅ Excel gerado com sucesso!\n\n📊 Arquivo: ${fileName}\n\n🎯 Organização:\n💰 Receitas: ${receitas.length} transações\n💸 Despesas: ${despesas.length} transações\n🔄 Transferências: ${transferencias.length} transações\n\nCada tipo está em uma seção separada com títulos e resumos!`);
  };

  // Função para gerar Excel de qualquer tabela
  const generateExcelFromTable = (tableId: string, tableName: string, columns: string[], data: FinancialTransaction[]) => {
    const workbook = XLSX.utils.book_new();
    
    // Preparar dados para Excel
    const excelData = data.map(transaction => {
      const row: any = {};
      columns.forEach(column => {
        switch(column) {
          case 'Data':
            row[column] = transaction.date;
            break;
          case 'Descrição':
            row[column] = transaction.description;
            break;
          case 'Valor':
            row[column] = transaction.amount;
            break;
          case 'Tipo':
            row[column] = transaction.type;
            break;
          case 'Categoria':
            row[column] = transaction.category;
            break;
          case 'Subcategoria':
            row[column] = transaction.subcategory || '';
            break;
          case 'Conta':
            row[column] = transaction.account || '';
            break;
          case 'Saldo':
            row[column] = transaction.balance || '';
            break;
          default:
            row[column] = '';
            break;
        }
      });
      return row;
    });

    // Criar planilha
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Adicionar resumo no final se for tabela principal ou contiver dados financeiros
    if (data.length > 0) {
      const totalReceitas = data.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
      const totalDespesas = data.filter(t => t.type === 'despesa').reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const totalTransferencias = data.filter(t => t.type === 'transferencia').reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      // Adicionar linhas de resumo
      const resumoData = [
        { 'Data': '', 'Descrição': 'RESUMO FINANCEIRO', 'Valor': '', 'Tipo': '', 'Categoria': '' },
        { 'Data': '', 'Descrição': 'Total Receitas', 'Valor': totalReceitas, 'Tipo': 'receita', 'Categoria': '' },
        { 'Data': '', 'Descrição': 'Total Despesas', 'Valor': totalDespesas, 'Tipo': 'despesa', 'Categoria': '' },
        { 'Data': '', 'Descrição': 'Total Transferências', 'Valor': totalTransferencias, 'Tipo': 'transferencia', 'Categoria': '' },
        { 'Data': '', 'Descrição': 'Saldo Final', 'Valor': totalReceitas - totalDespesas, 'Tipo': 'saldo', 'Categoria': '' }
      ];
      
      XLSX.utils.sheet_add_json(worksheet, resumoData, { origin: -1, skipHeader: true });
    }
    
    // Adicionar planilha ao workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, tableName.substring(0, 31)); // Limite do Excel
    
    // Gerar e baixar arquivo
    const fileName = `${tableName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setCharts(prev => prev.filter(c => {
      const file = files.find(f => f.id === selectedFile);
      return file?.id !== fileId;
    }));
    if (selectedFile === fileId) {
      setSelectedFile("");
    }
  };

  const renderChart = (chart: ChartConfig) => {
    const file = files.find(f => f.id === selectedFile);
    if (!file) return null;

    const chartData = file.data;

    switch (chart.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              {chart.yAxis.map((axis, index) => (
                <Bar 
                  key={axis} 
                  dataKey={axis} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              {chart.yAxis.map((axis, index) => (
                <Line 
                  key={axis}
                  type="monotone" 
                  dataKey={axis} 
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={2}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              {chart.yAxis.map((axis, index) => (
                <Area 
                  key={axis}
                  type="monotone" 
                  dataKey={axis} 
                  stackId="1"
                  stroke={COLORS[index % COLORS.length]}
                  fill={COLORS[index % COLORS.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        const pieData = chartData.map(item => ({
          name: item[chart.xAxis],
          value: item[chart.yAxis[0]]
        })).filter(item => typeof item.value === 'number');

        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Tooltip />
              <Legend />
              <RechartsPieChart dataKey="value" data={pieData} cx="50%" cy="50%" outerRadius={80}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </RechartsPieChart>
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const generateReport = () => {
    const file = files.find(f => f.id === selectedFile);
    if (!file) return;

    const report = {
      fileName: file.name,
      uploadDate: file.uploadedAt,
      totalRows: file.data.length,
      columns: file.columns,
      charts: charts.length,
      summary: {
        numericColumns: file.columns.filter(col => 
          file.data.some(row => typeof row[col] === 'number')
        ).length,
        textColumns: file.columns.filter(col => 
          file.data.some(row => typeof row[col] === 'string')
        ).length
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${file.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInsightSelect = (insight: any) => {
    // Create chart based on insight
    if (insight.type === 'trend' || insight.type === 'correlation') {
      const file = files.find(f => f.id === selectedFile);
      if (file && insight.data) {
        const chartType = insight.type === 'trend' ? 'line' : 'bar';
        createChart(chartType);
      }
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 to-blue-50 relative">
      {/* Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="max-w-lg mx-4">
            <CardHeader>
              <CardTitle className="text-lg">{tutorialSteps[tutorialStep].title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {tutorialSteps[tutorialStep].content}
              </p>
              <div className="flex justify-between items-center">
                <Button 
                  variant="outline" 
                  onClick={prevTutorialStep}
                  disabled={tutorialStep === 0}
                >
                  Anterior
                </Button>
                <div className="flex space-x-1">
                  {tutorialSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === tutorialStep ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <Button onClick={nextTutorialStep}>
                  {tutorialStep === tutorialSteps.length - 1 ? 'Finalizar' : 'Próximo'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Bar para processamento */}
      {isProcessing && (
        <div className="fixed top-4 right-4 z-40">
          <Card className="p-4 min-w-[300px]">
            <div className="flex items-center space-x-3">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <div className="flex-1">
                <p className="text-sm font-medium">Processando...</p>
                <Progress value={processProgress} className="mt-1" />
              </div>
            </div>
          </Card>
        </div>
      )}



      <div className="container mx-auto px-4">
        <div className="text-center mb-12">

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <Database className="inline mr-3 h-8 w-8 text-purple-600" />
            Analisador de Dados com IA
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            📂 Anexe seus arquivos Excel, CSV ou JSON e veja gráficos profissionais sendo criados automaticamente
          </p>
          <div className="flex justify-center gap-4 flex-wrap mb-8">
            <Badge className="bg-blue-100 text-blue-800 text-sm px-4 py-2">
              📊 Gráficos Automáticos
            </Badge>
            <Badge className="bg-green-100 text-green-800 text-sm px-4 py-2">
              🤖 Análise com IA
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 text-sm px-4 py-2">
              ⚡ Resultados Instantâneos
            </Badge>
          </div>

          {/* Navegação entre Abas */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={() => setActiveTab('geral')}
              variant={activeTab === 'geral' ? 'default' : 'outline'}
              className={`px-6 py-3 ${
                activeTab === 'geral' 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'border-purple-600 text-purple-600 hover:bg-purple-50'
              }`}
            >
              <BarChart3 className="mr-2 h-5 w-5" />
              Análise Geral
            </Button>
            <Button
              onClick={() => setActiveTab('financeiro')}
              variant={activeTab === 'financeiro' ? 'default' : 'outline'}
              className={`px-6 py-3 ${
                activeTab === 'financeiro' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'border-green-600 text-green-600 hover:bg-green-50'
              }`}
            >
              <DollarSign className="mr-2 h-5 w-5" />
              Análise Financeira
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Conteúdo da Aba Análise Geral */}
          {activeTab === 'geral' && (
            <>
              {/* Upload Section */}
          <Card className="mb-8 shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-6 w-6" />
                Upload de Arquivos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.xlsx,.xls,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {/* Botão Principal "ANEXAR ARQUIVO E GERAR GRÁFICOS" */}
                <div className="w-full text-center mb-4">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    size="lg"
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold px-8 py-4 text-lg md:text-xl rounded-full shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
                    disabled={isUploading}
                  >
                    <Upload className="mr-3 h-5 w-5" />
                    ANEXAR ARQUIVO E GERAR GRÁFICOS
                    <BarChart3 className="ml-3 h-5 w-5" />
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">
                    Faça upload do seu arquivo (CSV, Excel, JSON, PDF) e gere gráficos e relatórios automáticos com análise inteligente de dados
                  </p>
                </div>
                

                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary"><FileSpreadsheet className="h-3 w-3 mr-1" />CSV</Badge>
                  <Badge variant="secondary"><FileJson className="h-3 w-3 mr-1" />JSON</Badge>
                  <Badge variant="secondary"><FileText className="h-3 w-3 mr-1" />Excel</Badge>
                  <Badge variant="secondary"><FileText className="h-3 w-3 mr-1" />PDF</Badge>
                </div>
              </div>

              {isUploading && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Processando arquivo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Arquivos Carregados */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Arquivos Carregados:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {files.map(file => (
                      <Card 
                        key={file.id}
                        className={`cursor-pointer transition-all hover:scale-105 ${
                          selectedFile === file.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
                        }`}
                        onClick={() => setSelectedFile(file.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-sm truncate">{file.name}</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(file.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-xs text-gray-600">
                            <div>{file.data.length} linhas</div>
                            <div>{file.columns.length} colunas</div>
                            <div>{(file.size / 1024).toFixed(1)} KB</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart Creation */}
          {selectedFile && (
            <Card className="mb-8 shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  Criar Gráficos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-3 mb-4">
                  <Button onClick={() => createChart('bar')} variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Gráfico de Barras
                  </Button>
                  <Button onClick={() => createChart('line')} variant="outline">
                    <LineChart className="mr-2 h-4 w-4" />
                    Gráfico de Linhas
                  </Button>
                  <Button onClick={() => createChart('pie')} variant="outline">
                    <PieChart className="mr-2 h-4 w-4" />
                    Gráfico de Pizza
                  </Button>
                  <Button onClick={() => createChart('area')} variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Gráfico de Área
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={generateReport} className="bg-green-600 hover:bg-green-700">
                    <Download className="mr-2 h-4 w-4" />
                    Gerar Relatório
                  </Button>
                  <Button 
                    onClick={() => setShowAIInsights(!showAIInsights)}
                    variant={showAIInsights ? "default" : "outline"}
                    className={showAIInsights ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    {showAIInsights ? 'Ocultar' : 'Mostrar'} Insights IA
                  </Button>
                  <Button 
                    onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
                    variant={showAdvancedAnalytics ? "default" : "outline"}
                    className={showAdvancedAnalytics ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {showAdvancedAnalytics ? 'Ocultar' : 'Mostrar'} Analytics Avançado
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowGoogleIntegration(!showGoogleIntegration);
                      trackEvent('google_sheets_toggle', '/analisar-dados');
                    }}
                    variant={showGoogleIntegration ? "default" : "outline"}
                    className={showGoogleIntegration ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    {showGoogleIntegration ? 'Ocultar' : 'Mostrar'} Google Sheets + Looker
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowMarketplaceProcessor(!showMarketplaceProcessor);
                      trackEvent('marketplace_processor_toggle', '/analisar-dados');
                    }}
                    variant={showMarketplaceProcessor ? "default" : "outline"}
                    className={showMarketplaceProcessor ? "bg-orange-600 hover:bg-orange-700" : ""}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {showMarketplaceProcessor ? 'Ocultar' : 'Mostrar'} Processador Marketplace
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowAdvancedTools(!showAdvancedTools);
                      trackEvent('advanced_tools_toggle', '/analisar-dados');
                    }}
                    variant={showAdvancedTools ? "default" : "outline"}
                    className={showAdvancedTools ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    {showAdvancedTools ? 'Ocultar' : 'Mostrar'} Ferramentas Avançadas
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.open(`https://wa.me/5561993521849?text=Olá! Gerei gráficos incríveis com o analisador de dados. Quero um sistema personalizado!`)}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Quero Sistema Personalizado
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Insights */}
          {selectedFile && showAIInsights && (
            <div className="mb-8">
              <AIInsightsGenerator 
                selectedFile={files.find(f => f.id === selectedFile) || null}
                onInsightSelect={handleInsightSelect}
              />
            </div>
          )}

          {/* Advanced Analytics Dashboard */}
          {selectedFile && showAdvancedAnalytics && (
            <div className="mb-8">
              <AdvancedAnalyticsDashboard 
                data={files.find(f => f.id === selectedFile)?.data || []}
                columns={files.find(f => f.id === selectedFile)?.columns || []}
                fileName={files.find(f => f.id === selectedFile)?.name || ""}
              />
            </div>
          )}

          {/* Google Sheets + Looker Integration */}
          {showGoogleIntegration && (
            <div className="mb-8">
              <GoogleSheetsLookerIntegration />
            </div>
          )}

          {/* Marketplace Product Processor */}
          {showMarketplaceProcessor && (
            <div className="mb-8">
              <MarketplaceProductProcessor />
            </div>
          )}

          {/* Advanced Marketplace Tools */}
          {showAdvancedTools && (
            <div className="mb-8">
              <AdvancedMarketplaceTools />
            </div>
          )}

          {/* Charts Display */}
          {charts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {charts.map(chart => (
                <Card key={chart.id} className="shadow-xl border-0">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{chart.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChart(chart.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderChart(chart)}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* CTA Final */}
          {files.length === 0 && (
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardContent className="p-8 text-center">
                <Database className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Comece a Analisar Seus Dados
                </h3>
                <p className="text-gray-600 mb-6">
                  Faça upload de qualquer arquivo e transforme dados em insights visuais
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Fazer Upload do Primeiro Arquivo
                </Button>
              </CardContent>
            </Card>
          )}
            </>
          )}

          {/* Conteúdo da Aba Análise Financeira */}
          {activeTab === 'financeiro' && (
            <>
              {/* Upload Section Financeiro */}
              <Card className="mb-8 shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-6 w-6" />
                    Upload de Extrato Bancário
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-6">
                    <input
                      ref={financialFileInputRef}
                      type="file"
                      accept=".csv,.json,.xlsx,.xls,.ofx"
                      onChange={handleFinancialFileUpload}
                      className="hidden"
                    />
                    
                    {/* Botão Principal Upload Financeiro */}
                    <div className="text-center">
                      <Button
                        onClick={() => financialFileInputRef.current?.click()}
                        size="lg"
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-8 py-4 text-lg md:text-xl rounded-full shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105"
                        disabled={isUploading}
                      >
                        <Wallet className="mr-3 h-5 w-5" />
                        ANEXAR EXTRATO BANCÁRIO
                        <Calculator className="ml-3 h-5 w-5" />
                      </Button>
                      <p className="text-sm text-gray-600 mt-2">
                        Faça upload do seu extrato bancário (CSV, Excel, OFX) para categorizar transações automaticamente
                      </p>
                    </div>

                    {isUploading && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Processando extrato bancário...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 justify-center">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <FileSpreadsheet className="h-3 w-3 mr-1" />CSV
                      </Badge>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <FileJson className="h-3 w-3 mr-1" />Excel
                      </Badge>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        <FileText className="h-3 w-3 mr-1" />OFX
                      </Badge>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <CreditCard className="h-3 w-3 mr-1" />Cartão
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Arquivos Financeiros Carregados */}
              {financialFiles.length > 0 && (
                <Card className="mb-8 shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <PiggyBank className="h-6 w-6" />
                      Arquivos Financeiros Processados
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {financialFiles.map(file => (
                        <Card 
                          key={file.id}
                          className={`cursor-pointer transition-all hover:scale-105 ${
                            selectedFinancialFile === file.id ? 'ring-2 ring-green-500 bg-green-50' : ''
                          }`}
                          onClick={() => setSelectedFinancialFile(file.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-sm truncate">{file.name}</h4>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div className="flex items-center gap-1">
                                <ArrowUpDown className="h-3 w-3" />
                                {file.transactions.length} transações
                              </div>
                              <div className="flex items-center gap-1 text-green-600">
                                <TrendingUp className="h-3 w-3" />
                                R$ {file.summary.totalReceitas.toFixed(2)}
                              </div>
                              <div className="flex items-center gap-1 text-red-600">
                                <TrendingDown className="h-3 w-3" />
                                R$ {file.summary.totalDespesas.toFixed(2)}
                              </div>
                              <div className="flex items-center gap-1 text-blue-600">
                                <RefreshCw className="h-3 w-3" />
                                R$ {file.summary.totalTransferencias.toFixed(2)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Dashboard Financeiro */}
              {selectedFinancialFile && (
                <Card className="mb-8 shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-6 w-6" />
                      Dashboard Financeiro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {(() => {
                      const financialFile = financialFiles.find(f => f.id === selectedFinancialFile);
                      if (!financialFile) return null;

                      return (
                        <div className="space-y-6">
                          {/* Resumo Financeiro */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="bg-green-50 border-green-200">
                              <CardContent className="p-4 text-center">
                                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-green-800">
                                  R$ {financialFile.summary.totalReceitas.toFixed(2)}
                                </div>
                                <div className="text-sm text-green-600">Total Receitas</div>
                              </CardContent>
                            </Card>
                            
                            <Card className="bg-red-50 border-red-200">
                              <CardContent className="p-4 text-center">
                                <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-red-800">
                                  R$ {financialFile.summary.totalDespesas.toFixed(2)}
                                </div>
                                <div className="text-sm text-red-600">Total Despesas</div>
                              </CardContent>
                            </Card>
                            
                            <Card className="bg-blue-50 border-blue-200">
                              <CardContent className="p-4 text-center">
                                <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-blue-800">
                                  R$ {financialFile.summary.totalTransferencias.toFixed(2)}
                                </div>
                                <div className="text-sm text-blue-600">Transferências</div>
                              </CardContent>
                            </Card>
                            
                            <Card className="bg-purple-50 border-purple-200">
                              <CardContent className="p-4 text-center">
                                <Wallet className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                <div className={`text-2xl font-bold ${
                                  financialFile.summary.saldoFinal >= 0 ? 'text-green-800' : 'text-red-800'
                                }`}>
                                  R$ {financialFile.summary.saldoFinal.toFixed(2)}
                                </div>
                                <div className="text-sm text-purple-600">Saldo Final</div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Botões de Ação */}
                          <div className="flex flex-wrap gap-3">

                            
                            <Button 
                              onClick={() => setShowColumnSelector(true)}
                              variant="outline"
                              className="border-purple-600 text-purple-600 hover:bg-purple-50"
                            >
                              <Filter className="mr-2 h-4 w-4" />
                              Criar Tabela Personalizada
                            </Button>
                            <Button 
                              onClick={() => openSubCategoryModal('main')}
                              variant="outline"
                              className="border-orange-600 text-orange-600 hover:bg-orange-50"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Criar Sub-categoria
                            </Button>
                            
                            <Button 
                              onClick={() => setShowMergeTablesModal(true)}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <FileSpreadsheet className="mr-2 h-4 w-4" />
                              Unir Tabelas
                            </Button>
                          </div>

                          {/* Colunas Personalizadas */}
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Colunas do Excel Personalizado:</h3>
                            <div className="flex flex-wrap gap-2">
                              {customColumns.map(column => (
                                <Badge 
                                  key={column}
                                  variant="secondary"
                                  className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                                  onClick={() => removeCustomColumn(column)}
                                >
                                  {column}
                                  <Minus className="ml-1 h-3 w-3" />
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Tabela de Transações */}
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Transações Categorizadas:</h3>
                            <div className="max-h-96 overflow-y-auto border rounded-lg">
                              <table className="w-full">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-4 py-2 text-left">Data</th>
                                    <th className="px-4 py-2 text-left">Descrição</th>
                                    <th className="px-4 py-2 text-right">Valor</th>
                                    <th className="px-4 py-2 text-left">Tipo</th>
                                    <th className="px-4 py-2 text-left">Categoria</th>
                                    <th className="px-4 py-2 text-left">Ações</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {financialFile.transactions.map(transaction => (
                                    <tr key={transaction.id} className={`border-t ${transaction.edited ? 'bg-yellow-50' : ''}`}>
                                      <td className="px-4 py-2 text-sm">{transaction.date}</td>
                                      <td className="px-4 py-2 text-sm">{transaction.description}</td>
                                      <td className={`px-4 py-2 text-sm text-right font-medium ${
                                        transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        R$ {transaction.amount.toFixed(2)}
                                      </td>
                                      <td className="px-4 py-2 text-sm">
                                        <Badge 
                                          variant="secondary"
                                          className={
                                            transaction.type === 'receita' ? 'bg-green-100 text-green-800' :
                                            transaction.type === 'despesa' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                          }
                                        >
                                          {transaction.type === 'receita' && <TrendingUp className="h-3 w-3 mr-1" />}
                                          {transaction.type === 'despesa' && <TrendingDown className="h-3 w-3 mr-1" />}
                                          {transaction.type === 'transferencia' && <RefreshCw className="h-3 w-3 mr-1" />}
                                          {transaction.type}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-2 text-sm">{transaction.category}</td>
                                      <td className="px-4 py-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => editTransaction(transaction)}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Tabelas Personalizadas */}
                          {additionalTables.length > 0 && (
                            <div className="space-y-6">
                              <h3 className="text-lg font-semibold">Tabelas Personalizadas:</h3>
                              {additionalTables.map(table => (
                                <Card key={table.id} className="border-blue-200">
                                  <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                      <CardTitle className="text-base flex items-center">
                                        <FileSpreadsheet className="w-5 h-5 mr-2 text-blue-600" />
                                        {table.name}
                                      </CardTitle>
                                      <div className="flex space-x-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => openSubCategoryModal(table.id)}
                                          className="text-blue-600 hover:bg-blue-50 border-blue-500"
                                        >
                                          <Filter className="w-3 h-3 mr-1" />
                                          Sub-categoria
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => generateExcelFromTable(table.id, table.name, table.columns, table.data)}
                                          className="bg-green-600 hover:bg-green-700 text-white"
                                        >
                                          <Download className="w-3 h-3 mr-1" />
                                          Excel
                                        </Button>
                                        <Button
                                          size="sm"
                                          onClick={() => setShowMergeTablesModal(true)}
                                          className="bg-purple-600 hover:bg-purple-700 text-white"
                                        >
                                          <FileSpreadsheet className="w-3 h-3 mr-1" />
                                          Unir
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => removeCustomTable(table.id)}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                                      <table className="w-full">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            {table.columns.map(column => (
                                              <th key={column} className="px-4 py-2 text-left text-sm font-medium">
                                                {column}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {table.data.map(transaction => (
                                            <tr key={transaction.id} className="border-t hover:bg-gray-50">
                                              {table.columns.map(column => (
                                                <td key={column} className="px-4 py-2 text-sm">
                                                  {(() => {
                                                    switch(column) {
                                                      case 'Data':
                                                        return transaction.date;
                                                      case 'Descrição':
                                                        return transaction.description;
                                                      case 'Valor':
                                                        return `R$ ${transaction.amount.toFixed(2)}`;
                                                      case 'Tipo':
                                                        return (
                                                          <Badge 
                                                            variant="secondary"
                                                            className={
                                                              transaction.type === 'receita' ? 'bg-green-100 text-green-800' :
                                                              transaction.type === 'despesa' ? 'bg-red-100 text-red-800' :
                                                              'bg-blue-100 text-blue-800'
                                                            }
                                                          >
                                                            {transaction.type}
                                                          </Badge>
                                                        );
                                                      case 'Categoria':
                                                        return transaction.category;
                                                      case 'Subcategoria':
                                                        return transaction.subcategory || '-';
                                                      case 'Conta':
                                                        return transaction.account || '-';
                                                      case 'Saldo':
                                                        return transaction.balance ? `R$ ${transaction.balance.toFixed(2)}` : '-';
                                                      default:
                                                        return '-';
                                                    }
                                                  })()}
                                                </td>
                                              ))}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* CTA Inicial */}
              {financialFiles.length === 0 && (
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-8 text-center">
                    <DollarSign className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Análise Financeira Inteligente
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Faça upload do seu extrato bancário e veja suas transações sendo categorizadas automaticamente em receitas, despesas e transferências
                    </p>
                    <Button
                      onClick={() => financialFileInputRef.current?.click()}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Wallet className="mr-2 h-5 w-5" />
                      Fazer Upload do Primeiro Extrato
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Seleção de Colunas */}
      {showColumnSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Selecionar Colunas para Nova Tabela</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowColumnSelector(false)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600">
                Marque as colunas que deseja incluir na nova tabela personalizada:
              </p>
              
              {customColumns.map(column => (
                <div key={column} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={`column-${column}`}
                    checked={selectedColumns.includes(column)}
                    onChange={() => toggleColumnSelection(column)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`column-${column}`}
                    className="text-sm font-medium cursor-pointer flex-1"
                  >
                    {column}
                  </label>
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                  >
                    {(() => {
                      const financialFile = financialFiles.find(f => f.id === selectedFinancialFile);
                      if (!financialFile) return '0';
                      
                      // Contar transações por tipo baseado na coluna
                      if (column === 'Tipo') {
                        const receitas = financialFile.transactions.filter(t => t.type === 'receita').length;
                        const despesas = financialFile.transactions.filter(t => t.type === 'despesa').length;
                        const transferencias = financialFile.transactions.filter(t => t.type === 'transferencia').length;
                        return `R:${receitas} D:${despesas} T:${transferencias}`;
                      }
                      
                      return financialFile.transactions.length.toString();
                    })()}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={createCustomTable}
                disabled={selectedColumns.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Tabela ({selectedColumns.length} colunas)
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowColumnSelector(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Sub-categorização */}
      {showSubCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Criar Sub-categoria</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSubCategoryModal(false)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Selecione a coluna para filtrar:
                </label>
                <select
                  value={selectedColumnForSub}
                  onChange={(e) => setSelectedColumnForSub(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Escolha uma coluna</option>
                  <option value="Tipo">Tipo (Receitas, Despesas, Transferências)</option>
                  <option value="Categoria">Categoria</option>
                  <option value="Subcategoria">Subcategoria</option>
                  <option value="Conta">Conta</option>
                  <option value="Data">Data (Por mês/ano)</option>
                </select>
              </div>

              {selectedColumnForSub && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Selecione o valor para filtrar:
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {getUniqueValuesFromColumn(selectedTableForSub, selectedColumnForSub).map(value => (
                      <button
                        key={value}
                        onClick={() => createSubCategoryTable(value)}
                        className="w-full text-left p-2 text-sm border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span>{value}</span>
                          <Badge variant="outline" className="text-xs">
                            {(() => {
                              let sourceData: FinancialTransaction[] = [];
                              
                              if (selectedTableForSub === 'main') {
                                const financialFile = financialFiles.find(f => f.id === selectedFinancialFile);
                                sourceData = financialFile?.transactions || [];
                              } else {
                                const table = additionalTables.find(t => t.id === selectedTableForSub);
                                sourceData = table?.data || [];
                              }

                              const filteredCount = sourceData.filter(transaction => {
                                switch(selectedColumnForSub) {
                                  case 'Tipo':
                                    return transaction.type === value;
                                  case 'Categoria':
                                    return transaction.category === value;
                                  case 'Subcategoria':
                                    return transaction.subcategory === value;
                                  case 'Conta':
                                    return transaction.account === value;
                                  case 'Data':
                                    const date = new Date(transaction.date);
                                    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
                                    return monthYear === value;
                                  default:
                                    return true;
                                }
                              }).length;

                              return `${filteredCount} itens`;
                            })()}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => setShowSubCategoryModal(false)}
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Unir Tabelas */}
      {showMergeTablesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Selecionar Tabelas para Unir</h3>
            
            <div className="space-y-4">
              {/* Tabela Principal */}
              <div
                onClick={() => {
                  if (selectedTablesForMerge.includes('main')) {
                    setSelectedTablesForMerge(prev => prev.filter(id => id !== 'main'));
                  } else {
                    setSelectedTablesForMerge(prev => [...prev, 'main']);
                  }
                }}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTablesForMerge.includes('main')
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileSpreadsheet className="w-5 h-5 mr-3 text-blue-600" />
                    <div>
                      <h4 className="font-semibold">📊 Tabela Principal</h4>
                      <p className="text-sm text-gray-600">
                        {financialFiles.find(f => f.id === selectedFinancialFile)?.transactions.length || 0} transações
                      </p>
                    </div>
                  </div>
                  {selectedTablesForMerge.includes('main') && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tabelas Personalizadas */}
              {additionalTables.map((table) => (
                <div
                  key={table.id}
                  onClick={() => {
                    if (selectedTablesForMerge.includes(table.id)) {
                      setSelectedTablesForMerge(prev => prev.filter(id => id !== table.id));
                    } else {
                      setSelectedTablesForMerge(prev => [...prev, table.id]);
                    }
                  }}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTablesForMerge.includes(table.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileSpreadsheet className="w-5 h-5 mr-3 text-green-600" />
                      <div>
                        <h4 className="font-semibold">📋 {table.name}</h4>
                        <p className="text-sm text-gray-600">
                          {table.data.length} transações • {table.columns.join(', ')}
                        </p>
                      </div>
                    </div>
                    {selectedTablesForMerge.includes(table.id) && (
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedTablesForMerge.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✅ {selectedTablesForMerge.length} tabela(s) selecionada(s) • 
                  Serão combinadas em um único arquivo Excel com títulos e espaçamento
                </p>
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <Button
                onClick={generateMergedExcel}
                disabled={selectedTablesForMerge.length === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Gerar Excel Unido ({selectedTablesForMerge.length} tabelas)
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowMergeTablesModal(false);
                  setSelectedTablesForMerge([]);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}