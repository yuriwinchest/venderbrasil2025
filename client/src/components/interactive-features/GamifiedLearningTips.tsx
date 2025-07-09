import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, Star, Target, Zap, BookOpen, CheckCircle, 
  Brain, Lightbulb, Award, TrendingUp, X 
} from 'lucide-react';

interface LearningTip {
  id: string;
  title: string;
  content: string;
  category: 'marketing' | 'vendas' | 'analytics' | 'produtividade';
  difficulty: 'iniciante' | 'intermediario' | 'avancado';
  xpReward: number;
  completed: boolean;
}

interface UserProgress {
  level: number;
  xp: number;
  totalTipsCompleted: number;
  streak: number;
  badges: string[];
}

export function GamifiedLearningTips() {
  const [currentTip, setCurrentTip] = useState<LearningTip | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    level: 1,
    xp: 125,
    totalTipsCompleted: 8,
    streak: 3,
    badges: ['early-bird', 'consistent-learner']
  });
  
  const [showTipModal, setShowTipModal] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const learningTips: LearningTip[] = [
    {
      id: '1',
      title: 'Optimize Product Titles',
      content: 'Use palavras-chave relevantes nos primeiros 80 caracteres do título. Isso melhora a visibilidade em 65% nos resultados de busca.',
      category: 'marketing',
      difficulty: 'iniciante',
      xpReward: 15,
      completed: false
    },
    {
      id: '2', 
      title: 'Price Psychology',
      content: 'Preços terminados em 7 ou 9 (R$ 47, R$ 99) aumentam a percepção de valor. Testes mostram 23% mais conversões.',
      category: 'vendas',
      difficulty: 'intermediario',
      xpReward: 25,
      completed: false
    },
    {
      id: '3',
      title: 'Analytics Deep Dive',
      content: 'Monitor taxa de rejeição por fonte de tráfego. Identifique canais de baixa qualidade e otimize investimentos.',
      category: 'analytics',
      difficulty: 'avancado',
      xpReward: 35,
      completed: false
    },
    {
      id: '4',
      title: 'Automation Boost',
      content: 'Configure respostas automáticas para leads em até 5 minutos. Aumenta conversão em 400% comparado a 24h.',
      category: 'produtividade',
      difficulty: 'intermediario',
      xpReward: 30,
      completed: false
    }
  ];

  const badges = {
    'early-bird': { name: 'Madrugador', icon: '🌅', description: 'Ativo antes das 8h' },
    'consistent-learner': { name: 'Consistente', icon: '📚', description: '3+ dias seguidos' },
    'analytics-master': { name: 'Mestre Analytics', icon: '📊', description: '10 dicas de analytics' },
    'sales-guru': { name: 'Guru de Vendas', icon: '💰', description: '15 dicas de vendas' }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'iniciante': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediario': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'avancado': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'marketing': return <Target className="w-4 h-4" />;
      case 'vendas': return <TrendingUp className="w-4 h-4" />;
      case 'analytics': return <Brain className="w-4 h-4" />;
      case 'produtividade': return <Zap className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getRandomTip = () => {
    const availableTips = learningTips.filter(tip => !tip.completed);
    if (availableTips.length === 0) return null;
    
    return availableTips[Math.floor(Math.random() * availableTips.length)];
  };

  const markTipCompleted = (tipId: string) => {
    const tip = learningTips.find(t => t.id === tipId);
    if (!tip) return;

    setUserProgress(prev => ({
      ...prev,
      xp: prev.xp + tip.xpReward,
      totalTipsCompleted: prev.totalTipsCompleted + 1,
      streak: prev.streak + 1,
      level: Math.floor((prev.xp + tip.xpReward) / 100) + 1
    }));

    tip.completed = true;
    setShowTipModal(false);
    setCurrentTip(null);
    
    console.log(`🎯 Dica completada: +${tip.xpReward} XP`);
  };

  const nextLevel = Math.ceil(userProgress.level * 100);
  const progressPercentage = (userProgress.xp % 100);

  useEffect(() => {
    // Mostrar dica a cada 2 minutos
    const interval = setInterval(() => {
      if (!showTipModal && isVisible) {
        const tip = getRandomTip();
        if (tip) {
          setCurrentTip(tip);
          setShowTipModal(true);
        }
      }
    }, 120000); // 2 minutos

    return () => clearInterval(interval);
  }, [showTipModal, isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Progress Widget (Hidden) */}
      <Card className="fixed bottom-4 right-4 z-40 bg-slate-800/95 border-slate-700/50 backdrop-blur-md max-w-xs" style={{ display: 'none' }}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Nível {userProgress.level}</span>
            </div>
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-purple-400" />
              {userProgress.xp} XP
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" />
              {userProgress.totalTipsCompleted} dicas
            </div>
          </div>

          {userProgress.streak > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-orange-400">
              <Zap className="w-3 h-3" />
              {userProgress.streak} dias seguidos! 🔥
            </div>
          )}

          <Button
            onClick={() => {
              const tip = getRandomTip();
              if (tip) {
                setCurrentTip(tip);
                setShowTipModal(true);
              }
            }}
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs py-1"
          >
            <Lightbulb className="w-3 h-3 mr-1" />
            Nova Dica
          </Button>
        </CardContent>
      </Card>

      {/* Learning Tip Modal */}
      {showTipModal && currentTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="max-w-md mx-4 bg-slate-800/95 border-slate-700/50 backdrop-blur-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  {getCategoryIcon(currentTip.category)}
                  Dica de Aprendizado
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTipModal(false)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(currentTip.difficulty)}>
                  {currentTip.difficulty}
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {currentTip.category}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-white mb-2">{currentTip.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {currentTip.content}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                <div className="flex items-center gap-1 text-sm text-yellow-400">
                  <Award className="w-4 h-4" />
                  +{currentTip.xpReward} XP
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowTipModal(false)}
                    className="text-gray-300 border-slate-600 hover:bg-slate-700"
                  >
                    Depois
                  </Button>
                  <Button
                    onClick={() => markTipCompleted(currentTip.id)}
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Entendi!
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}