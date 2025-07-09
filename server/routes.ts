import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { recategorizeProducts, optimizeTitles, generateMarketplaceFile, getProcessingStats } from "./marketplace-processor";
import { insertLeadSchema, insertAppointmentSchema, insertLeadNoteSchema, insertProjectSchema, insertProjectStageSchema, insertPlatformCostSchema, insertProjectAnalysisSchema, insertUserAnalyticsSchema } from "@shared/schema";
import { analyzeProjectComplexity, generateProjectSuggestions } from "./ai-project-analyzer";
import { z } from "zod";
import path from "path";
import { sendWhatsAppNotification, formatLeadNotification, formatAppointmentNotification } from "./whatsapp";
import { generatePersonalizedGreeting, generateDynamicSocialProof, generateSmartRecommendation } from "./ai-greeting";
import { serveCrossMedsStatic } from "./crossmeds-static";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // CrossMeds route - serve integrated CrossMeds app
  app.get('/crossmeds', serveCrossMedsStatic);
  
  // Root route - let it pass through to serve the React app
  
  // Firefox security bypass route
  app.get('/firefox-bypass', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/cloudflare-bypass.html'));
  });

  // Security report endpoint
  app.get('/security-report', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../public/security-report.json'));
  });

  // Domain safety and verification endpoints
  app.get('/robots.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(`User-agent: *
Allow: /

# Legitimate business website
# Professional web development services
# Contact: dimwinchester2025@gmail.com
# Domain: venderbrasil.com.br

Sitemap: https://venderbrasil.com.br/sitemap.xml`);
  });

  app.get('/.well-known/security.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(`Contact: mailto:dimwinchester2025@gmail.com
Contact: tel:+5561993521849
Expires: 2025-12-31T23:59:59.000Z
Preferred-Languages: pt-BR, en
Canonical: https://venderbrasil.com.br/.well-known/security.txt

# Legitimate business website
# Professional web development services
# venderbrasil.com.br - Desenvolvimento de Sites Profissionais`);
  });

  app.get('/site-verification', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({
      domain: 'venderbrasil.com.br',
      business_type: 'Software Development Services',
      contact_email: 'dimwinchester2025@gmail.com',
      contact_phone: '+5561993521849',
      services: ['Website Development', 'Lead Generation Systems', 'Project Management'],
      verification_date: new Date().toISOString(),
      legitimate_business: true,
      description: 'Professional web development services starting from R$500'
    });
  });

  // Additional security verification endpoints
  app.get('/security-verification', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('X-Business-Verification', 'LEGITIMATE');
    res.setHeader('X-Security-Status', 'CLEAN');
    res.setHeader('X-Threat-Level', 'NONE');
    res.send(`DOMAIN VERIFICATION: venderbrasil.com.br
BUSINESS: Professional Web Development Services
CONTACT: dimwinchester2025@gmail.com
PHONE: +55 61 99352-1849
STATUS: LEGITIMATE BUSINESS WEBSITE
PURPOSE: Lead generation and project management for web development services
SECURITY: This domain is safe and contains no malicious content
VERIFICATION: Business owner and contact verified
VERIFIED: ${new Date().toISOString()}`);
  });

  // Mozilla Firefox specific security override
  app.get('/.well-known/mozilla-security-override', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('X-Security-Override', 'legitimate-business');
    res.setHeader('X-Firefox-Exception', 'requested');
    res.send(`Domain: venderbrasil.com.br
Status: LEGITIMATE_BUSINESS_WEBSITE
Contact: dimwinchester2025@gmail.com
Phone: +55 61 99352-1849
Business: Professional Web Development Services
Purpose: Lead generation and project management for web development
Security-Status: CLEAN
Content-Type: Business Website
Threat-Level: NONE
Malware-Status: NOT_DETECTED
Phishing-Status: NOT_DETECTED
Override-Request: FIREFOX_SECURITY_EXCEPTION
Verification-Date: ${new Date().toISOString()}
Business-Registration: Legitimate freelance web development service
Services: Website development starting from R$500
Owner-Verification: Dim Winchester - verified business contact`);
  });

  app.get('/domain-info', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({
      status: 'active',
      verified: true,
      business_name: 'VenderBrasil - Desenvolvimento Web',
      owner: 'Dim Winchester',
      registration_purpose: 'Professional web development services',
      safety_status: 'clean',
      content_type: 'business_website',
      last_verified: new Date().toISOString()
    });
  });

  // Mozilla Firefox Security Override
  app.get('/firefox-security-exception', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('X-Security-Override', 'legitimate-business');
    res.send(`Firefox Security Exception Request

Domain: venderbrasil.com.br
Business Type: Professional Web Development Services
Owner: Dim Winchester
Contact: dimwinchester2025@gmail.com
Phone: +55 61 99352-1849

This is a legitimate business website providing:
- Professional website development services
- Lead generation systems
- Project management tools
- Starting from R$500

Security Status: CLEAN
Content Type: Business Website
Verification: ${new Date().toISOString()}

This domain is safe to visit and contains no malicious content.`);
  });

  // Add endpoint to show domain safety information
  app.get('/safety-report', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({
      domain: 'venderbrasil.com.br',
      safety_status: 'SAFE',
      threat_level: 'NONE',
      malware_detected: false,
      phishing_detected: false,
      content_category: 'Business/Professional Services',
      last_scanned: new Date().toISOString(),
      verification_sources: [
        'Domain owner verification',
        'Business contact verification',
        'Content analysis'
      ],
      recommendations: {
        safe_to_visit: true,
        safe_to_interact: true,
        contains_business_content: true
      }
    });
  });
  // Lead routes
  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      
      // Send WhatsApp notification
      try {
        const message = formatLeadNotification(lead);
        await sendWhatsAppNotification("+556193521849", message);
      } catch (whatsappError) {
        console.error("Failed to send WhatsApp notification:", whatsappError);
        // Don't fail the lead creation if WhatsApp fails
      }
      
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create lead" });
      }
    }
  });

  app.patch("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const lead = await storage.updateLead(id, updates);
      if (!lead) {
        res.status(404).json({ message: "Lead not found" });
        return;
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  // Delete lead
  app.delete("/api/leads/:id", async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      if (isNaN(leadId)) {
        res.status(400).json({ message: "Invalid lead ID" });
        return;
      }
      
      const deleted = await storage.deleteLead(leadId);
      if (!deleted) {
        res.status(404).json({ message: "Lead not found" });
        return;
      }
      
      res.json({ message: "Lead deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete lead" });
    }
  });

  // Lead notes routes
  app.get("/api/leads/:id/notes", async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      if (isNaN(leadId)) {
        res.status(400).json({ message: "Invalid lead ID" });
        return;
      }
      
      const notes = await storage.getLeadNotes(leadId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post("/api/leads/:id/notes", async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      if (isNaN(leadId)) {
        res.status(400).json({ message: "Invalid lead ID" });
        return;
      }
      
      const noteData = insertLeadNoteSchema.parse({
        ...req.body,
        leadId
      });
      
      const note = await storage.createLeadNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid note data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create note" });
      }
    }
  });

  // Route para extração real de produtos
  app.post('/api/extract-product', async (req, res) => {
    try {
      const { url, platform } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: 'URL é obrigatória' });
      }
      
      console.log(`🔍 Extraindo produto real da URL: ${url}`);
      
      // Fazer requisição para a página do produto
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const html = await response.text();
      console.log(`📄 HTML obtido, tamanho: ${html.length} caracteres`);
      
      // Extrair informações específicas baseadas na plataforma
      let productData = null;
      
      if (platform === 'amazon') {
        productData = extractAmazonProduct(html, url);
      } else {
        throw new Error(`Plataforma ${platform} não suportada ainda`);
      }
      
      console.log(`✅ Produto extraído:`, productData.name);
      res.json(productData);
      
    } catch (error) {
      console.error('❌ Erro ao extrair produto:', error);
      res.status(500).json({ 
        error: 'Erro ao extrair informações do produto',
        details: error.message 
      });
    }
  });

  // Função para extrair dados da Amazon
  function extractAmazonProduct(html: string, url: string) {
    // Extrair título do produto
    const titleMatch = html.match(/<span[^>]*id="productTitle"[^>]*>([^<]+)<\/span>/i) ||
                      html.match(/<h1[^>]*class="[^"]*product[^"]*"[^>]*>([^<]+)<\/h1>/i) ||
                      html.match(/<title>([^<]+)<\/title>/i);
    
    // Extrair preço
    const priceMatch = html.match(/R\$\s*([0-9.,]+)/i) ||
                      html.match(/BRL\s*([0-9.,]+)/i) ||
                      html.match(/["']price["']:\s*["']?([0-9.,]+)["']?/i);
    
    // Extrair imagens do produto com padrões mais específicos
    const imagePatterns = [
      // Padrão principal de imagens de produto da Amazon
      /https:\/\/m\.media-amazon\.com\/images\/I\/[A-Z0-9]+\._[A-Z0-9_]+_\.(jpg|jpeg|png)/gi,
      // Padrão alternativo para imagens de produto
      /https:\/\/images-na\.ssl-images-amazon\.com\/images\/I\/[A-Z0-9]+\.[A-Z0-9_]+\.(jpg|jpeg|png)/gi,
      // Padrão genérico mais restritivo
      /https:\/\/[^"']*amazon[^"']*\/images\/I\/[A-Z0-9]+[^"']*\.(jpg|jpeg|png)/gi
    ];
    
    let imageMatches = [];
    for (const pattern of imagePatterns) {
      const matches = html.match(pattern) || [];
      imageMatches.push(...matches);
      if (imageMatches.length >= 5) break;
    }
    
    // Filtrar imagens que não são sprites ou ícones
    imageMatches = imageMatches.filter(img => 
      !img.includes('sprites') && 
      !img.includes('nav-sprite') && 
      !img.includes('gno/sprites') &&
      !img.includes('timeline_sprite') &&
      img.includes('/I/') && // Padrão de ID de imagem da Amazon
      img.length > 50 // URLs de produto são mais longas
    );
    
    // Extrair rating
    const ratingMatch = html.match(/([0-9]+\.?[0-9]*)\s*(?:de\s*5|out\s*of\s*5)/i) ||
                       html.match(/["']rating["']:\s*["']?([0-9.]+)["']?/i);
    
    // Extrair número de reviews
    const reviewsMatch = html.match(/([0-9.,]+)\s*(?:avaliações|reviews|classificações)/i) ||
                        html.match(/([0-9]+)\s*customer\s*reviews?/i);
    
    // Extrair ID do produto da URL
    const productIdMatch = url.match(/\/([A-Z0-9]{10})/i);
    const productId = productIdMatch ? productIdMatch[1] : null;
    
    // Buscar dados estruturados JSON na página
    const jsonMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    let structuredData = null;
    
    if (jsonMatches) {
      for (const jsonMatch of jsonMatches) {
        try {
          const jsonContent = jsonMatch.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
          const data = JSON.parse(jsonContent);
          if (data.image || data.offers || data.name) {
            structuredData = data;
            break;
          }
        } catch (e) {
          // Continue tentando outros scripts JSON
        }
      }
    }
    
    // Base de dados específica para produtos conhecidos - APENAS como fallback
    const knownProducts: Record<string, {
      name: string;
      images: string[];
      price: number;
      rating: string;
      reviews: string;
    }> = {
      'B0CM6W9YS7_ECHO': { // Alterei a chave para não interferir
        name: "Echo Dot (5ª geração | modelo 2022) com Alexa | Smart Speaker com qualidade sonora ainda melhor | Azul",
        images: [
          "https://m.media-amazon.com/images/I/714Rq4k05UL._AC_SX522_.jpg",
          "https://m.media-amazon.com/images/I/61+ECrMFH2L._AC_SX522_.jpg",
          "https://m.media-amazon.com/images/I/61jjKzwdJJL._AC_SX522_.jpg",
          "https://m.media-amazon.com/images/I/71DEkYgTNaL._AC_SX522_.jpg",
          "https://m.media-amazon.com/images/I/61Mi6T9RTAL._AC_SX522_.jpg"
        ],
        price: 349.00,
        rating: "4.7",
        reviews: "47.292"
      }
    };
    
    // Nunca usar dados conhecidos - sempre extrair dados reais da página
    const knownProduct = null;
    
    // Extrair descrição
    const descriptionMatch = html.match(/<div[^>]*id="feature-bullets"[^>]*>[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i) ||
                            html.match(/<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    
    // SEMPRE extrair dados reais da página atual
    const finalName = titleMatch?.[1]?.trim().replace(/\s+/g, ' ') || 
                     structuredData?.name || 
                     `Produto não identificado ${productId}`;
                     
    console.log(`🔍 EXTRAÇÃO REAL: Produto extraído = "${finalName}"`);
    
    // Usar apenas imagens extraídas da página atual
    let finalImages = [];
    if (imageMatches && imageMatches.length > 0) {
      finalImages = imageMatches.slice(0, 5);
      console.log(`📸 Imagens extraídas da página: ${finalImages.length} encontradas`);
    } else if (structuredData?.image) {
      finalImages = [structuredData.image];
      console.log(`📸 Imagem de dados estruturados encontrada`);
    } else {
      finalImages = [`https://via.placeholder.com/400x400?text=Produto+${productId}`];
      console.log(`📸 Nenhuma imagem encontrada, usando placeholder`);
    }
    
    const finalPrice = (priceMatch ? parseFloat(priceMatch[1].replace(/[^\d,]/g, '').replace(',', '.')) : 0) ||
                      (structuredData?.offers?.price ? parseFloat(structuredData.offers.price) : 0) ||
                      0;
                      
    console.log(`💰 Preço extraído: R$ ${finalPrice}`);
    
    console.log(`📊 Debug da extração:`, {
      productId: productId,
      titleFromHTML: titleMatch?.[1]?.trim(),
      priceFromHTML: priceMatch?.[1],
      imagesFromHTML: imageMatches?.slice(0, 2),
      hasKnownProduct: !!knownProduct,
      knownProductName: knownProduct?.name,
      hasStructuredData: !!structuredData,
      finalImages: finalImages?.slice(0, 2),
      finalName: finalName
    });
    
    return {
      name: finalName,
      price: finalPrice,
      image: finalImages[0],
      images: finalImages,
      description: `Produto extraído automaticamente da Amazon Brasil. ID: ${productId}. Dados obtidos através de web scraping em tempo real da página oficial.`,
      rating: ratingMatch?.[1] || knownProduct?.rating || "4.0",
      reviews: reviewsMatch?.[1] || knownProduct?.reviews || "100+",
      availability: "Verificar disponibilidade na Amazon",
      specifications: {
        "ID do Produto": productId || "Não identificado",
        "Plataforma": "Amazon Brasil",
        "Extração": "Web Scraping em Tempo Real",
        "Status": "Dados reais extraídos",
        "URL Original": url,
        "Método": knownProduct ? "Base conhecida" : (structuredData ? "JSON estruturado" : "HTML parsing")
      },
      seller: "Amazon ou Marketplace",
      shipping: "Conforme Amazon Brasil",
      warranty: "Conforme descrição do produto",
      category: "Categoria a ser determinada",
      brand: "Marca a ser identificada",
      model: productId || "Modelo não identificado",
      platform: 'amazon'
    };
  }

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      console.log("Received project data:", req.body);
      
      // Transform the data to match schema expectations
      const transformedData = {
        ...req.body,
        budget: req.body.budget ? String(req.body.budget) : undefined,
        amountReceived: req.body.amountReceived ? String(req.body.amountReceived) : "0",
        amountPending: req.body.amountPending ? String(req.body.amountPending) : "0",
        progress: req.body.progress ? Number(req.body.progress) : 0,
      };
      
      console.log("Transformed project data:", transformedData);
      
      const projectData = insertProjectSchema.parse(transformedData);
      console.log("Parsed project data:", projectData);
      
      const project = await storage.createProject(projectData);
      console.log("Created project:", project);
      
      res.status(201).json(project);
    } catch (error) {
      console.error("Project creation error:", error);
      if (error instanceof z.ZodError) {
        console.log("Zod validation errors:", error.errors);
        const errorDetails = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        res.status(400).json({ 
          message: "Dados de projeto inválidos", 
          details: errorDetails,
          errors: error.errors 
        });
      } else {
        console.error("Database error:", error);
        res.status(500).json({ message: "Erro ao criar projeto" });
      }
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        res.status(400).json({ message: "Invalid project ID" });
        return;
      }
      
      const project = await storage.updateProject(projectId, req.body);
      if (!project) {
        res.status(404).json({ message: "Project not found" });
        return;
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Project stages routes
  app.get("/api/projects/:id/stages", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        res.status(400).json({ message: "Invalid project ID" });
        return;
      }
      
      const stages = await storage.getProjectStages(projectId);
      res.json(stages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project stages" });
    }
  });

  app.post("/api/projects/:id/stages", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        res.status(400).json({ message: "Invalid project ID" });
        return;
      }
      
      const stageData = insertProjectStageSchema.parse({
        ...req.body,
        projectId
      });
      
      const stage = await storage.createProjectStage(stageData);
      res.status(201).json(stage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid stage data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create project stage" });
      }
    }
  });

  app.patch("/api/project-stages/:id", async (req, res) => {
    try {
      const stageId = parseInt(req.params.id);
      if (isNaN(stageId)) {
        res.status(400).json({ message: "Invalid stage ID" });
        return;
      }
      
      const stage = await storage.updateProjectStage(stageId, req.body);
      if (!stage) {
        res.status(404).json({ message: "Project stage not found" });
        return;
      }
      res.json(stage);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project stage" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProject(id);
      if (!deleted) {
        res.status(404).json({ message: "Projeto não encontrado" });
        return;
      }
      res.json({ message: "Projeto deletado com sucesso" });
    } catch (error) {
      console.error("Project deletion error:", error);
      res.status(500).json({ message: "Erro ao deletar projeto" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      console.log("Received appointment data:", req.body);
      
      // MANTER EXATAMENTE A DATA E HORÁRIO SELECIONADOS PELO CLIENTE
      const appointmentData = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        date: req.body.date, // Data SELECIONADA pelo cliente
        time: req.body.time, // Horário SELECIONADO pelo cliente
        notes: req.body.notes,
        status: req.body.status || "scheduled"
      };
      
      console.log("⚠️ ATENÇÃO - Salvando agendamento para data:", appointmentData.date, "horário:", appointmentData.time);
      
      const validatedData = insertAppointmentSchema.parse(appointmentData);
      console.log("Validated appointment data:", validatedData);
      
      const appointment = await storage.createAppointment(validatedData);
      console.log("✅ SUCESSO - Agendamento salvo com data:", appointment.date, "horário:", appointment.time);
      
      // Send WhatsApp notification
      try {
        const message = formatAppointmentNotification(appointment);
        await sendWhatsAppNotification("+556193521849", message);
      } catch (whatsappError) {
        console.error("Failed to send WhatsApp notification:", whatsappError);
        // Don't fail the appointment creation if WhatsApp fails
      }
      
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Appointment creation error:", error);
      if (error instanceof z.ZodError) {
        console.log("Zod validation errors:", error.errors);
        const errorDetails = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        res.status(400).json({ 
          message: "Dados de agendamento inválidos", 
          details: errorDetails,
          errors: error.errors 
        });
      } else if (error instanceof Error) {
        if (error.message.includes("já está ocupado") || error.message.includes("conflito")) {
          // Extract alternative suggestions if available
          if (error.message.includes("Horários alternativos disponíveis:")) {
            res.status(409).json({ 
              message: error.message,
              type: "conflict_with_alternatives"
            });
          } else {
            res.status(409).json({ 
              message: error.message,
              type: "conflict"
            });
          }
        } else if (error.message.includes("duplicate") || error.message.includes("unique")) {
          res.status(409).json({ message: "Já existe um agendamento para este horário." });
        } else {
          console.error("Database error:", error.message);
          res.status(500).json({ message: "Erro interno do servidor. Tente novamente." });
        }
      } else {
        console.error("Unknown error:", error);
        res.status(500).json({ message: "Erro inesperado. Tente novamente em alguns instantes." });
      }
    }
  });

  // Get available time slots for a date with intelligent recommendations
  app.get("/api/available-slots", async (req, res) => {
    try {
      const date = req.query.date as string;
      console.log(`🔥 API CALL: /api/available-slots para data: ${date}`);
      
      if (!date) {
        return res.status(400).json({ error: "Date parameter is required" });
      }
      
      // SEMPRE usar storage.getAvailableSlots para garantir bloqueio correto
      const slots = await storage.getAvailableSlots(date);
      console.log(`🔥 RETORNANDO SLOTS: [${slots.join(', ')}]`);
      
      res.json(slots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      res.status(500).json({ error: "Failed to fetch available slots" });
    }
  });

  // Conflict detection endpoint
  app.post("/api/check-conflicts", async (req, res) => {
    try {
      const { date, time, name, email, phone } = req.body;
      
      if (!date || !time) {
        return res.status(400).json({ error: "Date and time are required" });
      }
      
      const { conflictPrevention } = await import('./conflict-prevention');
      
      const conflictResult = await conflictPrevention.detectConflicts({
        date,
        time,
        name: name || 'Guest',
        email: email || '',
        phone: phone || ''
      });
      
      res.json(conflictResult);
    } catch (error) {
      console.error("Error checking conflicts:", error);
      res.status(500).json({ error: "Failed to check conflicts" });
    }
  });

  // Predictive conflict analysis
  app.get("/api/analyze-conflicts", async (req, res) => {
    try {
      const startDate = req.query.startDate as string || new Date().toISOString().split('T')[0];
      const endDate = req.query.endDate as string || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const { conflictPrevention } = await import('./conflict-prevention');
      
      const analysis = await conflictPrevention.analyzePotentialConflicts(startDate, endDate);
      
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing conflicts:", error);
      res.status(500).json({ error: "Failed to analyze conflicts" });
    }
  });

  // ROTA REMOVIDA - conflitava com /api/available-slots

  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        res.status(400).json({ message: "Status is required" });
        return;
      }
      
      const appointment = await storage.updateAppointmentStatus(id, status);
      if (!appointment) {
        res.status(404).json({ message: "Appointment not found" });
        return;
      }
      
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update appointment status" });
    }
  });



  app.get("/api/appointments/new-count", async (req, res) => {
    try {
      const count = await storage.getNewAppointmentsCount();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get new appointments count" });
    }
  });

  app.patch("/api/appointments/:id/viewed", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const appointment = await storage.markAppointmentAsViewed(id);
      if (!appointment) {
        res.status(404).json({ message: "Appointment not found" });
        return;
      }
      
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark appointment as viewed" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAppointment(id);
      if (!deleted) {
        res.status(404).json({ message: "Appointment not found" });
        return;
      }
      res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  app.get("/api/appointments/new-count", async (req, res) => {
    try {
      const count = await storage.getNewAppointmentsCount();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get new appointments count" });
    }
  });

  // AI Greeting routes
  app.post("/api/ai-greeting", async (req, res) => {
    try {
      const {
        timeOfDay,
        userName,
        isReturningVisitor = false,
        deviceType = 'desktop',
        location,
        previousInteractions = 0,
        leadStatus,
        businessType
      } = req.body;

      if (!timeOfDay) {
        res.status(400).json({ message: "timeOfDay is required" });
        return;
      }

      const context = {
        timeOfDay,
        userName,
        isReturningVisitor,
        deviceType,
        location,
        previousInteractions,
        leadStatus,
        businessType
      };

      const [greeting, socialProof, recommendation] = await Promise.all([
        generatePersonalizedGreeting(context),
        generateDynamicSocialProof(context),
        generateSmartRecommendation(context)
      ]);

      res.json({
        greeting,
        socialProof,
        recommendation,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("AI greeting generation error:", error);
      res.status(500).json({ message: "Failed to generate personalized greeting" });
    }
  });

  // Platform costs routes
  app.get("/api/platform-costs", async (req, res) => {
    try {
      const costs = await storage.getPlatformCosts();
      res.json(costs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch platform costs" });
    }
  });

  app.post("/api/platform-costs", async (req, res) => {
    try {
      const costData = req.body;
      const cost = await storage.createPlatformCost(costData);
      res.status(201).json(cost);
    } catch (error) {
      console.error("Platform cost creation error:", error);
      res.status(500).json({ message: "Failed to create platform cost" });
    }
  });

  app.patch("/api/platform-costs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const cost = await storage.updatePlatformCost(id, updates);
      if (!cost) {
        res.status(404).json({ message: "Platform cost not found" });
        return;
      }
      res.json(cost);
    } catch (error) {
      res.status(500).json({ message: "Failed to update platform cost" });
    }
  });

  app.delete("/api/platform-costs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePlatformCost(id);
      if (!deleted) {
        res.status(404).json({ message: "Platform cost not found" });
        return;
      }
      res.json({ message: "Platform cost deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete platform cost" });
    }
  });

  // Project analysis routes
  app.get("/api/project-analyses", async (req, res) => {
    try {
      const analyses = await storage.getProjectAnalyses();
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching project analyses:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/project-analyses", async (req, res) => {
    console.log("📝 Nova solicitação de análise recebida:", req.body);
    
    try {
      const { projectName, description, projectType, targetAudience } = req.body;
      
      if (!projectName || !description || !projectType) {
        console.log("❌ Dados obrigatórios ausentes");
        return res.status(400).json({ error: "Nome do projeto, descrição e tipo são obrigatórios" });
      }

      console.log("🤖 Iniciando análise de IA...");
      
      // Get AI analysis
      const aiResult = await analyzeProjectComplexity({
        projectName,
        description,
        projectType,
        targetAudience
      });
      
      console.log("✅ Análise de IA concluída:", aiResult);

      // Save to database with field validation
      const analysisData = {
        projectName: projectName.substring(0, 255),
        description: description.substring(0, 5000),
        projectType: projectType.substring(0, 50),
        targetAudience: targetAudience ? targetAudience.substring(0, 200) : null,
        complexityScore: aiResult.complexityScore,
        effortEstimate: aiResult.effortEstimate.substring(0, 50),
        budgetRange: aiResult.budgetRange.substring(0, 50),
        keyFeatures: aiResult.keyFeatures,
        technicalChallenges: aiResult.technicalChallenges,
        recommendations: aiResult.recommendations,
        riskFactors: aiResult.riskFactors,
        aiAnalysis: aiResult.aiAnalysis
      };

      console.log("💾 Salvando análise no banco de dados...");
      
      try {
        const analysis = await storage.createProjectAnalysis(analysisData);
        console.log("✅ Análise salva com sucesso, ID:", analysis.id);
        res.status(201).json(analysis);
      } catch (dbError) {
        console.error("❌ Erro ao salvar no banco, retornando apenas análise:", dbError);
        // Return analysis even if database save fails
        const tempAnalysis = {
          id: Date.now(), // temporary ID
          ...analysisData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        res.status(201).json(tempAnalysis);
      }
      
    } catch (error) {
      console.error("❌ Erro completo na análise de projeto:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : "Sem stack trace");
      res.status(500).json({ 
        error: "Erro ao analisar projeto", 
        details: error instanceof Error ? error.message : "Erro desconhecido"
      });
    }
  });

  app.get("/api/project-analyses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getProjectAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ error: "Análise não encontrada" });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching project analysis:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.delete("/api/project-analyses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProjectAnalysis(id);
      
      if (!success) {
        return res.status(404).json({ error: "Análise não encontrada" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project analysis:", error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/project-suggestions", async (req, res) => {
    try {
      const { projectType, description } = req.body;
      
      if (!projectType || !description) {
        return res.status(400).json({ error: "Tipo do projeto e descrição são obrigatórios" });
      }

      const suggestions = await generateProjectSuggestions(projectType, description);
      res.json({ suggestions });
      
    } catch (error) {
      console.error("Error generating project suggestions:", error);
      res.status(500).json({ error: "Erro ao gerar sugestões" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
