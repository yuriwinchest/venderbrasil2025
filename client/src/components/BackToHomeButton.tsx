import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function BackToHomeButton() {
  const [, setLocation] = useLocation();

  return (
    <Button
      onClick={() => setLocation('/')}
      className="fixed top-4 left-4 z-50 bg-white/90 hover:bg-white text-slate-800 border border-slate-200 shadow-lg"
      size="sm"
    >
      <Home className="w-4 h-4 mr-2" />
      Voltar ao Início
    </Button>
  );
}