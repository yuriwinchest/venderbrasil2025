import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface BackToHomeButtonProps {
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
  showIcon?: boolean;
  text?: string;
}

export function BackToHomeButton({ 
  variant = "outline", 
  size = "default",
  className = "",
  showIcon = true,
  text = "Voltar ao Início"
}: BackToHomeButtonProps) {
  return (
    <Link href="/">
      <Button 
        variant={variant} 
        size={size}
        className={`bg-white/90 hover:bg-white border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 shadow-lg backdrop-blur-sm transition-all duration-200 ${className}`}
      >
        {showIcon && <Home className="w-4 h-4 mr-2" />}
        {text}
      </Button>
    </Link>
  );
}