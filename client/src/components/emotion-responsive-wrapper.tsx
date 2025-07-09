// Simple Wrapper Component
import React from 'react';

interface EmotionResponsiveWrapperProps {
  children: React.ReactNode;
  enableDebug?: boolean;
}

export function EmotionResponsiveWrapper({ children }: EmotionResponsiveWrapperProps) {
  return (
    <div className="emotion-wrapper">
      {children}
    </div>
  );
}