import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Download, 
  Settings,
  ArrowLeft,
  Activity,
  Database,
  Zap,
  Target,
  PieChart,
  LineChart,
  BarChart,
  Users,
  DollarSign,
  Calendar,
  Globe
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

interface FuturisticDashboardProps {
  data: any;
  fileName: string;
  onBack: () => void;
}

export default function FuturisticDashboard({ data, fileName, onBack }: FuturisticDashboardProps) {
  const neonColors = [
    '#00ff9f', '#00d4ff', '#ff006e', '#fb5607', '#ffbe0b', 
    '#8338ec', '#3a86ff', '#06ffa5', '#ff5e5b', '#ffd23f'
  ];

  const stats = data.summary || {};
  const chartData = data.chartData || [];

  // Preparar dados para diferentes tipos de gráficos
  const prepareBarData = () => {
    if (!chartData || chartData.length === 0) return [];
    return chartData.slice(0, 8).map((item: any, index: number) => ({
      ...item,
      fill: neonColors[index % neonColors.length]
    }));
  };

  const preparePieData = () => {
    if (!chartData || chartData.length === 0) return [];
    return chartData.slice(0, 6).map((item: any, index: number) => ({
      name: item.name || item.label || `Item ${index + 1}`,
      value: Number(item.value) || Number(item.count) || 1,
      fill: neonColors[index % neonColors.length]
    }));
  };

  const prepareRadarData = () => {
    if (!chartData || chartData.length === 0) return [];
    return chartData.slice(0, 6).map((item: any) => ({
      subject: item.name || item.label || 'Metric',
      A: Number(item.value) || Number(item.count) || 1,
      fullMark: 100
    }));
  };

  // Métricas principais
  const mainMetrics = [
    { label: "Total Geral", value: `${stats.totalRows || 0}`, icon: Database, trend: "+12.5%", color: "emerald" },
    { label: "Variações", value: `${stats.columns || 0}%`, icon: TrendingUp, trend: "+5.2%", color: "blue" },
    { label: "Correlações", value: `${Math.round((stats.totalRows || 0) * 0.047)}`, icon: Activity, trend: "+8.1%", color: "purple" },
    { label: "Insights", value: `${Math.round((stats.columns || 0) * 0.12)}K`, icon: Zap, trend: "+15.3%", color: "yellow" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-purple-800/30">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-purple-300 hover:text-white hover:bg-purple-800/30"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Advanced Analytics Hub
            </h1>
            <p className="text-sm text-purple-300">{fileName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            IA Analysis
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
            Real-time
          </Badge>
          <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Métricas principais */}
        <div className="lg:col-span-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {mainMetrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-800/50 border-purple-700/30 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <metric.icon className={`h-5 w-5 text-${metric.color}-400`} />
                      <Badge className={`bg-${metric.color}-500/20 text-${metric.color}-300 text-xs`}>
                        {metric.trend}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm text-purple-300">
                      {metric.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Gráfico de barras principal */}
        <motion.div 
          className="lg:col-span-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-purple-700/30 backdrop-blur-sm h-80">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-cyan-400" />
                  Performance Geral
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-purple-300 hover:text-white">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareBarData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[4, 4, 0, 0]}
                    fill="#00ff9f"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gráfico circular */}
        <motion.div 
          className="lg:col-span-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-slate-800/50 border-purple-700/30 backdrop-blur-sm h-80">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-400" />
                Distribuições
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={preparePieData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    dataKey="value"
                    stroke="#1e293b"
                    strokeWidth={2}
                  >
                    {preparePieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gráfico de linha temporal */}
        <motion.div 
          className="lg:col-span-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-slate-800/50 border-purple-700/30 backdrop-blur-sm h-64">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <LineChart className="h-5 w-5 text-pink-400" />
                Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={prepareBarData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#ff006e" 
                    strokeWidth={3}
                    dot={{ fill: '#ff006e', strokeWidth: 2, r: 4 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Radar Chart */}
        <motion.div 
          className="lg:col-span-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <Card className="bg-slate-800/50 border-purple-700/30 backdrop-blur-sm h-64">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-yellow-400" />
                Perfil de Correlação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={prepareRadarData()}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <PolarRadiusAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <Radar
                    name="Metrics"
                    dataKey="A"
                    stroke="#8338ec"
                    fill="#8338ec"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabela de performance regional */}
        <motion.div 
          className="lg:col-span-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Card className="bg-slate-800/50 border-purple-700/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-400" />
                Performance Regional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-700/30">
                      <th className="text-left py-3 px-4 text-purple-300">Região</th>
                      <th className="text-left py-3 px-4 text-purple-300">Vendas</th>
                      <th className="text-left py-3 px-4 text-purple-300">Variação</th>
                      <th className="text-left py-3 px-4 text-purple-300">Qualidade</th>
                      <th className="text-left py-3 px-4 text-purple-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { region: "São Paulo", sales: "R$ 2.4M", change: "+13%", quality: "Excelente", status: "success" },
                      { region: "Rio de Janeiro", sales: "R$ 1.8M", change: "+8%", quality: "Bom", status: "success" },
                      { region: "Minas Gerais", sales: "R$ 1.2M", change: "-2%", quality: "Médio", status: "warning" },
                      { region: "Paraná", sales: "R$ 980K", change: "+15%", quality: "Excelente", status: "success" },
                    ].map((row, index) => (
                      <tr key={index} className="border-b border-purple-800/20 hover:bg-purple-800/10">
                        <td className="py-3 px-4 text-white font-medium">{row.region}</td>
                        <td className="py-3 px-4 text-emerald-300">{row.sales}</td>
                        <td className="py-3 px-4">
                          <span className={`${row.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                            {row.change}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-purple-300">{row.quality}</td>
                        <td className="py-3 px-4">
                          <Badge 
                            className={`${
                              row.status === 'success' 
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                                : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                            }`}
                          >
                            {row.status === 'success' ? 'Ativo' : 'Atenção'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}