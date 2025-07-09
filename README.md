# VenderBrasil 2025 - Sistema Completo de Análise e Marketplace

[![Status](https://img.shields.io/badge/Status-Funcionando-brightgreen.svg)](https://github.com/yuriwinchest/venderbrasil2025)
[![Versão](https://img.shields.io/badge/Versão-1.0.0-blue.svg)](https://github.com/yuriwinchest/venderbrasil2025)

## 🚀 Sobre o Projeto

**VenderBrasil 2025** é uma plataforma avançada de desenvolvimento web que oferece serviços profissionais de criação de sites a partir de R$500. O sistema inclui funcionalidades completas de agendamento, painel administrativo e ferramentas de análise de dados powered by IA.

## ✨ Principais Funcionalidades

### 🎯 Sistema de Agendamento Inteligente
- **Prevenção de Conflitos**: Sistema automatizado que bloqueia horários ocupados
- **Seleção Múltipla**: Permite agendar vários horários simultaneamente  
- **Verificação em Tempo Real**: Updates automáticos a cada 5 segundos
- **Algoritmo Avançado**: Detecção de conflitos exatos, sobreposições e violações de buffer

### 📊 Data Analyzer - Análise de Dados com IA
- **5 Ferramentas Avançadas**:
  - Interactive tooltips com hover detalhado
  - Dashboard customizável com drag-and-drop de widgets
  - Export de infográficos compartilháveis profissionais
  - Colaboração em tempo real com sistema de anotações
  - Sistema gamificado com badges de conquista

### 🛒 Marketplace Tools - Otimização de Produtos
- **Processamento Automatizado**: Até 50.000+ produtos
- **Categorização Inteligente**: IA para otimização de categorias
- **SEO Avançado**: Análise e otimização de títulos
- **Compatibilidade**: Verificação em tempo real
- **5 Módulos Completos**: Optimization, Batch Processing, Intelligence Categories, SEO Enhancement, Compatibility Checker

### 🎨 Interface Moderna
- **Design Futurístico**: Cards com gradientes neon e animações suaves
- **Responsivo**: Otimizado para mobile, tablet e desktop
- **Tema Escuro**: Design dark/purple com elementos vibrantes
- **UX Avançada**: Navegação intuitiva com feedback visual

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Vite** para build otimizado
- **Tailwind CSS** para styling
- **Shadcn/ui** componentes modernos
- **TanStack Query** para state management
- **Wouter** para roteamento
- **Framer Motion** para animações

### Backend  
- **Node.js** com Express.js
- **PostgreSQL** com Drizzle ORM
- **Twilio** para notificações WhatsApp
- **OpenAI** para funcionalidades de IA
- **Neon Database** para hosting

### Ferramentas de Desenvolvimento
- **TypeScript** full-stack
- **ESBuild** para bundling
- **Replit** para deployment
- **GitHub** para versionamento

## 📈 Estatísticas do Sistema

- ✅ **Sistema de Agendamento**: Horários bloqueados automaticamente
- ✅ **Admin Dashboard**: Gestão completa de leads, projetos e agendamentos  
- ✅ **Analytics**: Dados reais integrados em tempo real
- ✅ **WhatsApp Integration**: Notificações automáticas via Twilio
- ✅ **AI-Powered**: Análises inteligentes e recomendações personalizadas

## 🚀 Como Executar

```bash
# Clone o repositório
git clone https://github.com/yuriwinchest/venderbrasil2025.git

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Execute em desenvolvimento
npm run dev

# Build para produção
npm run build

# Execute em produção
npm run start
```

## 📱 Acesso às Ferramentas

### Páginas Públicas
- **Homepage**: Interface principal com calculadora de custos
- **Data Analyzer**: `/data-analyzer` - Análise de dados com IA
- **Marketplace Tools**: `/marketplace-tools` - Otimização de produtos

### Painel Administrativo
- **Admin Dashboard**: `/admin` - Gestão completa do sistema
- **Leads Management**: Controle de leads e projetos
- **Agendamentos**: Visualização e gestão de horários
- **Analytics**: Estatísticas e relatórios detalhados

## 🔧 Configuração

### Variáveis de Ambiente Necessárias

```env
DATABASE_URL=your_postgresql_url
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
OPENAI_API_KEY=your_openai_key
```

## 📊 Arquitetura do Sistema

```
├── client/          # Frontend React
├── server/          # Backend Express.js
├── shared/          # Schemas e tipos compartilhados
├── crossmeds/       # App médico (CrossMeds)
└── public/          # Assets estáticos
```

## 🎯 Roadmap de Funcionalidades

- [x] Sistema de agendamento com prevenção de conflitos
- [x] Dashboard administrativo completo
- [x] Data Analyzer com 5 ferramentas avançadas
- [x] Marketplace Tools com processamento de 50k+ produtos
- [x] Design responsivo e moderno
- [x] Integração WhatsApp via Twilio
- [x] Analytics em tempo real
- [x] Sistema gamificado com achievements

## 📞 Contato e Suporte

- **WhatsApp**: Integração automatizada para agendamentos
- **Email**: Suporte técnico via formulário de contato
- **GitHub**: Issues e pull requests bem-vindos

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ para revolucionar o mercado de desenvolvimento web no Brasil**

🚀 **Deploy automático via Replit Deployments**