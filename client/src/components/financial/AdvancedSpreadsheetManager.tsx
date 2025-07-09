import React, { useState, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Save,
  FileSpreadsheet,
  Columns,
  RotateCcw,
  Copy,
  Upload,
  Home,
  Grid,
  ArrowLeft,
  ArrowRight,
  X,
  Settings,
  Table
} from 'lucide-react';

// Tipos baseados na imagem anexada
interface TransactionData {
  Data: string;
  Descrição: string;
  Valor: string;
  Tipo: string;
  Categoria: string;
  Subcategoria?: string;
  Conta?: string;
  Saldo?: string;
  Ações?: string;
  [key: string]: any; // Para colunas personalizadas
}

interface ColumnDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'category';
  visible: boolean;
  editable: boolean;
  order: number;
  width?: number;
}

interface SpreadsheetWorkbook {
  id: string;
  name: string;
  sheets: SpreadsheetSheet[];
  activeSheetId: string;
  created: Date;
  modified: Date;
}

interface SpreadsheetSheet {
  id: string;
  name: string;
  columns: ColumnDefinition[];
  data: TransactionData[];
  filters: Record<string, string>;
}

// Colunas padrão baseadas na imagem
const defaultColumns: ColumnDefinition[] = [
  { id: 'Data', name: 'Data', type: 'date', visible: true, editable: false, order: 1, width: 120 },
  { id: 'Descrição', name: 'Descrição', type: 'text', visible: true, editable: true, order: 2, width: 200 },
  { id: 'Valor', name: 'Valor', type: 'currency', visible: true, editable: true, order: 3, width: 120 },
  { id: 'Tipo', name: 'Tipo', type: 'category', visible: true, editable: false, order: 4, width: 100 },
  { id: 'Categoria', name: 'Categoria', type: 'category', visible: true, editable: true, order: 5, width: 150 },
  { id: 'Subcategoria', name: 'Subcategoria', type: 'category', visible: false, editable: true, order: 6, width: 150 },
  { id: 'Conta', name: 'Conta', type: 'text', visible: false, editable: true, order: 7, width: 120 },
  { id: 'Saldo', name: 'Saldo', type: 'currency', visible: false, editable: false, order: 8, width: 120 },
  { id: 'Ações', name: 'Ações', type: 'text', visible: true, editable: false, order: 9, width: 100 }
];

// Dados de exemplo baseados na imagem
const sampleData: TransactionData[] = [
  {
    Data: '2024-01-15',
    Descrição: 'Salário Janeiro',
    Valor: 'R$ 5000,00',
    Tipo: 'receita',
    Categoria: 'Outras Receitas',
    Ações: '✏️'
  },
  {
    Data: '2024-01-16',
    Descrição: 'Supermercado Extra',
    Valor: 'R$ -280,50',
    Tipo: 'despesa',
    Categoria: 'Alimentação',
    Ações: '✏️'
  },
  {
    Data: '2024-01-17',
    Descrição: 'Transferência PIX',
    Valor: 'R$ -1000,00',
    Tipo: 'transferencia',
    Categoria: 'Transferência',
    Ações: '✏️'
  }
];

export default function AdvancedSpreadsheetManager() {
  const [workbooks, setWorkbooks] = useState<SpreadsheetWorkbook[]>([
    {
      id: '1',
      name: 'Planilha Financeira Principal',
      activeSheetId: '1-1',
      sheets: [
        {
          id: '1-1',
          name: 'Transações Categorizadas',
          columns: defaultColumns,
          data: sampleData,
          filters: {}
        }
      ],
      created: new Date(),
      modified: new Date()
    }
  ]);

  const [activeWorkbookId, setActiveWorkbookId] = useState('1');
  const [removedColumns, setRemovedColumns] = useState<ColumnDefinition[]>([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState<'text' | 'number' | 'date' | 'currency' | 'category'>('text');
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [editingCell, setEditingCell] = useState<{row: number, col: string} | null>(null);
  const [cellEditValue, setCellEditValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Obter workbook ativo
  const activeWorkbook = workbooks.find(w => w.id === activeWorkbookId);
  const activeSheet = activeWorkbook?.sheets.find(s => s.id === activeWorkbook.activeSheetId);

  // Função de categorização automática inteligente
  const categorizeTransaction = (description: string, value: string): {tipo: string, categoria: string} => {
    const desc = description.toLowerCase();
    const numValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    
    // Lógica de categorização baseada em padrões reais
    if (numValue > 0) {
      if (desc.includes('salário') || desc.includes('salary') || desc.includes('pagamento')) {
        return { tipo: 'receita', categoria: 'Salário' };
      } else if (desc.includes('venda') || desc.includes('vendas')) {
        return { tipo: 'receita', categoria: 'Vendas' };
      } else if (desc.includes('investimento') || desc.includes('rendimento')) {
        return { tipo: 'receita', categoria: 'Investimentos' };
      }
      return { tipo: 'receita', categoria: 'Outras Receitas' };
    } else {
      if (desc.includes('transferência') || desc.includes('pix') || desc.includes('ted') || desc.includes('doc')) {
        return { tipo: 'transferencia', categoria: 'Transferência' };
      } else if (desc.includes('mercado') || desc.includes('supermercado') || desc.includes('alimentação') || desc.includes('restaurante')) {
        return { tipo: 'despesa', categoria: 'Alimentação' };
      } else if (desc.includes('combustível') || desc.includes('gasolina') || desc.includes('posto')) {
        return { tipo: 'despesa', categoria: 'Transporte' };
      } else if (desc.includes('farmácia') || desc.includes('médico') || desc.includes('hospital')) {
        return { tipo: 'despesa', categoria: 'Saúde' };
      } else if (desc.includes('aluguel') || desc.includes('condomínio') || desc.includes('iptu')) {
        return { tipo: 'despesa', categoria: 'Moradia' };
      }
      return { tipo: 'despesa', categoria: 'Outras Despesas' };
    }
  };

  // Processar arquivo Excel/CSV
  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) return;

      // Extrair headers
      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1) as any[][];

      // Processar dados com categorização automática
      const processedData: TransactionData[] = rows.map((row, index) => {
        const rowData: TransactionData = {
          Data: '',
          Descrição: '',
          Valor: '',
          Tipo: '',
          Categoria: '',
          Ações: '✏️'
        };

        headers.forEach((header, i) => {
          const value = row[i]?.toString() || '';
          const normalizedHeader = header.trim();
          
          if (normalizedHeader.toLowerCase().includes('data') || normalizedHeader.toLowerCase().includes('date')) {
            rowData.Data = value;
          } else if (normalizedHeader.toLowerCase().includes('descrição') || normalizedHeader.toLowerCase().includes('description') || normalizedHeader.toLowerCase().includes('histórico')) {
            rowData.Descrição = value;
          } else if (normalizedHeader.toLowerCase().includes('valor') || normalizedHeader.toLowerCase().includes('amount') || normalizedHeader.toLowerCase().includes('montante')) {
            rowData.Valor = value;
          } else {
            rowData[normalizedHeader] = value;
          }
        });

        // Aplicar categorização automática
        if (rowData.Descrição && rowData.Valor) {
          const categorization = categorizeTransaction(rowData.Descrição, rowData.Valor);
          rowData.Tipo = categorization.tipo;
          rowData.Categoria = categorization.categoria;
        }

        return rowData;
      });

      // Criar nova planilha com dados processados
      const newSheet: SpreadsheetSheet = {
        id: `${Date.now()}`,
        name: `Importado - ${file.name}`,
        columns: defaultColumns,
        data: processedData,
        filters: {}
      };

      const newWorkbook: SpreadsheetWorkbook = {
        id: Date.now().toString(),
        name: `Workbook - ${file.name}`,
        activeSheetId: newSheet.id,
        sheets: [newSheet],
        created: new Date(),
        modified: new Date()
      };

      setWorkbooks(prev => [...prev, newWorkbook]);
      setActiveWorkbookId(newWorkbook.id);
    };

    reader.readAsArrayBuffer(file);
  }, []);

  // Remover coluna (move para cards)
  const removeColumn = (columnId: string) => {
    if (!activeSheet) return;

    const columnToRemove = activeSheet.columns.find(col => col.id === columnId);
    if (!columnToRemove) return;

    const updatedColumns = activeSheet.columns.filter(col => col.id !== columnId);
    const updatedSheet = { ...activeSheet, columns: updatedColumns };
    
    updateActiveSheet(updatedSheet);
    setRemovedColumns(prev => [...prev, columnToRemove]);
  };

  // Restaurar coluna dos cards
  const restoreColumn = (column: ColumnDefinition) => {
    if (!activeSheet) return;

    const updatedColumns = [...activeSheet.columns, { ...column, visible: true }].sort((a, b) => a.order - b.order);
    const updatedSheet = { ...activeSheet, columns: updatedColumns };
    
    updateActiveSheet(updatedSheet);
    setRemovedColumns(prev => prev.filter(col => col.id !== column.id));
  };

  // Criar nova coluna
  const createNewColumn = () => {
    if (!newColumnName.trim() || !activeSheet) return;

    const newColumn: ColumnDefinition = {
      id: `custom_${Date.now()}`,
      name: newColumnName,
      type: newColumnType,
      visible: true,
      editable: true,
      order: activeSheet.columns.length + 1,
      width: 150
    };

    const updatedColumns = [...activeSheet.columns, newColumn];
    const updatedSheet = { ...activeSheet, columns: updatedColumns };
    
    updateActiveSheet(updatedSheet);
    setNewColumnName('');
  };

  // Atualizar sheet ativa
  const updateActiveSheet = (updatedSheet: SpreadsheetSheet) => {
    if (!activeWorkbook) return;

    const updatedSheets = activeWorkbook.sheets.map(sheet => 
      sheet.id === updatedSheet.id ? updatedSheet : sheet
    );

    const updatedWorkbook = {
      ...activeWorkbook,
      sheets: updatedSheets,
      modified: new Date()
    };

    setWorkbooks(prev => prev.map(wb => 
      wb.id === updatedWorkbook.id ? updatedWorkbook : wb
    ));
  };

  // Duplicar planilha
  const duplicateSheet = () => {
    if (!activeSheet || !activeWorkbook) return;

    const newSheet: SpreadsheetSheet = {
      ...activeSheet,
      id: `${Date.now()}`,
      name: `${activeSheet.name} - Cópia`
    };

    const updatedSheets = [...activeWorkbook.sheets, newSheet];
    const updatedWorkbook = {
      ...activeWorkbook,
      sheets: updatedSheets,
      activeSheetId: newSheet.id,
      modified: new Date()
    };

    setWorkbooks(prev => prev.map(wb => 
      wb.id === updatedWorkbook.id ? updatedWorkbook : wb
    ));
  };

  // Exportar para Excel com colunas personalizadas
  const exportToExcel = () => {
    if (!activeSheet) return;

    const visibleColumns = activeSheet.columns.filter(col => col.visible).sort((a, b) => a.order - b.order);
    const headers = visibleColumns.map(col => col.name);
    
    const exportData = activeSheet.data.map(row => {
      const exportRow: any = {};
      visibleColumns.forEach(col => {
        exportRow[col.name] = row[col.id] || '';
      });
      return exportRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeSheet.name);
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${activeSheet.name}.xlsx`);
  };

  // Editar célula
  const startEditingCell = (row: number, colId: string) => {
    if (!activeSheet) return;
    const currentValue = activeSheet.data[row]?.[colId] || '';
    setEditingCell({ row, col: colId });
    setCellEditValue(currentValue);
  };

  // Salvar edição da célula
  const saveCell = () => {
    if (!editingCell || !activeSheet) return;

    const updatedData = [...activeSheet.data];
    updatedData[editingCell.row] = {
      ...updatedData[editingCell.row],
      [editingCell.col]: cellEditValue
    };

    const updatedSheet = { ...activeSheet, data: updatedData };
    updateActiveSheet(updatedSheet);
    
    setEditingCell(null);
    setCellEditValue('');
  };

  if (!activeWorkbook || !activeSheet) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 p-4">
      {/* Header com navegação */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <a href="/" className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
              <Home className="w-5 h-5" />
              <span>Início</span>
            </a>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-3xl font-bold text-gray-800">Gerenciador Avançado de Planilhas</h1>
          </div>
          <div className="flex space-x-2">
            <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar Excel
            </Button>
            <Button onClick={duplicateSheet} variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              Duplicar
            </Button>
          </div>
        </div>

        {/* Upload de arquivo */}
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            className="hidden"
          />
          <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Carregue sua planilha bancária</h3>
          <p className="text-gray-600 mb-4">
            O sistema identificará automaticamente tipos de movimento e criará colunas para cada categoria
          </p>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Selecionar Arquivo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Painel de Controle de Colunas */}
        <div className="lg:col-span-1 space-y-6">
          {/* Colunas Ativas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Columns className="w-5 h-5 mr-2" />
                Colunas Ativas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {activeSheet.columns.filter(col => col.visible).map(column => (
                <div key={column.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{column.name}</span>
                    <Badge className="ml-2 text-xs">{column.type}</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeColumn(column.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Cards de Colunas Removidas */}
          {removedColumns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Grid className="w-5 h-5 mr-2" />
                  Colunas Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {removedColumns.map(column => (
                  <div key={column.id} className="p-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-700">{column.name}</span>
                      <Badge variant="outline">{column.type}</Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => restoreColumn(column)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Restaurar
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Criar Nova Coluna */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Nova Coluna
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Nome da coluna"
              />
              <select
                value={newColumnType}
                onChange={(e) => setNewColumnType(e.target.value as any)}
                className="w-full p-2 border rounded-md"
              >
                <option value="text">Texto</option>
                <option value="number">Número</option>
                <option value="currency">Moeda</option>
                <option value="date">Data</option>
                <option value="category">Categoria</option>
              </select>
              <Button
                onClick={createNewColumn}
                disabled={!newColumnName.trim()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Coluna
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Área Principal da Planilha */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Table className="w-5 h-5 mr-2" />
                  {activeSheet.name}
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {activeSheet.data.length} transações
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Renderização estilo Excel nativo */}
              <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        {activeSheet.columns
                          .filter(col => col.visible)
                          .sort((a, b) => a.order - b.order)
                          .map(column => (
                          <th 
                            key={column.id} 
                            className="text-left p-3 border-r border-gray-200 font-semibold text-sm min-w-[100px]"
                            style={{ width: column.width }}
                          >
                            {column.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeSheet.data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-200 hover:bg-blue-50">
                          {activeSheet.columns
                            .filter(col => col.visible)
                            .sort((a, b) => a.order - b.order)
                            .map(column => (
                            <td 
                              key={column.id} 
                              className="p-3 border-r border-gray-200 text-sm cursor-pointer"
                              onClick={() => column.editable && startEditingCell(rowIndex, column.id)}
                            >
                              {editingCell?.row === rowIndex && editingCell?.col === column.id ? (
                                <div className="flex items-center space-x-1">
                                  <Input
                                    value={cellEditValue}
                                    onChange={(e) => setCellEditValue(e.target.value)}
                                    className="text-sm h-8"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveCell();
                                      if (e.key === 'Escape') setEditingCell(null);
                                    }}
                                    autoFocus
                                  />
                                  <Button size="sm" onClick={saveCell} className="h-8 px-2">
                                    <Save className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <span className={`${column.editable ? 'hover:bg-blue-100 px-1 rounded' : ''}`}>
                                  {row[column.id] || ''}
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-green-800 font-semibold">Total Receitas</div>
                  <div className="text-2xl font-bold text-green-600">
                    {activeSheet.data
                      .filter(row => row.Tipo === 'receita')
                      .length} transações
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-red-800 font-semibold">Total Despesas</div>
                  <div className="text-2xl font-bold text-red-600">
                    {activeSheet.data
                      .filter(row => row.Tipo === 'despesa')
                      .length} transações
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-blue-800 font-semibold">Transferências</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {activeSheet.data
                      .filter(row => row.Tipo === 'transferencia')
                      .length} transações
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}