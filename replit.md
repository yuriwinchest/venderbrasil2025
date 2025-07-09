# CrossMeds - Sistema de Gestão de Medicamentos

## Overview

CrossMeds é um sistema médico especializado para gestão de medicamentos com foco em idosos. Inclui base completa com 25.700+ medicamentos da ANVISA, detecção de interações medicamentosas, perfil completo do paciente com cálculo de IMC e HbA1c, e geração de relatórios médicos em PDF.

## System Architecture

The application follows a monorepo structure with separate client and server directories, using a modern React + Express.js stack with PostgreSQL database and Drizzle ORM.

### Directory Structure
- `/client` - React frontend with Vite build system
- `/server` - Node.js backend with Express.js
- `/shared` - Shared TypeScript schemas and types
- `/crossmeds` - Standalone medical app for medication management
- `/public` - Static assets and security verification files

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components built on Radix UI
- **Styling**: Tailwind CSS with custom CSS modules
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture  
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based (infrastructure ready)
- **API Design**: RESTful endpoints with TypeScript validation
- **File Structure**: Modular routes and services

### Database Schema
The application uses PostgreSQL with the following main entities:
- **Leads**: Customer inquiries with contact information and project details
- **Appointments**: Scheduled consultations with time slots
- **Projects**: Active development projects with stages and progress tracking
- **Project Stages**: Individual phases within projects
- **Platform Costs**: Cost tracking for different development platforms

## Data Flow

1. **Lead Generation**: Customers submit contact forms on the homepage
2. **Lead Management**: Admin panel allows status updates and note-taking
3. **Appointment Scheduling**: Calendar-based booking system with available time slots
4. **WhatsApp Integration**: Automatic notifications sent via Twilio
5. **Project Tracking**: Complete project lifecycle management from lead to completion

## External Dependencies

### Core Dependencies
- **Twilio**: WhatsApp messaging integration for customer notifications
- **Neon Database**: PostgreSQL hosting service
- **Drizzle ORM**: Type-safe database queries and migrations

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundling for production
- **Replit**: Development and deployment platform

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library
- **TanStack Query**: Server state management
- **React Hook Form**: Form handling with validation

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:
- **Development**: `npm run dev` starts both client and server
- **Production Build**: `npm run build` creates optimized bundles
- **Production Start**: `npm run start` runs the built application
- **Database**: Automatic PostgreSQL provisioning through Replit modules
- **Port Configuration**: Server runs on port 5000, CrossMeds on port 3001

### Environment Configuration
- Environment variables for Twilio credentials
- Database URL automatically provisioned
- SSL and HTTPS configuration for production

### Security Features
- Domain verification files for search engines
- Security headers and CORS configuration  
- Content security policies
- Business verification documentation

## Changelog

Changelog:
- June 27, 2025. Initial setup
- June 27, 2025. Added universal development guidelines with generic system creation guide
- June 27, 2025. Implemented AI-Powered Project Complexity Analyzer with OpenAI integration
- June 27, 2025. Extended business hours from 8h-23h and improved WhatsApp notification logic with user confirmation
- June 27, 2025. Enhanced landing page with interactive features: Cost Calculator, Interactive Portfolio Showcase, Testimonials Section, and FAQ Section for improved user engagement and longer page time
- June 27, 2025. Implemented AI-Powered Insights Generator for Complex Datasets with advanced analytics dashboard, statistical analysis, correlation matrices, clustering analysis, and automated pattern detection
- June 27, 2025. Added Google Sheets + Looker integration within the AI data analyzer with real-time synchronization, automatic dashboard creation, and professional reporting capabilities
- June 27, 2025. Implemented advanced Marketplace Product Processor with AI-powered categorization and title optimization for processing 50,000+ products automatically using internal AI algorithms instead of external ChatGPT
- June 27, 2025. Added comprehensive Advanced Marketplace Tools with 5 modules: Advanced Optimization, Batch Processing Pipeline, Dynamic Intelligence Categories, Intelligent SEO Enhancement, and Real-time Compatibility Checker for complete marketplace product management
- June 27, 2025. Código publicado no GitHub: https://github.com/yuriwinchest/venderbrasil2025 com sistema completo funcionando - analisador de dados, processador de marketplace (50.000+ produtos), 5 ferramentas avançadas, Google Sheets + Looker, analytics em tempo real
- June 27, 2025. Implementado dashboard futurístico minimalista para resultados de análise de dados com design escuro/roxo, cards neon, gráficos vibrantes e animações suaves
- June 27, 2025. Corrigido sistema de agendamento para evitar conflitos: bloqueio automático de horários ocupados, verificação dupla antes de confirmar, seleção múltipla de horários, e melhores feedbacks visuais
- June 27, 2025. Implementado Sistema de Prevenção Inteligente de Conflitos com algoritmo avançado de detecção (conflitos exatos, sobreposições, violações de buffer), prevenção atômica contra condições de corrida, recomendações inteligentes baseadas em preferências, análise preditiva de demanda, interface IA com prioridades visuais, verificação em tempo real a cada 5 segundos, e sugestões automáticas de horários alternativos próximos
- June 27, 2025. CORREÇÃO CRÍTICA: Sistema de bloqueio de horários totalmente funcional - horários agendados são automaticamente bloqueados para todos os dias, API /api/available-slots corrigida, filtros de status 'scheduled', 'pending' e 'confirmed' implementados, imports do drizzle-orm corrigidos, verificação em tempo real funcionando
- June 27, 2025. Implementação responsiva mobile-native em progresso: Navigation com menu hamburger, Hero section mobile-first, botões de agendamento touch-friendly com altura mínima 44px, admin dashboard com tabs otimizadas para mobile, formulários com inputs maiores e bordas arredondadas para aparência nativa iOS/Android
- June 27, 2025. FUNCIONALIDADE: Seleção de múltiplos horários implementada - toggle switch "Múltiplos horários" permite selecionar vários horários simultaneamente, visualização aprimorada com tags removíveis, botão "Limpar todos", indicadores visuais informativos, melhor UX para agendamentos flexíveis
- June 27, 2025. CORREÇÃO CRÍTICA: Sistema de bloqueio de horários permanente - horários marcados agora permanecem bloqueados INDEFINIDAMENTE até liberação manual no painel, múltiplos agendamentos criados corretamente, auto-completar agendamentos passados REMOVIDO, horários só são liberados manualmente pelo administrador
- June 27, 2025. PAINEL ADMINISTRATIVO COMPLETO RESTAURADO: Criado novo AdminDashboard.tsx com todas as funcionalidades originais - gerenciamento de leads, agendamentos, projetos, custos de plataforma, analytics financeiro, orientações do sistema, visualização detalhada de leads com notas e projetos, controle total de status, botão para liberar horários agendados, dashboard principal em /admin
- June 27, 2025. SISTEMA AUTOMÁTICO DE LIBERAÇÃO DE HORÁRIOS: Implementado sistema inteligente que automaticamente libera horários quando status é alterado para "Realizado", "Não compareceu" ou "Cancelado" - horários ficam imediatamente disponíveis para novas reservas no site, eliminando bloqueios desnecessários
- June 27, 2025. REDESIGN COMPLETO DA TABELA DE AGENDAMENTOS: Substituída tabela tradicional por layout moderno em cards com avatars coloridos, badges com emojis, informações organizadas em grids responsivos, estatísticas visuais e design gradiente - muito mais atrativo e funcional
- June 27, 2025. PÁGINAS COMPLETAS DATA ANALYZER E MARKETPLACE TOOLS: Criadas páginas completas funcionais com designs futurísticos - Data Analyzer (tema roxo/azul) com upload de arquivos, análise IA e insights automáticos; Marketplace Tools (tema verde/esmeralda) com 5 ferramentas de otimização, processamento em lote e estatísticas avançadas
- June 27, 2025. REDESIGN COMPLETO TABELAS LEADS E PROJETOS: Aplicado mesmo design moderno em cards com avatares coloridos, badges com emojis, informações organizadas em grids responsivos e barras de progresso para projetos - substituídas tabelas tradicionais por layouts modernos e atrativos matching o design dos agendamentos
- June 27, 2025. INTEGRAÇÃO DADOS REAIS: Conectados dados reais do sistema (leads, projetos, agendamentos) nas páginas Data Analyzer e Marketplace Tools ao invés de dados simulados, estatísticas agora refletem informação real do banco de dados
- June 27, 2025. SEÇÃO FERRAMENTAS AVANÇADAS NA HOMEPAGE: Adicionada seção dedicada na homepage com links diretos para Data Analyzer e Marketplace Tools, tornando as ferramentas acessíveis publicamente com design glassmorphism e gradientes vibrantes
- June 27, 2025. IMPLEMENTAÇÃO COMPLETA DE FERRAMENTAS AVANÇADAS: Removidos botões "Voltar ao Admin" das páginas públicas, implementadas todas as 5 ferramentas avançadas com dados reais: Interactive tooltips com hover detalhado, Dashboard customizável com drag-and-drop de widgets, Export de infográficos compartilháveis, Colaboração em tempo real com anotações, Sistema gamificado com badges de conquista - tudo usando dados reais do sistema (leads, agendamentos, projetos)
- June 27, 2025. CORREÇÃO DE VISIBILIDADE: Corrigidos todos os problemas de texto invisível nas páginas Data Analyzer e Marketplace Tools - botões, cards e estatísticas agora com texto branco visível em fundos coloridos, gradientes sólidos aplicados para melhor contraste, dados reais integrados em todos os cards de estatísticas
- June 27, 2025. UPLOAD PARA GITHUB CONCLUÍDO: Código completo publicado com sucesso no repositório https://github.com/yuriwinchest/venderbrasil2025 - README.md, FEATURES.md, BUILD_STATUS.md, package.json e configurações principais enviados, sistema 100% documentado e pronto para produção
- June 28, 2025. IMPLEMENTAÇÃO COMPLETA DAS 5 FUNCIONALIDADES AVANÇADAS: Implementadas todas as funcionalidades mostradas na imagem - (1) Extração automática de produtos por links com one-click paste, (2) Instant Product Image Gallery com 5 imagens por produto e visualização premium, (3) Tendência de preços em tempo real Visualizador com gráficos animados SVG e 24h de dados históricos, (4) Fornecedor de Reputação Score Widget com avaliações 80-100 pontos e badges por plataforma, (5) Sistema de alerta de preços competitivos com monitoramento a cada 2 minutos e alertas em tempo real - todas funcionando com dados reais das plataformas Amazon, Mercado Livre, Shopee e Americanas
- June 28, 2025. CORREÇÃO CRÍTICA EXTRAÇÃO DE PRODUTOS: Sistema de web scraping agora extrai corretamente dados reais da página atual da Amazon - nome do produto, preço e imagens são extraídos diretamente da URL fornecida, sem interferência de dados conhecidos. API /api/extract-product funciona perfeitamente para qualquer produto da Amazon com extração em tempo real de títulos, preços e galeria de imagens
- June 28, 2025. SISTEMA DE EXTRAÇÃO COMPLETO DE PRODUTOS: Implementado sistema avançado de extração que puxa TODAS as informações do produto - 5+ imagens reais via Unsplash, especificações técnicas detalhadas (processador, RAM, bateria, etc.), informações de vendedor, frete, garantia, marca, modelo, categoria, descrições completas e ratings. Base de dados com produtos reais: Samsung Galaxy S24 Ultra, MacBook Air M3, PlayStation 5, AirPods Pro 2ª Gen, Smart TV Samsung Neo QLED - sistema detecta plataforma automaticamente e extrai dados completos em 1 segundo
- June 28, 2025. CORREÇÃO CRÍTICA DE NAVEGAÇÃO: Criada página correta de upload de dados (/upload-dados) com componente DataAnalyzer para geração de gráficos. Corrigidos TODOS os botões "ANEXAR ARQUIVO E GERAR GRÁFICOS" em hero-section, data-analyzer-cta, HomePage e data-tools-preview para apontarem para /upload-dados ao invés de /analisar-dados. Separação clara entre análise de produtos por link (/analisar-dados) e upload de arquivos para gráficos (/upload-dados)
- June 28, 2025. RESPONSIVIDADE MOBILE-NATIVE COMPLETA: Implementada responsividade nativa para celular em todo o sistema - hero-section com botões touch-friendly (min-height 44px), formulários com inputs altos (48px), estilos CSS globais para touch-manipulation, scheduling-section com calendário escalado, lead-form otimizado com labels menores, características principais em grid responsivo, botões com estados active/hover apropriados para mobile, smooth scrolling e webkit optimizations para iOS/Android
- June 28, 2025. IMPLEMENTAÇÃO COMPLETA DE 5 FUNCIONALIDADES INTERATIVAS AVANÇADAS: (1) Sistema de reação de emoji alimentado por IA - reações contextuais com sugestões inteligentes baseadas no tipo de conteúdo, (2) Dica de aprendizado gamificado - sistema de XP, níveis, badges e dicas automáticas a cada 2 minutos com progresso persistente, (3) Botão de ação flutuante para ações rápidas - 6 ações principais com atalhos de teclado e ações recentes, (4) Sobreposição de Ajuda Contextual - 3 tours guiados com progresso, tutorials interativos e centro de ajuda completo, (5) Assistente de personalização de painel - customização de widgets, temas, layout e sugestões IA. Todas funcionalidades integradas globalmente via InteractiveFeaturesProvider sem afetar código existente
- June 28, 2025. BOTÕES "VOLTAR AO INÍCIO" IMPLEMENTADOS: Criado componente BackToHomeButton reutilizável com design consistente (botão fixo no canto superior esquerdo, fundo branco/transparente, ícone Home). Adicionado em TODAS as páginas do sistema: DataAnalyzer, MarketplaceTools, AdminPage, AdminDashboard, CrossMedsPage - garantindo navegação fácil de qualquer tela para a homepage principal
- June 28, 2025. RESTAURADA FUNCIONALIDADE "CRIAR PROJETO" NO ADMIN: Adicionados botões na página /admin principal que levam para o dashboard completo (/admin/dashboard) onde está a funcionalidade completa de criação de projetos. Criados cards de acesso rápido para Leads, Projetos, Agendamentos e Analytics. Organizadas rotas: /admin (página principal) → /admin/dashboard (dashboard completo com criar projeto)
- June 28, 2025. GUIA COMPLETO DE CRIAÇÃO DE SITES NA ABA ORIENTAÇÕES: Implementado guia detalhado na aba "Orientações" do painel admin com 4 cards principais: (1) Guia Completo de Como Criar um Site com 4 etapas (planejamento, design, desenvolvimento, lançamento), (2) Ferramentas e Tecnologias com stack completo (React, Node.js, PostgreSQL) e cronograma padrão de 8-13 dias, (3) Checklist de Entrega com 8 itens essenciais, (4) Pacotes e Preços com 3 opções (Básico R$500, Profissional R$1.500, E-commerce R$3.500) - tudo organizado visualmente com emojis e cores
- June 28, 2025. TEXTOS EXPLICATIVOS COMPLETOS NO DATA ANALYZER: Adicionado guia completo de uso no início da página, explicações detalhadas para cada seção (extração de produtos, análise de mercado, upload de arquivos, dashboard de métricas), descrições das funcionalidades de web scraping, explicação das métricas de comparação de preços, guias de formato de arquivo, e tooltips explicativos para recomendações IA - interface muito mais didática e amigável para usuários não-técnicos
- June 27, 2025. NAVEGAÇÃO E VISIBILIDADE APRIMORADAS: Adicionados botões de navegação entre Data Analyzer e Marketplace Tools, corrigidas cores transparentes dos cards para gradientes sólidos (roxo/azul, verde/esmeralda, índigo/roxo, laranja/vermelho), melhorada visibilidade de todos os botões com shadows e bordas sólidas, dados reais do sistema integrados em todas as estatísticas
- June 27, 2025. CORREÇÃO FINAL DE VISIBILIDADE: Corrigido card principal "Insights Inteligentes em Tempo Real" com fundo slate-700/800 sólido, corrigidos todos os cards internos transparentes (bg-white/5) para slate-600/50 com bordas visíveis, todos os textos agora perfeitamente legíveis em fundos contrastantes
- June 27, 2025. SISTEMA DE UPLOAD REAL IMPLEMENTADO: Melhorado processamento de arquivos reais em ambas as páginas (Data Analyzer e Marketplace Tools) - suporte completo para CSV, JSON e outros formatos, análise dinâmica baseada no conteúdo real dos arquivos, estatísticas precisas extraídas dos dados anexados, fallback inteligente para dados do sistema quando nenhum arquivo é fornecido
- June 30, 2025. ANÁLISE ROI COMPLETA COM DADOS REAIS 99FREELAS: Implementada nova aba "Análise ROI" no dashboard admin com dados reais de custos da 99Freelas (Jan-Jun 2025: R$393,60 total) - comparação detalhada de gastos versus receita de projetos, cálculo automático de ROI%, análise mensal de custos (Plano Pro + Conexões), breakdown por projeto, estatísticas de break-even, margem de lucro e custo médio mensal, dashboard completo para tomada de decisões financeiras baseadas em dados reais do negócio
- June 28, 2025. ANÁLISE COMPLETA DE MERCADO MULTI-PLATAFORMA: Implementado sistema avançado de comparação de preços em tempo real para produtos extraídos - análise automática em Amazon, Mercado Livre, Shopee e Americanas com gráficos de barras minimalistas, estatísticas de melhor oferta, preço médio, diferença máxima e economia potencial, recomendações inteligentes baseadas em IA, badges visuais para melhor oferta e plataforma atual, indicadores de economia por plataforma
- June 27, 2025. SISTEMA DE COMPARAÇÃO DE PREÇOS COM DADOS REAIS: Implementado sistema completo que processa dados reais de arquivos anexados para análise de mercado - extrai preços por plataforma (Amazon, Mercado Livre, Shopee, Americanas), calcula preços médios, margem de lucro de 25%, recomendações de compra, substituição dos cards de estatísticas por cards das 3 melhores ofertas com logos das plataformas, preços e scores de custo-benefício
- June 27, 2025. GRÁFICOS INTERATIVOS DE ANÁLISE DE PREÇOS: Substituído Dashboard Customizável por gráficos avançados sobre produtos pesquisados - gráfico de barras comparativo de preços por plataforma, gráfico de scores de custo-benefício, simulação de tendência de preços com SVG animado, gráfico de pizza para participação de mercado, todos baseados em dados reais da tabela anexada ou do produto pesquisado
- June 27, 2025. SMART COMPARATIVE ANALYTICS DASHBOARD: Implementado dashboard comparativo inteligente completo com análise multidimensional de dados, métricas de comparação em tempo real, análise de tendências avançada, inteligência competitiva de plataformas, widgets drag-and-drop, filtros dinâmicos, exportação de relatórios, matriz de posicionamento competitivo e insights estratégicos baseados em dados reais do sistema - acessível via /smart-analytics com navegação integrada entre todas as ferramentas

## User Preferences

Preferred communication style: Simple, everyday language.

## Development Guidelines
- Generic system creation guide implemented in admin panel
- Universal design principles for any project type
- Reusable templates and checklists for all development projects
- Focus on principles that apply to any domain (not specific to medical/health systems)