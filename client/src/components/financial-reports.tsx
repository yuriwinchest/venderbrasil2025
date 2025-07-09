import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, Download, Mail, Printer, TrendingUp, 
  DollarSign, BarChart3, PieChart, Calendar 
} from "lucide-react";
import { DateRange } from "react-day-picker";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface FinancialReportsProps {
  leads: any[];
  projects: any[];
  appointments: any[];
  platformCosts: any[];
}

type ReportType = 'summary' | 'detailed' | 'leads' | 'projects' | 'costs' | 'roi';
type ExportFormat = 'pdf' | 'csv' | 'excel' | 'json';

export function FinancialReports({ leads, projects, appointments, platformCosts }: FinancialReportsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('summary');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('pdf');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [includeCharts, setIncludeCharts] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate financial metrics
  const metrics = useMemo(() => {
    const totalRevenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalCosts = platformCosts.reduce((sum, c) => sum + c.cost, 0);
    const profit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    
    const conversionRate = leads.length > 0 ? (projects.length / leads.length) * 100 : 0;
    const avgProjectValue = projects.length > 0 ? totalRevenue / projects.length : 0;
    
    const leadsThisMonth = leads.filter(l => {
      const date = new Date(l.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    return {
      totalRevenue,
      totalCosts,
      profit,
      profitMargin,
      conversionRate,
      avgProjectValue,
      leadsThisMonth,
      totalLeads: leads.length,
      totalProjects: projects.length,
      totalAppointments: appointments.length
    };
  }, [leads, projects, appointments, platformCosts]);

  // Filter data by date range
  const filteredData = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return { leads, projects, appointments, platformCosts };
    }

    const filterByDate = (items: any[], dateField: string) => {
      return items.filter(item => {
        const itemDate = new Date(item[dateField]);
        return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
      });
    };

    return {
      leads: filterByDate(leads, 'createdAt'),
      projects: filterByDate(projects, 'createdAt'),
      appointments: filterByDate(appointments, 'date'),
      platformCosts: filterByDate(platformCosts, 'createdAt')
    };
  }, [leads, projects, appointments, platformCosts, dateRange]);

  const generateCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateJSON = (data: any, filename: string) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generatePDF = async () => {
    const reportElement = document.getElementById('financial-report');
    if (!reportElement) return;

    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`relatorio-financeiro-${Date.now()}.pdf`);
  };

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const baseFilename = `relatorio-${reportType}-${timestamp}`;

      switch (exportFormat) {
        case 'pdf':
          await generatePDF();
          break;
          
        case 'csv':
          if (reportType === 'leads') generateCSV(filteredData.leads, `${baseFilename}-leads`);
          else if (reportType === 'projects') generateCSV(filteredData.projects, `${baseFilename}-projects`);
          else if (reportType === 'costs') generateCSV(filteredData.platformCosts, `${baseFilename}-custos`);
          else {
            // Generate combined CSV for summary
            generateCSV([{
              'Total de Leads': metrics.totalLeads,
              'Leads Este Mês': metrics.leadsThisMonth,
              'Total de Projetos': metrics.totalProjects,
              'Receita Total': metrics.totalRevenue,
              'Custos Totais': metrics.totalCosts,
              'Lucro': metrics.profit,
              'Margem de Lucro (%)': metrics.profitMargin.toFixed(2),
              'Taxa de Conversão (%)': metrics.conversionRate.toFixed(2),
              'Valor Médio por Projeto': metrics.avgProjectValue
            }], `${baseFilename}-resumo`);
          }
          break;
          
        case 'json':
          const reportData = {
            tipo: reportType,
            periodo: dateRange ? {
              inicio: dateRange.from?.toISOString(),
              fim: dateRange.to?.toISOString()
            } : 'Todos os períodos',
            metricas: metrics,
            dados: filteredData,
            geradoEm: new Date().toISOString()
          };
          generateJSON(reportData, baseFilename);
          break;
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportTitle = () => {
    const titles = {
      summary: 'Resumo Executivo',
      detailed: 'Relatório Detalhado',
      leads: 'Relatório de Leads',
      projects: 'Relatório de Projetos',
      costs: 'Relatório de Custos',
      roi: 'Análise de ROI'
    };
    return titles[reportType] || 'Relatório Financeiro';
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <FileText className="h-4 w-4 mr-2" />
            Gerar Relatório
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Exportação de Relatórios Financeiros
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Panel */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-3 block">Tipo de Relatório</label>
                <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">📊 Resumo Executivo</SelectItem>
                    <SelectItem value="detailed">📋 Relatório Detalhado</SelectItem>
                    <SelectItem value="leads">👥 Relatório de Leads</SelectItem>
                    <SelectItem value="projects">🏗️ Relatório de Projetos</SelectItem>
                    <SelectItem value="costs">💰 Relatório de Custos</SelectItem>
                    <SelectItem value="roi">📈 Análise de ROI</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Formato de Exportação</label>
                <Select value={exportFormat} onValueChange={(value: ExportFormat) => setExportFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">📄 PDF (Relatório Visual)</SelectItem>
                    <SelectItem value="csv">📊 CSV (Planilha)</SelectItem>
                    <SelectItem value="json">⚙️ JSON (Dados Estruturados)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Período</label>
                <DatePickerWithRange
                  selected={dateRange}
                  onSelect={setDateRange}
                />
                {dateRange && (
                  <p className="text-xs text-gray-500 mt-2">
                    Dados filtrados de {dateRange.from?.toLocaleDateString()} até {dateRange.to?.toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={includeCharts}
                  onCheckedChange={setIncludeCharts}
                />
                <label className="text-sm">Incluir gráficos (apenas PDF)</label>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="space-y-4">
              <h3 className="font-semibold">Preview: {getReportTitle()}</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Receita Total</p>
                      <p className="text-lg font-bold text-green-600">
                        R$ {metrics.totalRevenue.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Lucro</p>
                      <p className="text-lg font-bold text-blue-600">
                        R$ {metrics.profit.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Conv. Rate</p>
                      <p className="text-lg font-bold text-purple-600">
                        {metrics.conversionRate.toFixed(1)}%
                      </p>
                    </div>
                    <PieChart className="h-8 w-8 text-purple-500" />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Leads/Mês</p>
                      <p className="text-lg font-bold text-orange-600">
                        {metrics.leadsThisMonth}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-500" />
                  </div>
                </Card>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Margem de Lucro</span>
                    <span>{metrics.profitMargin.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(metrics.profitMargin, 100)} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Taxa de Conversão</span>
                    <span>{metrics.conversionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.min(metrics.conversionRate, 100)} className="h-2" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Enviar por Email
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={generateReport}
                disabled={isGenerating}
                className="bg-gradient-to-r from-blue-500 to-blue-600"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar {exportFormat.toUpperCase()}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden Report Template for PDF Generation */}
      <div id="financial-report" className="hidden print:block p-8 bg-white">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{getReportTitle()}</h1>
          <p className="text-gray-600">
            Relatório gerado em {new Date().toLocaleDateString('pt-BR')}
          </p>
          {dateRange && (
            <p className="text-gray-600">
              Período: {dateRange.from?.toLocaleDateString()} - {dateRange.to?.toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Receita</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total de Projetos:</span>
                <span className="font-semibold">{metrics.totalProjects}</span>
              </div>
              <div className="flex justify-between">
                <span>Receita Total:</span>
                <span className="font-semibold">R$ {metrics.totalRevenue.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Valor Médio/Projeto:</span>
                <span className="font-semibold">R$ {metrics.avgProjectValue.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-4">Custos</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Custos Totais:</span>
                <span className="font-semibold">R$ {metrics.totalCosts.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Lucro:</span>
                <span className="font-semibold">R$ {metrics.profit.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Margem de Lucro:</span>
                <span className="font-semibold">{metrics.profitMargin.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Performance de Vendas</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.totalLeads}</div>
              <div className="text-sm text-gray-600">Total de Leads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.conversionRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Taxa de Conversão</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.leadsThisMonth}</div>
              <div className="text-sm text-gray-600">Leads Este Mês</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}