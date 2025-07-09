import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Palette, Wand2, Download, Upload, RotateCcw } from "lucide-react";

interface ColorScheme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

const predefinedSchemes: ColorScheme[] = [
  {
    name: "Padrão Azul",
    primary: "rgb(59, 130, 246)",
    secondary: "rgb(147, 197, 253)",
    accent: "rgb(239, 68, 68)",
    background: "rgb(249, 250, 251)",
    surface: "rgb(255, 255, 255)",
    text: "rgb(17, 24, 39)"
  },
  {
    name: "Roxo Moderno",
    primary: "rgb(139, 92, 246)",
    secondary: "rgb(196, 181, 253)",
    accent: "rgb(236, 72, 153)",
    background: "rgb(250, 245, 255)",
    surface: "rgb(255, 255, 255)",
    text: "rgb(17, 24, 39)"
  },
  {
    name: "Verde Natureza",
    primary: "rgb(34, 197, 94)",
    secondary: "rgb(134, 239, 172)",
    accent: "rgb(251, 146, 60)",
    background: "rgb(240, 253, 244)",
    surface: "rgb(255, 255, 255)",
    text: "rgb(17, 24, 39)"
  },
  {
    name: "Escuro Elegante",
    primary: "rgb(99, 102, 241)",
    secondary: "rgb(165, 180, 252)",
    accent: "rgb(34, 197, 94)",
    background: "rgb(17, 24, 39)",
    surface: "rgb(31, 41, 55)",
    text: "rgb(243, 244, 246)"
  }
];

export function ThemeCustomizer() {
  const [currentScheme, setCurrentScheme] = useState<ColorScheme>(predefinedSchemes[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('admin-theme');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        setCurrentScheme(parsed.scheme || predefinedSchemes[0]);
        setAnimationsEnabled(parsed.animations !== false);
        setCompactMode(parsed.compact === true);
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    }
  }, []);

  const applyTheme = (scheme: ColorScheme) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--admin-primary', scheme.primary);
    root.style.setProperty('--admin-secondary', scheme.secondary);
    root.style.setProperty('--admin-accent', scheme.accent);
    root.style.setProperty('--admin-background', scheme.background);
    root.style.setProperty('--admin-surface', scheme.surface);
    root.style.setProperty('--admin-text', scheme.text);
    
    // Toggle animations
    root.style.setProperty('--admin-transition', animationsEnabled ? 'all 0.3s ease' : 'none');
    
    // Compact mode
    root.style.setProperty('--admin-spacing', compactMode ? '0.5rem' : '1rem');
    root.style.setProperty('--admin-card-padding', compactMode ? '1rem' : '1.5rem');
    
    setCurrentScheme(scheme);
    
    // Save to localStorage
    localStorage.setItem('admin-theme', JSON.stringify({
      scheme,
      animations: animationsEnabled,
      compact: compactMode
    }));
  };

  const exportTheme = () => {
    const themeData = {
      scheme: currentScheme,
      animations: animationsEnabled,
      compact: compactMode,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-theme-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported.scheme) {
          setCurrentScheme(imported.scheme);
          setAnimationsEnabled(imported.animations !== false);
          setCompactMode(imported.compact === true);
          applyTheme(imported.scheme);
        }
      } catch (error) {
        console.error('Error importing theme:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      {/* Theme CSS Injection */}
      <style>{`
        .admin-themed {
          background: var(--admin-background, rgb(249, 250, 251));
          color: var(--admin-text, rgb(17, 24, 39));
          transition: var(--admin-transition, all 0.3s ease);
        }
        
        .admin-card {
          background: var(--admin-surface, rgb(255, 255, 255));
          padding: var(--admin-card-padding, 1.5rem);
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          transition: var(--admin-transition, all 0.3s ease);
        }
        
        .admin-button-primary {
          background: var(--admin-primary, rgb(59, 130, 246));
          color: white;
          transition: var(--admin-transition, all 0.3s ease);
        }
        
        .admin-button-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        .admin-accent {
          color: var(--admin-accent, rgb(239, 68, 68));
        }
      `}</style>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="fixed top-4 right-4 z-50 bg-white shadow-lg"
          >
            <Palette className="h-4 w-4 mr-2" />
            Customizar Tema
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Wand2 className="mr-2 h-5 w-5" />
              Customização Avançada do Painel
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="colors">Esquema de Cores</TabsTrigger>
              <TabsTrigger value="layout">Layout & Animações</TabsTrigger>
              <TabsTrigger value="export">Importar/Exportar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="colors" className="space-y-6">
              {/* Predefined Schemes */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Esquemas Predefinidos</h3>
                <div className="grid grid-cols-2 gap-4">
                  {predefinedSchemes.map((scheme) => (
                    <Card 
                      key={scheme.name}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        currentScheme.name === scheme.name ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => applyTheme(scheme)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{scheme.name}</h4>
                        </div>
                        <div className="flex gap-2">
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-white shadow"
                            style={{ backgroundColor: scheme.primary }}
                          />
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-white shadow"
                            style={{ backgroundColor: scheme.secondary }}
                          />
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-white shadow"
                            style={{ backgroundColor: scheme.accent }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Custom Color Picker */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Personalização Avançada</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(currentScheme).map(([key, value]) => {
                    if (key === 'name') return null;
                    return (
                      <div key={key} className="space-y-2">
                        <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => {
                              const newScheme = { ...currentScheme, [key]: e.target.value };
                              applyTheme(newScheme);
                            }}
                            className="w-12 h-8 rounded border cursor-pointer"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => {
                              const newScheme = { ...currentScheme, [key]: e.target.value };
                              applyTheme(newScheme);
                            }}
                            className="flex-1 px-3 py-1 border rounded text-sm font-mono"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="layout" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="animations" className="text-base font-medium">
                      Animações Suaves
                    </Label>
                    <p className="text-sm text-gray-600">
                      Ativar transições e animações no painel
                    </p>
                  </div>
                  <Switch
                    id="animations"
                    checked={animationsEnabled}
                    onCheckedChange={(checked) => {
                      setAnimationsEnabled(checked);
                      applyTheme(currentScheme);
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compact" className="text-base font-medium">
                      Modo Compacto
                    </Label>
                    <p className="text-sm text-gray-600">
                      Reduzir espaçamentos para mais informações na tela
                    </p>
                  </div>
                  <Switch
                    id="compact"
                    checked={compactMode}
                    onCheckedChange={(checked) => {
                      setCompactMode(checked);
                      applyTheme(currentScheme);
                    }}
                  />
                </div>
                
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Velocidade das Animações
                  </Label>
                  <Slider
                    value={[300]}
                    onValueChange={(value) => {
                      const root = document.documentElement;
                      root.style.setProperty('--admin-transition', 
                        animationsEnabled ? `all ${value[0]}ms ease` : 'none'
                      );
                    }}
                    max={1000}
                    min={100}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Rápido</span>
                    <span>Lento</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="export" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Gerenciar Configurações</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button onClick={exportTheme} className="flex items-center justify-center">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Tema
                    </Button>
                    
                    <label className="flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-600 transition-colors">
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Tema
                      <input
                        type="file"
                        accept=".json"
                        onChange={importTheme}
                        className="hidden"
                      />
                    </label>
                    
                    <Button 
                      variant="outline"
                      onClick={() => {
                        applyTheme(predefinedSchemes[0]);
                        setAnimationsEnabled(true);
                        setCompactMode(false);
                      }}
                      className="flex items-center justify-center"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Resetar
                    </Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">Configuração Atual</h4>
                  <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-32">
                    {JSON.stringify({ 
                      scheme: currentScheme, 
                      animations: animationsEnabled, 
                      compact: compactMode 
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Fechar
            </Button>
            <Button 
              onClick={() => {
                applyTheme(currentScheme);
                setIsOpen(false);
              }}
              className="admin-button-primary"
            >
              Aplicar Configurações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}