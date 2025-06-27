import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BarChart3, 
  Globe, 
  Clock, 
  Eye,
  TrendingUp,
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

interface AnalyticsData {
  totalVisitors: number;
  dataAnalyzerUsers: number;
  marketplaceUsers: number;
  averageSessionTime: number;
  topPages: Array<{ page: string; visits: number }>;
  deviceDistribution: Array<{ device: string; count: number }>;
  countryDistribution: Array<{ country: string; count: number }>;
}

interface UserAnalytic {
  id: number;
  sessionId: string;
  userAgent: string;
  ipAddress: string;
  page: string;
  action: string;
  timestamp: string;
  duration: number;
  deviceType: string;
  country: string;
  city: string;
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentActivity, setRecentActivity] = useState<UserAnalytic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [overviewRes, activityRes] = await Promise.all([
        fetch('/api/analytics/overview'),
        fetch('/api/analytics/users?limit=50')
      ]);

      const overviewData = await overviewRes.json();
      const activityData = await activityRes.json();

      setAnalytics(overviewData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Erro ao carregar dados de analytics</p>
      </div>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics do Sistema de Dados</h2>
        <Button onClick={fetchAnalytics} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total de Visitantes</p>
                <p className="text-3xl font-bold">{analytics.totalVisitors}</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Usuários Analisador</p>
                <p className="text-3xl font-bold">{analytics.dataAnalyzerUsers}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Usuários Marketplace</p>
                <p className="text-3xl font-bold">{analytics.marketplaceUsers}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Tempo Médio</p>
                <p className="text-3xl font-bold">{formatDuration(analytics.averageSessionTime)}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Páginas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Páginas Mais Visitadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topPages}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="page" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visits" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Dispositivos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Tipos de Dispositivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.deviceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ device, count }) => `${device}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.deviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Países */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Distribuição Geográfica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {analytics.countryDistribution.slice(0, 10).map((country, index) => (
              <div key={country.country} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">{country.count}</div>
                <div className="text-sm text-gray-600">{country.country}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Atividade Recente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Atividade Recente em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivity.slice(0, 20).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {activity.deviceType === 'mobile' && <Smartphone className="h-4 w-4 text-blue-500" />}
                  {activity.deviceType === 'desktop' && <Monitor className="h-4 w-4 text-green-500" />}
                  {activity.deviceType === 'tablet' && <Tablet className="h-4 w-4 text-purple-500" />}
                  
                  <div>
                    <div className="font-medium text-sm">{activity.action}</div>
                    <div className="text-xs text-gray-500">
                      {activity.page} • {activity.country}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </div>
                  {activity.duration && (
                    <Badge variant="outline" className="text-xs">
                      {formatDuration(activity.duration)}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-indigo-800">Insights Automáticos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border border-indigo-200">
              <div className="text-sm font-medium text-indigo-800">Taxa de Engajamento</div>
              <div className="text-lg font-bold text-indigo-600">
                {analytics.dataAnalyzerUsers > 0 
                  ? Math.round((analytics.dataAnalyzerUsers / analytics.totalVisitors) * 100)
                  : 0}%
              </div>
              <div className="text-xs text-indigo-600">dos visitantes usam o analisador</div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-green-200">
              <div className="text-sm font-medium text-green-800">Adoção Marketplace</div>
              <div className="text-lg font-bold text-green-600">
                {analytics.marketplaceUsers > 0 
                  ? Math.round((analytics.marketplaceUsers / analytics.totalVisitors) * 100)
                  : 0}%
              </div>
              <div className="text-xs text-green-600">testam o processador</div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-orange-200">
              <div className="text-sm font-medium text-orange-800">Sessão Ideal</div>
              <div className="text-lg font-bold text-orange-600">
                {analytics.averageSessionTime > 120 ? 'Excelente' : 
                 analytics.averageSessionTime > 60 ? 'Bom' : 'Pode Melhorar'}
              </div>
              <div className="text-xs text-orange-600">tempo de engajamento</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}