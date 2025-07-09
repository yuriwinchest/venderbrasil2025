import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, Calendar, Users, BarChart3, MessageSquare, 
  Zap, PhoneCall, Mail, FileText, Star, X 
} from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  shortcut?: string;
}

export function FloatingActionButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentActions, setRecentActions] = useState<string[]>([]);

  const quickActions: QuickAction[] = [
    {
      id: 'new-lead',
      label: 'Novo Lead',
      icon: <Users className="w-4 h-4" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => handleQuickAction('new-lead', 'Criar novo lead'),
      shortcut: 'Ctrl+N'
    },
    {
      id: 'schedule',
      label: 'Agendar',
      icon: <Calendar className="w-4 h-4" />,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => handleQuickAction('schedule', 'Agendar reunião'),
      shortcut: 'Ctrl+S'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => handleQuickAction('analytics', 'Ver relatórios'),
      shortcut: 'Ctrl+A'
    },
    {
      id: 'message',
      label: 'Mensagem',
      icon: <MessageSquare className="w-4 h-4" />,
      color: 'bg-orange-600 hover:bg-orange-700',
      action: () => handleQuickAction('message', 'Enviar mensagem'),
      shortcut: 'Ctrl+M'
    },
    {
      id: 'call',
      label: 'Ligar',
      icon: <PhoneCall className="w-4 h-4" />,
      color: 'bg-red-600 hover:bg-red-700',
      action: () => handleQuickAction('call', 'Fazer ligação'),
      shortcut: 'Ctrl+L'
    },
    {
      id: 'email',
      label: 'Email',
      icon: <Mail className="w-4 h-4" />,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      action: () => handleQuickAction('email', 'Enviar email'),
      shortcut: 'Ctrl+E'
    }
  ];

  const handleQuickAction = (actionId: string, description: string) => {
    console.log(`⚡ Ação rápida: ${description}`);
    
    // Adicionar à lista de ações recentes
    setRecentActions(prev => {
      const updated = [actionId, ...prev.filter(id => id !== actionId)].slice(0, 3);
      return updated;
    });

    // Simular ação baseada no tipo
    switch (actionId) {
      case 'new-lead':
        // Navegar para formulário de lead ou abrir modal
        window.location.href = '/admin#leads';
        break;
      case 'schedule':
        // Navegar para calendário
        window.location.href = '/#scheduling';
        break;
      case 'analytics':
        // Navegar para data analyzer
        window.location.href = '/data-analyzer';
        break;
      case 'message':
        // Abrir WhatsApp Web ou sistema de mensagens
        window.open('https://web.whatsapp.com', '_blank');
        break;
      case 'call':
        // Simular abertura de dialer ou sistema de chamadas
        alert('🔍 Integrando com sistema de chamadas...');
        break;
      case 'email':
        // Abrir Gmail ou cliente de email
        window.open('mailto:', '_blank');
        break;
    }

    setIsExpanded(false);
  };

  const getMostUsedActions = () => {
    return recentActions.map(actionId => 
      quickActions.find(action => action.id === actionId)
    ).filter(Boolean).slice(0, 2);
  };

  return (
    <div className="fixed bottom-20 right-4 z-30 flex flex-col items-end space-y-3">
      {/* Quick Actions Menu */}
      {isExpanded && (
        <Card className="bg-slate-800/95 border-slate-700/50 backdrop-blur-md">
          <CardContent className="p-3">
            <div className="space-y-2">
              {/* Recent Actions Header */}
              {recentActions.length > 0 && (
                <>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                    Ações Recentes
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {getMostUsedActions().map((action) => action && (
                      <Button
                        key={action.id}
                        onClick={action.action}
                        className={`${action.color} text-white text-xs py-2 px-3 h-auto flex items-center gap-2`}
                      >
                        {action.icon}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                  <div className="border-t border-slate-700/50 mb-2"></div>
                </>
              )}

              {/* All Actions */}
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                Todas as Ações
              </div>
              <div className="grid grid-cols-2 gap-2 max-w-xs">
                {quickActions.map((action) => (
                  <Button
                    key={action.id}
                    onClick={action.action}
                    className={`${action.color} text-white text-xs py-2 px-3 h-auto flex flex-col items-center gap-1 relative group`}
                    title={action.shortcut}
                  >
                    {action.icon}
                    <span className="text-[10px]">{action.label}</span>
                    
                    {/* Shortcut Tooltip */}
                    {action.shortcut && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {action.shortcut}
                      </div>
                    )}
                  </Button>
                ))}
              </div>

              {/* AI Suggestions */}
              <div className="mt-3 pt-2 border-t border-slate-700/50">
                <div className="text-xs text-blue-400 flex items-center gap-1 mb-2">
                  <Zap className="w-3 h-3" />
                  Sugestão IA
                </div>
                <Button
                  onClick={() => handleQuickAction('analytics', 'Verificar métricas do dia')}
                  className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-700 hover:to-purple-700 text-white text-xs py-2 px-3 h-auto w-full"
                >
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Verificar métricas de hoje
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}



      {/* Notification Badge */}
      {recentActions.length > 0 && !isExpanded && (
        <div className="absolute -top-1 -left-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {recentActions.length}
        </div>
      )}
    </div>
  );
}