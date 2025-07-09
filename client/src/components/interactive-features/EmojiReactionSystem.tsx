import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Zap } from 'lucide-react';

interface EmojiReaction {
  emoji: string;
  count: number;
  label: string;
  color: string;
}

interface EmojiReactionSystemProps {
  contentId: string;
  contentType: 'lead' | 'project' | 'appointment' | 'analysis';
  className?: string;
}

export function EmojiReactionSystem({ contentId, contentType, className = '' }: EmojiReactionSystemProps) {
  const [reactions, setReactions] = useState<EmojiReaction[]>([
    { emoji: '👍', count: Math.floor(Math.random() * 5), label: 'Gostei', color: 'text-blue-400' },
    { emoji: '❤️', count: Math.floor(Math.random() * 3), label: 'Amei', color: 'text-red-400' },
    { emoji: '⭐', count: Math.floor(Math.random() * 4), label: 'Favorito', color: 'text-yellow-400' },
    { emoji: '🚀', count: Math.floor(Math.random() * 2), label: 'Incrível', color: 'text-purple-400' },
    { emoji: '🎯', count: Math.floor(Math.random() * 3), label: 'Preciso', color: 'text-green-400' },
    { emoji: '🏆', count: Math.floor(Math.random() * 2), label: 'Perfeito', color: 'text-orange-400' }
  ]);

  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState(false);

  const handleReaction = (emoji: string) => {
    setReactions(prev => prev.map(reaction => {
      if (reaction.emoji === emoji) {
        const isRemoving = userReaction === emoji;
        setUserReaction(isRemoving ? null : emoji);
        return {
          ...reaction,
          count: isRemoving ? Math.max(0, reaction.count - 1) : reaction.count + (userReaction ? 0 : 1)
        };
      } else if (reaction.emoji === userReaction) {
        return { ...reaction, count: Math.max(0, reaction.count - 1) };
      }
      return reaction;
    }));

    console.log(`🎭 Reação ${emoji} para ${contentType} ${contentId}`);
  };

  const getAIRecommendedReaction = () => {
    const recommendations = {
      'lead': '🎯',
      'project': '🚀', 
      'appointment': '⭐',
      'analysis': '🏆'
    };
    return recommendations[contentType] || '👍';
  };

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowReactions(!showReactions)}
        className="relative bg-slate-700/30 hover:bg-slate-600/50 text-white border border-slate-600/50 backdrop-blur-sm"
      >
        <Heart className="w-4 h-4 mr-1" />
        {totalReactions > 0 && (
          <span className="ml-1 text-xs bg-blue-500/80 text-white px-1.5 py-0.5 rounded-full">
            {totalReactions}
          </span>
        )}
      </Button>

      {showReactions && (
        <Card className="absolute z-50 mt-2 bg-slate-800/95 border-slate-700/50 backdrop-blur-md min-w-[280px] shadow-2xl">
          <CardContent className="p-3">
            <div className="space-y-3">
              <div className="text-xs text-blue-400 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                IA recomenda: {getAIRecommendedReaction()} para este {contentType}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {reactions.map((reaction) => (
                  <Button
                    key={reaction.emoji}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(reaction.emoji)}
                    className={`
                      flex flex-col items-center p-2 h-auto transition-all duration-200 hover:scale-105
                      ${userReaction === reaction.emoji 
                        ? 'bg-blue-500/20 border border-blue-500/50 scale-105' 
                        : 'hover:bg-slate-700/50'
                      }
                    `}
                  >
                    <span className="text-lg mb-1">{reaction.emoji}</span>
                    <span className="text-xs text-gray-300">{reaction.label}</span>
                    {reaction.count > 0 && (
                      <span className={`text-xs ${reaction.color} font-medium`}>
                        {reaction.count}
                      </span>
                    )}
                  </Button>
                ))}
              </div>

              {totalReactions > 0 && (
                <div className="text-xs text-gray-400 pt-2 border-t border-slate-700/50">
                  Total: {totalReactions} reações
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}