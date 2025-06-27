import React from 'react';

interface EmotionEnhancedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'cta' | 'secondary';
  size?: 'sm' | 'lg' | 'default';
  className?: string;
}

export function EmotionEnhancedButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'default',
  className = ''
}: EmotionEnhancedButtonProps) {
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'cta':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'lg':
        return 'px-8 py-4 text-lg';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        rounded-lg font-medium shadow-lg transition-all duration-300 hover:scale-105
        focus:outline-none focus:ring-2 focus:ring-offset-2
        ${className}
      `}
    >
      {children}
    </button>
  );
}