import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, Palette, Layout, BarChart3, Users, Calendar, 
  Star, Zap, Eye, EyeOff, Move, X, CheckCircle, 
  Sparkles, Save, RotateCcw, Wand2 
} from 'lucide-react';

interface DashboardWidget {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'analytics' | 'management' | 'communication' | 'automation';
  size: 'small' | 'medium' | 'large';
  visible: boolean;
  position: number;
  aiRecommended?: boolean;
}

interface ThemeOption {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  preview: string;
}

export function DashboardPersonalizationAssistant() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'widgets' | 'themes' | 'layout' | 'ai'>('widgets');
  const [currentTheme, setCurrentTheme] = useState('dark-modern');
  const [layoutDensity, setLayoutDensity] = useState('comfortable');
  
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    {
      id: 'analytics-overview',
      name: 'Visão Geral Analytics',
      description: 'Métricas principais e KPIs em tempo real',
      icon: <BarChart3 className="w-4 h-4" />,
      category: 'analytics',
      size: 'large',
      visible: true,
      position: 1,
      aiRecommended: true
    },
    {
      id: 'recent-leads',
      name: 'Leads Recentes',
      description: 'Últimos leads cadastrados no sistema',
      icon: <Users className="w-4 h-4" />,
      category: 'management',
      size: 'medium',
      visible: true,
      position: 2
    },
    {
      id: 'upcoming-appointments',
      name: 'Próximos Agendamentos',
      description: 'Calendário de reuniões agendadas',
      icon: <Calendar className="w-4 h-4" />,
      category: 'management',
      size: 'medium',
      visible: true,
      position: 3,
      aiRecommended: true
    },
    {
      id: 'performance-chart',
      name: 'Gráfico de Performance',
      description: 'Evolução de vendas e conversões',
      icon: <BarChart3 className="w-4 h-4" />,
      category: 'analytics',
      size: 'large',
      visible: false,
      position: 4
    },
    {
      id: 'quick-actions',
      name: 'Ações Rápidas',
      description: 'Botões para tarefas mais comuns',
      icon: <Zap className="w-4 h-4" />,
      category: 'automation',
      size: 'small',
      visible: true,
      position: 5
    }
  ]);

  const themeOptions: ThemeOption[] = [
    {
      id: 'dark-modern',
      name: 'Escuro Moderno',
      description: 'Tema escuro profissional com acentos azuis',
      primaryColor: 'bg-slate-900',
      secondaryColor: 'bg-blue-600',
      preview: 'linear-gradient(135deg, #0f172a 0%, #1e40af 100%)'
    },
    {
      id: 'light-clean',
      name: 'Claro Limpo',
      description: 'Interface clara e minimalista',
      primaryColor: 'bg-white',
      secondaryColor: 'bg-blue-500',
      preview: 'linear-gradient(135deg, #ffffff 0%, #3b82f6 100%)'
    },
    {
      id: 'purple-gradient',
      name: 'Gradiente Roxo',
      description: 'Tema vibrante com gradientes roxo-azul',
      primaryColor: 'bg-purple-900',
      secondaryColor: 'bg-purple-600',
      preview: 'linear-gradient(135deg, #581c87 0%, #7c3aed 100%)'
    },
    {
      id: 'green-nature',
      name: 'Verde Natureza',
      description: 'Inspirado na natureza com tons verdes',
      primaryColor: 'bg-green-900',
      secondaryColor: 'bg-green-600',
      preview: 'linear-gradient(135deg, #14532d 0%, #16a34a 100%)'
    }
  ];

  const handleWidgetToggle = (widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, visible: !widget.visible }
        : widget
    ));
    console.log(`🔧 Widget ${widgetId} alternado`);
  };

  const handleWidgetReorder = (widgetId: string, direction: 'up' | 'down') => {
    setWidgets(prev => {
      const currentIndex = prev.findIndex(w => w.id === widgetId);
      if (currentIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newWidgets = [...prev];
      [newWidgets[currentIndex], newWidgets[newIndex]] = [newWidgets[newIndex], newWidgets[currentIndex]];
      
      return newWidgets.map((widget, index) => ({ ...widget, position: index + 1 }));
    });
  };

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    console.log(`🎨 Tema alterado para: ${themeId}`);
    // Aqui seria aplicado o tema globalmente
  };

  const getAIRecommendations = () => {
    return [
      {
        type: 'widget',
        title: 'Adicionar Widget de Performance',
        description: 'Baseado no seu uso, recomendamos adicionar gráficos de performance.',
        action: () => handleWidgetToggle('performance-chart')
      },
      {
        type: 'theme',
        title: 'Tema Escuro Recomendado',
        description: 'Usuários que trabalham em horários noturnos preferem temas escuros.',
        action: () => handleThemeChange('dark-modern')
      },
      {
        type: 'layout',
        title: 'Densidade Compacta',
        description: 'Para monitores menores, layout compacto otimiza o espaço.',
        action: () => setLayoutDensity('compact')
      }
    ];
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'analytics': return <BarChart3 className="w-3 h-3" />;
      case 'management': return <Users className="w-3 h-3" />;
      case 'communication': return <Users className="w-3 h-3" />;
      case 'automation': return <Zap className="w-3 h-3" />;
      default: return <Settings className="w-3 h-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'analytics': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'management': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'communication': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'automation': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleSaveConfiguration = () => {
    const config = {
      widgets: widgets.filter(w => w.visible).sort((a, b) => a.position - b.position),
      theme: currentTheme,
      layoutDensity
    };
    
    localStorage.setItem('dashboard-config', JSON.stringify(config));
    console.log('💾 Configuração salva:', config);
    alert('Configuração salva com sucesso!');
  };

  const handleResetToDefault = () => {
    // Reset para configurações padrão
    setCurrentTheme('dark-modern');
    setLayoutDensity('comfortable');
    setWidgets(prev => prev.map(widget => ({
      ...widget,
      visible: widget.aiRecommended || widget.position <= 3
    })));
    console.log('🔄 Configurações resetadas');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <Card className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden bg-slate-800/95 border-slate-700/50 backdrop-blur-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Wand2 className="w-5 h-5 text-purple-400" />
              Assistente de Personalização
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-slate-700/30 p-1 rounded-lg">
            {[
              { id: 'widgets', label: 'Widgets', icon: Layout },
              { id: 'themes', label: 'Temas', icon: Palette },
              { id: 'layout', label: 'Layout', icon: Settings },
              { id: 'ai', label: 'IA Sugestões', icon: Sparkles }
            ].map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex-1 ${
                  activeTab === id 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                variant="ghost"
                size="sm"
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
          {/* Widgets Tab */}
          {activeTab === 'widgets' && (
            <div className="space-y-3">
              <div className="text-sm text-gray-300 mb-4">
                Personalize quais widgets aparecem no seu dashboard
              </div>
              
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {widget.icon}
                      <span className="text-white font-medium">{widget.name}</span>
                    </div>
                    {widget.aiRecommended && (
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        <Star className="w-3 h-3 mr-1" />
                        IA
                      </Badge>
                    )}
                    <Badge className={getCategoryColor(widget.category)}>
                      {getCategoryIcon(widget.category)}
                      <span className="ml-1">{widget.category}</span>
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleWidgetReorder(widget.id, 'up')}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                    >
                      <Move className="w-3 h-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleWidgetToggle(widget.id)}
                      className={`h-8 w-8 p-0 ${
                        widget.visible 
                          ? 'text-green-400 hover:text-green-300' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {widget.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Themes Tab */}
          {activeTab === 'themes' && (
            <div className="space-y-3">
              <div className="text-sm text-gray-300 mb-4">
                Escolha um tema para personalizar a aparência do dashboard
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {themeOptions.map((theme) => (
                  <div
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      currentTheme === theme.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div
                      className="w-full h-16 rounded-lg mb-3"
                      style={{ background: theme.preview }}
                    />
                    <h3 className="text-white font-medium mb-1">{theme.name}</h3>
                    <p className="text-xs text-gray-400">{theme.description}</p>
                    
                    {currentTheme === theme.id && (
                      <div className="flex items-center gap-1 mt-2 text-green-400 text-xs">
                        <CheckCircle className="w-3 h-3" />
                        Tema Ativo
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Layout Tab */}
          {activeTab === 'layout' && (
            <div className="space-y-4">
              <div className="text-sm text-gray-300 mb-4">
                Configure a densidade e organização do layout
              </div>
              
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Densidade do Layout</label>
                <Select value={layoutDensity} onValueChange={setLayoutDensity}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="compact" className="text-white">Compacto</SelectItem>
                    <SelectItem value="comfortable" className="text-white">Confortável</SelectItem>
                    <SelectItem value="spacious" className="text-white">Espaçoso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm text-gray-300">Widgets Visíveis (em ordem)</h3>
                {widgets
                  .filter(w => w.visible)
                  .sort((a, b) => a.position - b.position)
                  .map((widget, index) => (
                    <div key={widget.id} className="flex items-center gap-3 p-2 bg-slate-700/30 rounded">
                      <span className="text-gray-400 text-sm w-6">{index + 1}.</span>
                      {widget.icon}
                      <span className="text-white text-sm">{widget.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* AI Suggestions Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-3">
              <div className="text-sm text-gray-300 mb-4">
                Sugestões personalizadas baseadas no seu uso
              </div>
              
              {getAIRecommendations().map((recommendation, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-medium mb-1">{recommendation.title}</h3>
                      <p className="text-sm text-gray-300">{recommendation.description}</p>
                    </div>
                    <Button
                      onClick={recommendation.action}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                      size="sm"
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {/* Footer Actions */}
        <div className="border-t border-slate-700/50 p-4 flex justify-between">
          <Button
            onClick={handleResetToDefault}
            variant="outline"
            className="text-gray-300 border-slate-600 hover:bg-slate-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveConfiguration}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Configuração
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}