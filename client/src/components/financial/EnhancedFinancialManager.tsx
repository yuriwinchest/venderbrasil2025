import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Search,
  RefreshCw,
  X,
  Star,
  HelpCircle
} from "lucide-react";

interface EnhancedFinancialManagerProps {
  children: React.ReactNode;
  onFileUpload?: (files: FileList) => void;
  onSearch?: (term: string) => void;
  showTutorial?: boolean;
  onTutorialToggle?: () => void;
}

export default function EnhancedFinancialManager({
  children,
  onFileUpload,
  onSearch,
  showTutorial = false,
  onTutorialToggle
}: EnhancedFinancialManagerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const [showEnhancements, setShowEnhancements] = useState(true);
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Drag & Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && onFileUpload) {
      onFileUpload(e.dataTransfer.files);
    }
  };

  // Search handler
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Keyboard shortcuts - apenas Ctrl+F para busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        document.getElementById('enhanced-search-input')?.focus();
      }
      
      if (e.key === 'Escape') {
        setSearchTerm('');
        if (onSearch) onSearch('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearch]);

  // Simulate progress for visual feedback
  const simulateProgress = async () => {
    setIsProcessing(true);
    for (let i = 0; i <= 100; i += 10) {
      setProcessProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    setIsProcessing(false);
    setProcessProgress(0);
  };

  return (
    <div className="relative">
      {/* Enhanced UI Overlays */}
      {showEnhancements && (
        <>
          {/* Tutorial Overlay */}
          {showTutorial && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <Card className="max-w-lg mx-4">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <HelpCircle className="mr-2 h-5 w-5 text-blue-500" />
                    Tutorial Interativo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900">Arrastar e Soltar</h4>
                      <p className="text-sm text-blue-700">
                        Arraste arquivos CSV ou JSON diretamente para a área de upload
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-900">Busca Avançada</h4>
                      <p className="text-sm text-purple-700">
                        Busque por descrição, categoria, tipo ou valor
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button onClick={onTutorialToggle}>
                      Entendi!
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Progress Bar */}
          {isProcessing && (
            <div className="fixed top-4 right-4 z-40">
              <Card className="p-4 min-w-[300px]">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Processando dados...</p>
                    <Progress value={processProgress} className="mt-1" />
                    <p className="text-xs text-gray-500 mt-1">{processProgress}% concluído</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Enhanced Search Bar */}
          <div className="mb-6">
            <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <Input
                    id="enhanced-search-input"
                    placeholder="🔍 Buscar transações, categorias, valores..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-10 border-2 border-blue-200 focus:border-blue-400 rounded-full"
                  />
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSearch('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                {/* Quick Actions */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFavorites(prev => [...prev, searchTerm])}
                    disabled={!searchTerm || favorites.includes(searchTerm)}
                    title="Salvar busca como favorito"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={simulateProgress}
                    title="Atualizar dados"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Search Results Summary */}
              {searchTerm && (
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      Buscando por: "{searchTerm}"
                    </Badge>
                    {favorites.includes(searchTerm) && (
                      <Badge variant="outline" className="text-yellow-600">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Favorito
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Use filtros avançados para refinar
                  </div>
                </div>
              )}

              {/* Favorite Searches */}
              {favorites.length > 0 && !searchTerm && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Buscas favoritas:</p>
                  <div className="flex flex-wrap gap-2">
                    {favorites.map((fav, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearch(fav)}
                        className="h-7"
                      >
                        <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                        {fav}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>


        </>
      )}

      {/* Drag and Drop Overlay */}
      {dragActive && (
        <div className="fixed inset-0 bg-blue-500/20 z-40 flex items-center justify-center">
          <Card className="p-8 bg-white shadow-2xl">
            <div className="text-center">
              <Upload className="h-16 w-16 mx-auto text-blue-500 mb-4" />
              <h3 className="text-xl font-bold text-blue-900 mb-2">
                Solte seus arquivos aqui
              </h3>
              <p className="text-blue-700">
                Aceito arquivos CSV e JSON
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Main Content with Drag & Drop */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className="relative"
      >
        {children}
      </div>
    </div>
  );
}