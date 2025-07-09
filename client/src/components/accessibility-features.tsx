import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Accessibility, Eye, Volume2, Type, MousePointer, 
  Monitor, Keyboard, Contrast, ZoomIn, Pause 
} from "lucide-react";

interface AccessibilitySettings {
  screenReader: boolean;
  highContrast: boolean;
  fontSize: number;
  reducedMotion: boolean;
  focusVisible: boolean;
  keyboardNavigation: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  voiceAnnouncements: boolean;
  skipLinks: boolean;
}

export function AccessibilityFeatures() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    screenReader: false,
    highContrast: false,
    fontSize: 16,
    reducedMotion: false,
    focusVisible: true,
    keyboardNavigation: true,
    colorBlindMode: 'none',
    voiceAnnouncements: false,
    skipLinks: true
  });

  const [liveRegionMessage, setLiveRegionMessage] = useState('');
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const skipLinksRef = useRef<HTMLDivElement>(null);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        applyAccessibilitySettings(parsed);
      } catch (error) {
        console.error('Error loading accessibility settings:', error);
      }
    }
  }, []);

  // Apply accessibility settings to the DOM
  const applyAccessibilitySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;
    const body = document.body;

    // Font size
    root.style.fontSize = `${newSettings.fontSize}px`;

    // High contrast
    if (newSettings.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }

    // Reduced motion
    if (newSettings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      body.classList.add('reduced-motion');
    } else {
      root.style.removeProperty('--animation-duration');
      body.classList.remove('reduced-motion');
    }

    // Focus visible
    if (newSettings.focusVisible) {
      body.classList.add('focus-visible');
    } else {
      body.classList.remove('focus-visible');
    }

    // Color blind mode
    body.className = body.className.replace(/colorblind-\w+/g, '');
    if (newSettings.colorBlindMode !== 'none') {
      body.classList.add(`colorblind-${newSettings.colorBlindMode}`);
    }

    // Screen reader support
    if (newSettings.screenReader) {
      body.setAttribute('aria-live', 'polite');
    } else {
      body.removeAttribute('aria-live');
    }

    setSettings(newSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
  };

  // Announce changes to screen readers
  const announceChange = (message: string) => {
    if (settings.voiceAnnouncements) {
      setLiveRegionMessage(message);
      setIsAnnouncing(true);
      
      setTimeout(() => {
        setLiveRegionMessage('');
        setIsAnnouncing(false);
      }, 3000);
    }
  };

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!settings.keyboardNavigation) return;

      // Alt + A: Open accessibility panel
      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        setIsOpen(true);
        announceChange('Painel de acessibilidade aberto');
      }

      // Alt + S: Skip to main content
      if (event.altKey && event.key === 's') {
        event.preventDefault();
        const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
        if (mainContent) {
          (mainContent as HTMLElement).focus();
          announceChange('Navegado para conteúdo principal');
        }
      }

      // Alt + M: Toggle high contrast
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        const newSettings = { ...settings, highContrast: !settings.highContrast };
        applyAccessibilitySettings(newSettings);
        announceChange(`Alto contraste ${newSettings.highContrast ? 'ativado' : 'desativado'}`);
      }

      // Alt + R: Toggle reduced motion
      if (event.altKey && event.key === 'r') {
        event.preventDefault();
        const newSettings = { ...settings, reducedMotion: !settings.reducedMotion };
        applyAccessibilitySettings(newSettings);
        announceChange(`Movimento reduzido ${newSettings.reducedMotion ? 'ativado' : 'desativado'}`);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings]);

  // Voice synthesis for announcements
  const speakText = (text: string) => {
    if ('speechSynthesis' in window && settings.voiceAnnouncements) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.8;
      utterance.volume = 0.7;
      speechSynthesis.speak(utterance);
    }
  };

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    applyAccessibilitySettings(newSettings);
    
    // Announce changes
    const announcements = {
      screenReader: `Suporte a leitor de tela ${value ? 'ativado' : 'desativado'}`,
      highContrast: `Alto contraste ${value ? 'ativado' : 'desativado'}`,
      fontSize: `Tamanho da fonte alterado para ${value}px`,
      reducedMotion: `Movimento reduzido ${value ? 'ativado' : 'desativado'}`,
      focusVisible: `Foco visível ${value ? 'ativado' : 'desativado'}`,
      keyboardNavigation: `Navegação por teclado ${value ? 'ativada' : 'desativada'}`,
      colorBlindMode: `Modo para daltonismo: ${value === 'none' ? 'desativado' : value}`,
      voiceAnnouncements: `Anúncios por voz ${value ? 'ativados' : 'desativados'}`,
      skipLinks: `Links de navegação rápida ${value ? 'ativados' : 'desativados'}`
    };

    const message = announcements[key];
    if (message) {
      announceChange(message);
      speakText(message);
    }
  };

  return (
    <>
      {/* CSS for accessibility features */}
      <style>{`
        .high-contrast {
          filter: contrast(150%) !important;
        }
        
        .high-contrast * {
          border-color: #000 !important;
          background-color: #fff !important;
          color: #000 !important;
        }
        
        .high-contrast button,
        .high-contrast [role="button"] {
          background-color: #000 !important;
          color: #fff !important;
          border: 2px solid #fff !important;
        }

        .reduced-motion *,
        .reduced-motion *::before,
        .reduced-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }

        .focus-visible *:focus {
          outline: 3px solid #0066cc !important;
          outline-offset: 2px !important;
        }

        .colorblind-protanopia {
          filter: url(#protanopia);
        }

        .colorblind-deuteranopia {
          filter: url(#deuteranopia);
        }

        .colorblind-tritanopia {
          filter: url(#tritanopia);
        }

        .skip-links {
          position: fixed;
          top: -100px;
          left: 0;
          z-index: 1000;
          background: #000;
          color: #fff;
          padding: 8px 16px;
          text-decoration: none;
          border-radius: 0 0 8px 0;
          transition: top 0.3s;
        }

        .skip-links:focus {
          top: 0;
        }

        .accessibility-announcement {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #0066cc;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          z-index: 1001;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .accessibility-announcement {
            animation: none;
          }
        }
      `}</style>

      {/* SVG filters for color blindness simulation */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="protanopia">
            <feColorMatrix values="0.567, 0.433, 0,     0, 0
                                   0.558, 0.442, 0,     0, 0
                                   0,     0.242, 0.758, 0, 0
                                   0,     0,     0,     1, 0"/>
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix values="0.625, 0.375, 0,   0, 0
                                   0.7,   0.3,   0,   0, 0
                                   0,     0.3,   0.7, 0, 0
                                   0,     0,     0,   1, 0"/>
          </filter>
          <filter id="tritanopia">
            <feColorMatrix values="0.95, 0.05,  0,     0, 0
                                   0,    0.433, 0.567, 0, 0
                                   0,    0.475, 0.525, 0, 0
                                   0,    0,     0,     1, 0"/>
          </filter>
        </defs>
      </svg>

      {/* Skip Links */}
      {settings.skipLinks && (
        <div ref={skipLinksRef}>
          <a 
            href="#main-content" 
            className="skip-links"
            onFocus={() => announceChange('Link de navegação rápida ativo')}
          >
            Pular para conteúdo principal
          </a>
        </div>
      )}

      {/* Live Region for Screen Reader Announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {liveRegionMessage}
      </div>

      {/* Visual Announcement */}
      {isAnnouncing && (
        <div className="accessibility-announcement">
          <div className="flex items-center">
            <Volume2 className="h-4 w-4 mr-2" />
            {liveRegionMessage}
          </div>
        </div>
      )}

      {/* Accessibility Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        aria-label="Abrir configurações de acessibilidade"
        title="Atalho: Alt + A"
      >
        <Accessibility className="h-5 w-5" />
      </Button>

      {/* Accessibility Settings Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Accessibility className="mr-2 h-5 w-5" />
              Configurações de Acessibilidade
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Screen Reader Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Volume2 className="mr-2 h-5 w-5" />
                  Suporte a Leitores de Tela
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Anúncios por Voz</label>
                    <p className="text-xs text-gray-500">Anuncia mudanças usando síntese de voz</p>
                  </div>
                  <Switch
                    checked={settings.voiceAnnouncements}
                    onCheckedChange={(checked) => updateSetting('voiceAnnouncements', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Região Ativa ARIA</label>
                    <p className="text-xs text-gray-500">Compatibilidade com leitores de tela</p>
                  </div>
                  <Switch
                    checked={settings.screenReader}
                    onCheckedChange={(checked) => updateSetting('screenReader', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Visual Adjustments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Eye className="mr-2 h-5 w-5" />
                  Ajustes Visuais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Alto Contraste</label>
                    <p className="text-xs text-gray-500">Atalho: Alt + M</p>
                  </div>
                  <Switch
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Tamanho da Fonte: {settings.fontSize}px
                  </label>
                  <Slider
                    value={[settings.fontSize]}
                    onValueChange={(value) => updateSetting('fontSize', value[0])}
                    min={12}
                    max={24}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Modo para Daltonismo</label>
                  <Select 
                    value={settings.colorBlindMode} 
                    onValueChange={(value) => updateSetting('colorBlindMode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      <SelectItem value="protanopia">Protanopia (vermelho-verde)</SelectItem>
                      <SelectItem value="deuteranopia">Deuteranopia (verde-vermelho)</SelectItem>
                      <SelectItem value="tritanopia">Tritanopia (azul-amarelo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Motor & Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Keyboard className="mr-2 h-5 w-5" />
                  Navegação e Movimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Movimento Reduzido</label>
                    <p className="text-xs text-gray-500">Atalho: Alt + R</p>
                  </div>
                  <Switch
                    checked={settings.reducedMotion}
                    onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Foco Visível</label>
                    <p className="text-xs text-gray-500">Destaca elementos em foco</p>
                  </div>
                  <Switch
                    checked={settings.focusVisible}
                    onCheckedChange={(checked) => updateSetting('focusVisible', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Navegação por Teclado</label>
                    <p className="text-xs text-gray-500">Atalhos de teclado ativos</p>
                  </div>
                  <Switch
                    checked={settings.keyboardNavigation}
                    onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Links de Navegação Rápida</label>
                    <p className="text-xs text-gray-500">Atalho: Alt + S</p>
                  </div>
                  <Switch
                    checked={settings.skipLinks}
                    onCheckedChange={(checked) => updateSetting('skipLinks', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Keyboard Shortcuts Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Keyboard className="mr-2 h-5 w-5" />
                  Atalhos de Teclado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span>Abrir configurações:</span>
                    <Badge variant="outline">Alt + A</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Conteúdo principal:</span>
                    <Badge variant="outline">Alt + S</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Alto contraste:</span>
                    <Badge variant="outline">Alt + M</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Movimento reduzido:</span>
                    <Badge variant="outline">Alt + R</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button 
              variant="outline"
              onClick={() => {
                const defaultSettings: AccessibilitySettings = {
                  screenReader: false,
                  highContrast: false,
                  fontSize: 16,
                  reducedMotion: false,
                  focusVisible: true,
                  keyboardNavigation: true,
                  colorBlindMode: 'none',
                  voiceAnnouncements: false,
                  skipLinks: true
                };
                applyAccessibilitySettings(defaultSettings);
                announceChange('Configurações de acessibilidade restauradas para o padrão');
              }}
            >
              Restaurar Padrão
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Salvar e Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}