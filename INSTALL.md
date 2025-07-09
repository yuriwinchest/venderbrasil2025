# Instruções de Instalação - VenderBrasil 2025

## Requisitos do Sistema
- Node.js 18+ 
- PostgreSQL 13+
- npm ou yarn

## Instalação Rápida

### 1. Clone o repositório
```bash
git clone https://github.com/yuriwinchest/venderbrasil2025.git
cd venderbrasil2025
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados
```bash
# Crie um banco PostgreSQL
# Configure a variável DATABASE_URL no arquivo .env
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 4. Execute as migrações
```bash
npm run db:push
```

### 5. Inicie o servidor
```bash
npm run dev
```

## Funcionalidades Principais

### 🔧 Sistema de Gerenciamento Financeiro
- Upload de extratos bancários (CSV, JSON)
- Análise automática de transações
- Criação de tabelas personalizadas
- Sub-categorização inteligente
- Download Excel individual e combinado
- **NOVO**: Sistema "Unir Tabelas" - combine múltiplas análises em um único Excel

### 📊 Data Analyzer Avançado
- Web scraping de produtos (Amazon, Mercado Livre, Shopee, Americanas)
- Análise de preços em tempo real
- Gráficos interativos
- Insights IA automatizados

### 🛒 Marketplace Tools
- Processamento de 50.000+ produtos
- Otimização de títulos e categorias
- Sistema de análise competitiva
- 5 ferramentas avançadas de marketplace

### 📅 Sistema de Agendamentos
- Prevenção inteligente de conflitos
- Bloqueio automático de horários
- WhatsApp notifications via Twilio
- Painel administrativo completo

### 🏥 CrossMeds (Aplicação Médica)
- Gerenciamento de medicamentos
- Interações medicamentosas
- Sistema de prescrições

## Estrutura do Projeto
```
venderbrasil2025/
├── client/          # Frontend React + TypeScript
├── server/          # Backend Express.js + Node.js
├── shared/          # Tipos e esquemas compartilhados
├── crossmeds/       # Aplicação médica independente
├── public/          # Arquivos estáticos
└── docs/           # Documentação
```

## Tecnologias Utilizadas
- **Frontend**: React 18, TypeScript, TailwindCSS, Shadcn/ui
- **Backend**: Node.js, Express.js, PostgreSQL, Drizzle ORM
- **Features**: XLSX processing, Web scraping, AI integration
- **Deploy**: Replit Ready, Vercel Compatible

## Variáveis de Ambiente Necessárias
```env
DATABASE_URL=postgresql://...
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
OPENAI_API_KEY=your_openai_key (opcional)
```

## Scripts Disponíveis
```bash
npm run dev        # Desenvolvimento (cliente + servidor)
npm run build      # Build de produção
npm run start      # Executar produção
npm run db:push    # Aplicar mudanças no banco
npm run db:studio  # Interface visual do banco
```

## Suporte e Documentação
- Documentação completa: Ver README.md
- Funcionalidades: Ver FEATURES.md
- Status do build: Ver BUILD_STATUS.md
- Atualizações: Ver RECENT_UPDATES.md

---
Desenvolvido com ❤️ para gestão financeira e análise de dados completa
