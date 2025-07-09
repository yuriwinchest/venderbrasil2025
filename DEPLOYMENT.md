# Guias de Deployment - VenderBrasil 2025

## 🚀 Vercel (Recomendado para Frontend)

### 1. Prepare o projeto
```bash
npm run build
```

### 2. Deploy no Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Configurações Vercel
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## 🐳 Docker (Universal)

### Dockerfile já incluído
```bash
# Build da imagem
docker build -t venderbrasil2025 .

# Executar container
docker run -p 5000:5000 -e DATABASE_URL="your_db_url" venderbrasil2025
```

## ☁️ Railway

### 1. Conecte o GitHub ao Railway
- Acesse railway.app
- Conecte seu repositório GitHub
- Configure variáveis de ambiente

### 2. Configurações Railway
- Start Command: `npm run start`
- Build Command: `npm run build`
- Port: 5000

## 🌐 Heroku

### 1. Prepare o Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create venderbrasil2025
```

### 2. Configure variáveis
```bash
heroku config:set DATABASE_URL="your_postgresql_url"
heroku config:set TWILIO_ACCOUNT_SID="your_sid"
heroku config:set TWILIO_AUTH_TOKEN="your_token"
```

### 3. Deploy
```bash
git push heroku main
```

## 💙 DigitalOcean App Platform

### 1. Conecte o GitHub
- Acesse cloud.digitalocean.com/apps
- Create App from GitHub
- Selecione o repositório

### 2. Configurações
- Build Command: `npm run build`
- Run Command: `npm run start`
- Port: 5000

## 🎯 Netlify (Frontend Only)

### Deploy automático
- Conecte GitHub ao Netlify
- Build settings:
  - Build command: `npm run build`
  - Publish directory: `dist`

## 📋 Checklist Pré-Deploy

### ✅ Banco de Dados
- [ ] PostgreSQL configurado
- [ ] DATABASE_URL definida
- [ ] Migrações executadas (`npm run db:push`)

### ✅ Variáveis de Ambiente
- [ ] DATABASE_URL
- [ ] TWILIO_ACCOUNT_SID (para WhatsApp)
- [ ] TWILIO_AUTH_TOKEN
- [ ] TWILIO_PHONE_NUMBER
- [ ] OPENAI_API_KEY (opcional)

### ✅ Build
- [ ] `npm install` executado sem erros
- [ ] `npm run build` funcionando
- [ ] Testes básicos passando

### ✅ Performance
- [ ] Arquivos estáticos otimizados
- [ ] Gzip/Brotli configurado
- [ ] CDN configurado (se necessário)

## 🔧 Troubleshooting

### Erro de Build
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Erro de Database
```bash
# Verificar conexão
npm run db:studio

# Recriar tabelas
npm run db:push
```

### Performance Issues
- Configure Redis para cache
- Use CDN para assets
- Configure PostgreSQL connection pooling

---
Sistema pronto para produção em qualquer plataforma! 🚀
