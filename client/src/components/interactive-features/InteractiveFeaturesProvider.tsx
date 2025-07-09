import React from 'react';
import { GamifiedLearningTips } from './GamifiedLearningTips';
import { FloatingActionButton } from './FloatingActionButton';
import { ContextualHelpOverlay } from './ContextualHelpOverlay';
import { DashboardPersonalizationAssistant } from './DashboardPersonalizationAssistant';

interface InteractiveFeaturesProviderProps {
  children: React.ReactNode;
  enableFeatures?: {
    gamifiedTips?: boolean;
    floatingActions?: boolean;
    helpOverlay?: boolean;
    dashboardCustomization?: boolean;
  };
}

export function InteractiveFeaturesProvider({ 
  children, 
  enableFeatures = {
    gamifiedTips: true,
    floatingActions: true,
    helpOverlay: true,
    dashboardCustomization: true
  }
}: InteractiveFeaturesProviderProps) {
  return (
    <>
      {children}
      
      {/* Funcionalidades Interativas Globais */}
      {enableFeatures.gamifiedTips && <GamifiedLearningTips />}
      {enableFeatures.floatingActions && <FloatingActionButton />}
      {enableFeatures.helpOverlay && <ContextualHelpOverlay />}
      {enableFeatures.dashboardCustomization && <DashboardPersonalizationAssistant />}
    </>
  );
}