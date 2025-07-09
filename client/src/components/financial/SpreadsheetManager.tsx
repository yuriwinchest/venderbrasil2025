import React, { useState, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
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
  X
} from 'lucide-react';

// Tipos para o sistema
interface TransactionData {
  data: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa' | 'transferencia';
  categoria: string;
  subcategoria?: string;
  conta?: string;
  saldo?: number;
}

interface ColumnConfig {
  id: string;
  name: string;
  key: keyof TransactionData;
  type: 'text' | 'number' | 'date' | 'category';
  visible: boolean;
  width?: number;
  format?: string;
}

interface SpreadsheetConfig {
  id: string;
  name: string;
  columns: ColumnConfig[];
  data: TransactionData[];
  created: Date;
  modified: Date;
}

// Configuração padrão de colunas
const defaultColumns: ColumnConfig[] = [
  { id: 'data', name: 'Data', key: 'data', type: 'date', visible: true, width: 120 },
  { id: 'descricao', name: 'Descrição', key: 'descricao', type: 'text', visible: true, width: 200 },
  { id: 'valor', name: 'Valor', key: 'valor', type: 'number', visible: true, width: 120, format: 'currency' },
  { id: 'tipo', name: 'Tipo', key: 'tipo', type: 'category', visible: true, width: 100 },
  { id: 'categoria', name: 'Categoria', key: 'categoria', type: 'category', visible: true, width: 150 },
  { id: 'subcategoria', name: 'Subcategoria', key: 'subcategoria', type: 'category', visible: false, width: 150 },
  { id: 'conta', name: 'Conta', key: 'conta', type: 'text', visible: false, width: 120 },
  { id: 'saldo', name: 'Saldo', key: 'saldo', type: 'number', visible: false, width: 120, format: 'currency' }
];

// Dados de exemplo baseados na imagem
const sampleData: TransactionData[] = [
  {
    data: '2024-01-15',
    descricao: 'Salário Janeiro',
    valor: 5000.00,
    tipo: 'receita',
    categoria: 'Outras Receitas'
  },
  {
    data: '2024-01-16',
    descricao: 'Supermercado Extra',
    valor: 280.50,
    tipo: 'despesa',
    categoria: 'Alimentação'
  },
  {
    data: '2024-01-17',
    descricao: 'Transferência PIX',
    valor: 1000.00,
    tipo: 'transferencia',
    categoria: 'Transferência'
  }
];

export default function SpreadsheetManager() {
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetConfig[]>([
    {
      id: '1',
      name: 'Planilha Principal',
      columns: defaultColumns,
      data: sampleData,
      created: new Date(),
      modified: new Date()
    }
  ]);
  
  const [activeSpreadsheet, setActiveSpreadsheet] = useState<string>('1');
  const [availableColumns, setAvailableColumns] = useState<ColumnConfig[]>([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');

  // Obter planilha ativa
  const currentSpreadsheet = spreadsheets.find(s => s.id === activeSpreadsheet);

  // Função para processar arquivo Excel/CSV
  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Converter dados para formato interno e categorizar automaticamente
      const processedData: TransactionData[] = jsonData.map((row: any) => {
        const valor = parseFloat(row.Valor || row.valor || row.Value || 0);
        const descricao = row.Descrição || row.descricao || row.Description || '';
        
        // Categorização automática baseada em valor e descrição
        let tipo: 'receita' | 'despesa' | 'transferencia' = 'despesa';
        let categoria = 'Outras';
        
        if (valor > 0) {
          tipo = 'receita';
          if (descricao.toLowerCase().includes('salário')) categoria = 'Outras Receitas';
        } else if (valor < 0) {
          if (descricao.toLowerCase().includes('transferência') || 
              descricao.toLowerCase().includes('pix')) {
            tipo = 'transferencia';
            categoria = 'Transferência';
          } else {
            tipo = 'despesa';
            if (descricao.toLowerCase().includes('mercado') || 
                descricao.toLowerCase().includes('alimentação')) {
              categoria = 'Alimentação';
            }
          }
        }

        return {
          data: row.Data || row.data || row.Date || new Date().toISOString().split('T')[0],
          descricao,
          valor: Math.abs(valor),
          tipo,
          categoria,
          subcategoria: row.Subcategoria || row.subcategoria,
          conta: row.Conta || row.conta,
          saldo: parseFloat(row.Saldo || row.saldo || 0)
        };
      });

      // Criar nova planilha
      const newSpreadsheet: SpreadsheetConfig = {
        id: Date.now().toString(),
        name: `Importada - ${file.name}`,
        columns: defaultColumns,
        data: processedData,
        created: new Date(),
        modified: new Date()
      };

      setSpreadsheets(prev => [...prev, newSpreadsheet]);
      setActiveSpreadsheet(newSpreadsheet.id);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  // Drag and drop para colunas
  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !currentSpreadsheet) return;

    const { source, destination } = result;

    if (source.droppableId === 'available' && destination.droppableId === 'active') {
      // Mover coluna de disponível para ativa
      const columnToMove = availableColumns[source.index];
      const newAvailable = availableColumns.filter((_, index) => index !== source.index);
      
      const newColumns = [...currentSpreadsheet.columns];
      newColumns.splice(destination.index, 0, { ...columnToMove, visible: true });
      
      updateSpreadsheet(activeSpreadsheet, { columns: newColumns });
      setAvailableColumns(newAvailable);
    } else if (source.droppableId === 'active' && destination.droppableId === 'available') {
      // Mover coluna de ativa para disponível
      const columnToMove = currentSpreadsheet.columns[source.index];
      const newColumns = currentSpreadsheet.columns.filter((_, index) => index !== source.index);
      
      updateSpreadsheet(activeSpreadsheet, { columns: newColumns });
      setAvailableColumns(prev => [...prev, { ...columnToMove, visible: false }]);
    } else if (source.droppableId === 'active' && destination.droppableId === 'active') {
      // Reordenar colunas ativas
      const newColumns = [...currentSpreadsheet.columns];
      const [removed] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, removed);
      
      updateSpreadsheet(activeSpreadsheet, { columns: newColumns });
    }
  };

  // Atualizar planilha
  const updateSpreadsheet = (id: string, updates: Partial<SpreadsheetConfig>) => {
    setSpreadsheets(prev => prev.map(s => 
      s.id === id 
        ? { ...s, ...updates, modified: new Date() }
        : s
    ));
  };

  // Criar nova coluna
  const createNewColumn = () => {
    if (!newColumnName.trim() || !currentSpreadsheet) return;

    const newColumn: ColumnConfig = {
      id: Date.now().toString(),
      name: newColumnName,
      key: 'descricao', // Campo padrão
      type: 'text',
      visible: true,
      width: 150
    };

    const newColumns = [...currentSpreadsheet.columns, newColumn];
    updateSpreadsheet(activeSpreadsheet, { columns: newColumns });
    setNewColumnName('');
  };

  // Exportar para Excel
  const exportToExcel = () => {
    if (!currentSpreadsheet) return;

    const visibleColumns = currentSpreadsheet.columns.filter(col => col.visible);
    const headers = visibleColumns.map(col => col.name);
    
    const exportData = currentSpreadsheet.data.map(row => {
      const exportRow: any = {};
      visibleColumns.forEach(col => {
        let value = row[col.key];
        if (col.format === 'currency' && typeof value === 'number') {
          value = `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        }
        exportRow[col.name] = value;
      });
      return exportRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transações');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${currentSpreadsheet.name}.xlsx`);
  };

  // Duplicar planilha
  const duplicateSpreadsheet = () => {
    if (!currentSpreadsheet) return;

    const newSpreadsheet: SpreadsheetConfig = {
      ...currentSpreadsheet,
      id: Date.now().toString(),
      name: `${currentSpreadsheet.name} - Cópia`,
      created: new Date(),
      modified: new Date()
    };

    setSpreadsheets(prev => [...prev, newSpreadsheet]);
    setActiveSpreadsheet(newSpreadsheet.id);
  };

  if (!currentSpreadsheet) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gerenciador de Planilhas Financeiras</h1>
              <p className="text-gray-600">Organize, edite e visualize suas transações bancárias</p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setViewMode(viewMode === 'editor' ? 'preview' : 'editor')}
                variant={viewMode === 'editor' ? 'default' : 'outline'}
              >
                <Eye className="w-4 h-4 mr-2" />
                {viewMode === 'editor' ? 'Visualizar' : 'Editar'}
              </Button>
              <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                Exportar Excel
              </Button>
            </div>
          </div>

          {/* Tabs de planilhas */}
          <div className="flex space-x-2 mb-4">
            {spreadsheets.map(sheet => (
              <Button
                key={sheet.id}
                onClick={() => setActiveSpreadsheet(sheet.id)}
                variant={activeSpreadsheet === sheet.id ? 'default' : 'outline'}
                className="relative"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                {sheet.name}
                {sheet.data.length > 0 && (
                  <Badge className="ml-2 bg-blue-100 text-blue-800">{sheet.data.length}</Badge>
                )}
              </Button>
            ))}
            <Button onClick={duplicateSpreadsheet} variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              Duplicar
            </Button>
          </div>

          {/* Upload de arquivo */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-gray-600">
                <FileSpreadsheet className="w-8 h-8 mx-auto mb-2" />
                <p>Arraste um arquivo Excel/CSV ou clique para selecionar</p>
                <p className="text-sm text-gray-500">Suporta .xlsx, .xls, .csv</p>
              </div>
            </label>
          </div>
        </div>

        {viewMode === 'editor' ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Editor de Colunas */}
              <div className="lg:col-span-1">
                <Card className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Columns className="w-5 h-5 mr-2" />
                      Editor de Colunas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Criar nova coluna */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nova Coluna</label>
                      <div className="flex space-x-2">
                        <Input
                          value={newColumnName}
                          onChange={(e) => setNewColumnName(e.target.value)}
                          placeholder="Nome da coluna"
                        />
                        <Button onClick={createNewColumn} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Colunas Ativas */}
                    <div>
                      <h4 className="font-medium mb-2">Colunas Ativas</h4>
                      <Droppable droppableId="active">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2 min-h-[200px] bg-blue-50 p-3 rounded-lg"
                          >
                            {currentSpreadsheet.columns.map((column, index) => (
                              <Draggable key={column.id} draggableId={column.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="bg-white p-3 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">{column.name}</span>
                                      <Badge variant="outline">{column.type}</Badge>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>

                    {/* Colunas Disponíveis */}
                    {availableColumns.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Colunas Disponíveis</h4>
                        <Droppable droppableId="available">
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="space-y-2 min-h-[100px] bg-gray-50 p-3 rounded-lg"
                            >
                              {availableColumns.map((column, index) => (
                                <Draggable key={column.id} draggableId={column.id} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="bg-white p-3 rounded-lg shadow-sm border hover:shadow-md transition-shadow opacity-60"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium">{column.name}</span>
                                        <Badge variant="outline">{column.type}</Badge>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Preview da Tabela */}
              <div className="lg:col-span-2">
                <Card className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <FileSpreadsheet className="w-5 h-5 mr-2" />
                        {currentSpreadsheet.name}
                      </span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {currentSpreadsheet.data.length} registros
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            {currentSpreadsheet.columns.map(column => (
                              <th key={column.id} className="text-left p-3 font-medium">
                                {column.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {currentSpreadsheet.data.slice(0, 10).map((row, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              {currentSpreadsheet.columns.map(column => (
                                <td key={column.id} className="p-3">
                                  {column.format === 'currency' && typeof row[column.key] === 'number' 
                                    ? `R$ ${row[column.key].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                    : String(row[column.key] || '-')
                                  }
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {currentSpreadsheet.data.length > 10 && (
                      <p className="text-center text-gray-500 mt-4">
                        Mostrando 10 de {currentSpreadsheet.data.length} registros
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </DragDropContext>
        ) : (
          /* Modo de Visualização */
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{currentSpreadsheet.name}</h2>
              <div className="flex space-x-4 text-sm text-gray-600">
                <span>Criado: {currentSpreadsheet.created.toLocaleDateString('pt-BR')}</span>
                <span>Modificado: {currentSpreadsheet.modified.toLocaleDateString('pt-BR')}</span>
                <span>Registros: {currentSpreadsheet.data.length}</span>
              </div>
            </div>
            
            {/* Visualização estilo Excel */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      {currentSpreadsheet.columns.map(column => (
                        <th key={column.id} className="text-left p-2 border-r border-gray-300 font-medium text-sm">
                          {column.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentSpreadsheet.data.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-blue-50">
                        {currentSpreadsheet.columns.map(column => (
                          <td key={column.id} className="p-2 border-r border-gray-200 text-sm">
                            {column.format === 'currency' && typeof row[column.key] === 'number' 
                              ? `R$ ${row[column.key].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                              : String(row[column.key] || '')
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resumo estatístico */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      R$ {currentSpreadsheet.data
                        .filter(row => row.tipo === 'receita')
                        .reduce((sum, row) => sum + row.valor, 0)
                        .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-600">Total Receitas</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      R$ {currentSpreadsheet.data
                        .filter(row => row.tipo === 'despesa')
                        .reduce((sum, row) => sum + row.valor, 0)
                        .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-600">Total Despesas</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      R$ {(currentSpreadsheet.data
                        .filter(row => row.tipo === 'receita')
                        .reduce((sum, row) => sum + row.valor, 0) -
                        currentSpreadsheet.data
                        .filter(row => row.tipo === 'despesa')
                        .reduce((sum, row) => sum + row.valor, 0)
                      ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-600">Saldo Líquido</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}