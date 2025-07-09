# 🚀 VenderBrasil 2025 - Guia de Instalação Completa

## 📦 O que está incluído neste pacote:

- **Sistema completo de gestão financeira** com análise de dados
- **Seção destacada vermelha** na homepage com serviços a partir de R$ 500
- **Sistema de agendamentos** com prevenção de conflitos
- **Data Analyzer** com web scraping e insights IA
- **Marketplace Tools** (5 ferramentas avançadas)
- **CrossMeds** (aplicativo médico)
- **WhatsApp integration** para notificações
- **Painel administrativo** completo

## 🛠️ Instalação em Qualquer Servidor

### Opção 1: Instalação Manual

1. **Extrair arquivos:**
   ```bash
   unzip venderbrasil2025.zip
   cd venderbrasil2025
   ```

2. **Instalar Node.js (versão 18+):**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # CentOS/RHEL
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   ```

3. **Instalar dependências:**
   ```bash
   npm install
   ```

4. **Configurar banco de dados PostgreSQL:**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   
   # Criar banco
   sudo -u postgres createdb venderbrasil
   sudo -u postgres psql -c "CREATE USER venderbrasil WITH PASSWORD 'sua_senha_aqui';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE venderbrasil TO venderbrasil;"
   ```

5. **Configurar variáveis de ambiente:**
   ```bash
   cp .env.example .env
   # Editar .env com suas configurações
   ```

6. **Executar migrações:**
   ```bash
   npm run db:push
   ```

7. **Iniciar aplicação:**
   ```bash
   # Desenvolvimento
   npm run dev
   
   # Produção
   npm run build
   npm start
   ```

### Opção 2: Instalação com Docker

1. **Instalar Docker:**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

2. **Executar com Docker Compose:**
   ```bash
   docker-compose up -d
   ```

### Opção 3: Deploy na Vercel

1. **Instalar Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

## 🔧 Configurações Necessárias

### Arquivo .env (obrigatório):
```env
# Banco de Dados
DATABASE_URL=postgresql://usuario:senha@localhost:5432/venderbrasil

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_PHONE_NUMBER=+5561999999999

# OpenAI (opcional - para IA)
OPENAI_API_KEY=sua_chave_openai

# Ambiente
NODE_ENV=production
PORT=5000
```

## 📱 Funcionalidades Principais

### 1. Página Inicial
- **Seção vermelha destacada** com serviços a partir de R$ 500
- **Botão WhatsApp** que abre conversa direta: (61) 99352-1849
- **Agendamento online** integrado

### 2. Sistema Financeiro
- Upload de planilhas CSV/Excel
- **Análise automática** por tipo (receita/despesa/transferência)
- **Unir tabelas** com separação visual
- **Exportação Excel** formatada

### 3. Tools Avançadas
- **Data Analyzer**: Upload de dados + gráficos IA
- **Marketplace Tools**: 5 ferramentas de otimização
- **Web Scraping**: Extração automática de produtos

### 4. Painel Admin
- Gerenciamento de leads
- Controle de agendamentos
- Analytics completo
- Sistema de projetos

## 🌐 URLs do Sistema

- **Homepage**: `/`
- **Admin**: `/admin`
- **Agendamentos**: `/admin/agendamentos`
- **Data Analyzer**: `/upload-dados`
- **Marketplace Tools**: `/marketplace-tools`
- **CrossMeds**: `/crossmeds`

## 📞 Configuração WhatsApp

O sistema está configurado para o número **(61) 99352-1849**.

Para alterar:
1. Editar `client/src/pages/HomePage.tsx` (linha 95)
2. Alterar variáveis Twilio no `.env`
3. Atualizar número em `server/routes.ts`

## 🔒 Segurança

- CORS configurado para produção
- Headers de segurança implementados
- Validação de entrada com Zod
- Sanitização de dados

## 📊 Monitoramento

- Logs automáticos no console
- Analytics de uso
- Métricas de agendamentos
- Dashboard de administração

## 🚨 Troubleshooting

### Problema: "Porta 5000 ocupada"
```bash
# Matar processo na porta 5000
sudo lsof -ti:5000 | xargs sudo kill -9
```

### Problema: "Banco não conecta"
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Problema: "npm install falha"
```bash
# Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📞 Suporte

- **WhatsApp**: (61) 99352-1849
- **Email**: Configurar no sistema
- **Repositório**: https://github.com/yuriwinchest/venderbrasil2025

---

## ✅ Checklist de Instalação

- [ ] Node.js 18+ instalado
- [ ] PostgreSQL configurado
- [ ] Arquivo .env criado
- [ ] Dependências instaladas (`npm install`)
- [ ] Banco migrado (`npm run db:push`)
- [ ] Aplicação iniciada (`npm run dev` ou `npm start`)
- [ ] WhatsApp testado
- [ ] Sistema funcionando na porta 5000

**🎉 Pronto! Seu sistema VenderBrasil está funcionando!**