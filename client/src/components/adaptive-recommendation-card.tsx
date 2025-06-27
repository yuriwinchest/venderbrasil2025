import { useAdaptiveRecommendationsEngine } from "@/hooks/use-adaptive-recommendations-engine";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface AdaptiveRecommendationCardProps {
  onContactClick: () => void;
}

export function AdaptiveRecommendationCard({ onContactClick }: AdaptiveRecommendationCardProps) {
  const { currentRecommendation, trackInteraction, userProfile } = useAdaptiveRecommendationsEngine();
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-close expanded card after some time
  useEffect(() => {
    if (isExpanded) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  const handleCardClick = () => {
    setIsExpanded(!isExpanded);
    if (currentRecommendation) {
      trackInteraction('recommendation-view', { 
        id: currentRecommendation.id,
        type: currentRecommendation.type 
      });
    }
  };

  const handleCTAClick = () => {
    if (currentRecommendation) {
      trackInteraction('recommendation-cta', { 
        id: currentRecommendation.id,
        action: 'contact' 
      });
    }
    onContactClick();
  };

  if (!currentRecommendation) {
    return (
      <div className="fixed left-4 bottom-20 z-40">
        <Button
          disabled
          className="bg-gray-400 text-white rounded-full w-12 h-12 shadow-lg"
          size="sm"
        >
          ⏳
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed left-4 bottom-20 z-40 max-w-xs">
      {/* Collapsed button state */}
      <Button
        onClick={handleCardClick}
        className={`emotion-bg-primary text-white rounded-full w-12 h-12 shadow-lg hover:scale-110 transition-all ${
          currentRecommendation.urgency === 'high' ? 'animate-pulse' : ''
        }`}
        size="sm"
      >
        {currentRecommendation.type === 'consultation' ? '📞' : 
         currentRecommendation.type === 'service' ? '💡' : 
         currentRecommendation.type === 'upgrade' ? '⭐' : '🎯'}
      </Button>
      
      {/* Expanded card */}
      {isExpanded && (
        <Card className={`absolute bottom-16 left-0 recommendation-card bg-white/95 backdrop-blur-sm shadow-xl border-l-4 border-gray-200 card-hover max-w-xs ${
          currentRecommendation.urgency === 'high' ? 'priority-high border-l-red-500' : 
          currentRecommendation.urgency === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500'
        }`}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col gap-1">
                <Badge 
                  className={`text-white px-2 py-1 text-xs ${
                    currentRecommendation.urgency === 'high' ? 'bg-red-500' :
                    currentRecommendation.urgency === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                >
                  {currentRecommendation.confidence}% Match
                </Badge>
                {currentRecommendation.socialProof && (
                  <span className="text-xs text-gray-500">{currentRecommendation.socialProof}</span>
                )}
              </div>
              <Button
                onClick={() => setIsExpanded(false)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>
            
            <h4 className="font-semibold text-gray-900 text-sm mb-1 leading-tight">
              {currentRecommendation.title}
            </h4>
            
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-bold text-green-600">
                {currentRecommendation.price}
              </div>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {currentRecommendation.timeframe}
              </span>
            </div>
            
            <p className="text-gray-600 text-xs leading-relaxed mb-2">
              {currentRecommendation.description}
            </p>

            {currentRecommendation.personalizedMessage && (
              <div className="bg-blue-50 rounded-lg p-2 mb-2">
                <p className="text-blue-800 text-xs font-medium">
                  🎯 {currentRecommendation.personalizedMessage}
                </p>
              </div>
            )}

            {currentRecommendation.benefits && currentRecommendation.benefits.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-700 mb-1">Inclui:</p>
                <div className="flex flex-wrap gap-1">
                  {currentRecommendation.benefits.slice(0, 3).map((benefit, index) => (
                    <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-amber-50 border-l-4 border-amber-400 p-2 mb-3">
              <p className="text-amber-800 text-xs font-medium">
                💡 {currentRecommendation.reasoning}
              </p>
            </div>
            
            <Button 
              onClick={handleCTAClick}
              size="sm"
              className={`w-full text-white transition-all ${
                currentRecommendation.urgency === 'high' ? 'bg-red-600 hover:bg-red-700' :
                'emotion-cta btn-cta'
              }`}
            >
              <MessageCircle className="mr-1 h-3 w-3" />
              {currentRecommendation.cta}
            </Button>

            {/* User context indicator */}
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Para {userProfile.deviceType === 'mobile' ? '📱 Mobile' : '💻 Desktop'} • 
                {userProfile.timeOfDay === 'morning' ? '🌅' : 
                 userProfile.timeOfDay === 'afternoon' ? '☀️' : 
                 userProfile.timeOfDay === 'evening' ? '🌆' : '🌙'} {userProfile.timeOfDay}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}