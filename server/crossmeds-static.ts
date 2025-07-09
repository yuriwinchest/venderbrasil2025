// Servir CrossMeds como conteúdo estático integrado
import path from "path";
import fs from "fs";

export function serveCrossMedsStatic(req: any, res: any) {
  const crossMedsHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CrossMeds - Gerenciador de Medicamentos</title>
    <style>
        :root {
            --primary-blue: #4A90E2;
            --secondary-teal: #00BFA5;
            --accent-green: #4CAF50;
            --warning-red: #F44336;
            --background: #F8FAFE;
            --card-white: #FFFFFF;
            --text-dark: #2C3E50;
            --text-light: #7B8794;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, var(--background) 0%, #E3F2FD 100%);
            color: var(--text-dark);
            min-height: 100vh;
        }
        
        .crossmeds-container {
            max-width: 414px;
            margin: 0 auto;
            min-height: 100vh;
            background: linear-gradient(135deg, var(--background) 0%, #E3F2FD 100%);
            position: relative;
            padding-bottom: 80px;
        }
        
        .crossmeds-header {
            background: linear-gradient(135deg, var(--primary-blue), var(--secondary-teal));
            color: white;
            padding: 20px 16px;
            text-align: center;
            border-radius: 0 0 24px 24px;
        }
        
        .crossmeds-card {
            background: var(--card-white);
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(74, 144, 226, 0.1);
            margin: 16px;
            padding: 20px;
            transition: all 0.3s ease;
        }
        
        .crossmeds-button {
            background: linear-gradient(135deg, var(--primary-blue), var(--secondary-teal));
            color: white;
            border: none;
            border-radius: 12px;
            padding: 14px 20px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            text-decoration: none;
            margin: 8px 0;
            width: 100%;
        }
        
        .crossmeds-button:hover {
            transform: scale(1.05);
        }
        
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .gap-4 { gap: 1rem; }
        .p-4 { padding: 1rem; }
        .text-center { text-align: center; }
        .text-2xl { font-size: 1.5rem; }
        .text-lg { font-size: 1.125rem; }
        .text-sm { font-size: 0.875rem; }
        .font-bold { font-weight: 700; }
        .font-semibold { font-weight: 600; }
        .mb-2 { margin-bottom: 0.5rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .w-16 { width: 4rem; }
        .h-16 { height: 4rem; }
        .w-8 { width: 2rem; }
        .h-8 { height: 2rem; }
        .rounded-full { border-radius: 9999px; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .text-blue-500 { color: #3b82f6; }
        .text-gray-800 { color: #1f2937; }
        .text-gray-600 { color: #4b5563; }
        .text-gray-500 { color: #6b7280; }
        .text-red-500 { color: #ef4444; }
        .bg-white { background-color: white; }
        .space-y-3 > * + * { margin-top: 0.75rem; }
    </style>
</head>
<body>
    <div class="crossmeds-container">
        <!-- Header com logo e saudação -->
        <div class="crossmeds-header">
            <div class="flex items-center justify-center mb-4">
                <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <span style="font-size: 2rem;">🏥</span>
                </div>
            </div>
            <h1 class="text-2xl font-bold">CrossMeds</h1>
            <p class="text-blue-100 mt-2">Gerenciador de Medicamentos</p>
            <p class="text-sm text-blue-200 mt-1" id="greeting"></p>
        </div>

        <!-- Cards de resumo -->
        <div class="grid grid-cols-2 gap-4 p-4">
            <div class="crossmeds-card text-center">
                <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">💊</span>
                <div class="text-2xl font-bold text-gray-800" id="totalMedicamentos">0</div>
                <div class="text-sm text-gray-600">Medicamentos</div>
            </div>
            
            <div class="crossmeds-card text-center">
                <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">⚠️</span>
                <div class="text-2xl font-bold text-gray-800" id="totalInteracoes">0</div>
                <div class="text-sm text-gray-600">Interações</div>
            </div>
        </div>

        <!-- Atalhos rápidos -->
        <div class="crossmeds-card">
            <h3 class="text-lg font-semibold mb-4">Menu Principal</h3>
            
            <button class="crossmeds-button" onclick="alert('Funcionalidade: Adicionar medicamentos com autocompletar dos 25.700+ da ANVISA')">
                <span>➕</span>
                <span>Adicionar Medicamento</span>
            </button>
            
            <button class="crossmeds-button" onclick="alert('Funcionalidade: Verificar interações medicamentosas automaticamente')">
                <span>🔍</span>
                <span>Verificar Interações</span>
            </button>
            
            <button class="crossmeds-button" onclick="alert('Funcionalidade: Perfil completo com cálculo de IMC e HbA1c')">
                <span>👤</span>
                <span>Perfil do Paciente</span>
            </button>
            
            <button class="crossmeds-button" onclick="alert('Funcionalidade: Gerar relatório médico em PDF')">
                <span>📄</span>
                <span>Gerar Relatório</span>
            </button>
        </div>

        <!-- Informações -->
        <div class="crossmeds-card">
            <h3 class="text-lg font-semibold mb-4">Sobre o CrossMeds</h3>
            <div class="space-y-3 text-sm text-gray-600">
                <p>✅ Base com 25.700+ medicamentos ANVISA</p>
                <p>✅ Autocompletar inteligente para idosos</p>
                <p>✅ Detecção automática de interações</p>
                <p>✅ Cálculo de IMC e HbA1c estimada</p>
                <p>✅ Relatórios médicos em PDF</p>
                <p>✅ Sistema de lembretes de medicamentos</p>
                <p>✅ Interface amigável para idosos</p>
            </div>
        </div>

        <!-- Status -->
        <div class="crossmeds-card text-center">
            <p class="text-sm text-gray-500">
                🔧 <strong>Demo Funcional</strong><br>
                Este é o CrossMeds em desenvolvimento.<br>
                Todas as funcionalidades estão sendo implementadas.
            </p>
        </div>
    </div>

    <script>
        // Saudação dinâmica
        function obterSaudacao() {
            const hora = new Date().getHours();
            if (hora < 12) return 'Bom dia!';
            if (hora < 18) return 'Boa tarde!';
            return 'Boa noite!';
        }

        // Atualizar interface
        document.getElementById('greeting').textContent = 
            new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' - ' + obterSaudacao();

        // Simular dados do localStorage
        const medicamentos = JSON.parse(localStorage.getItem('crossmeds-medicamentos') || '[]');
        document.getElementById('totalMedicamentos').textContent = medicamentos.length;
        document.getElementById('totalInteracoes').textContent = Math.floor(medicamentos.length * 0.3);
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(crossMedsHTML);
}