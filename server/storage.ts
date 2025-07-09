import { leads, appointments, leadNotes, projects, projectStages, platformCosts, projectAnalyses, userProfiles, achievements, userAchievements, marketResearchActivities, type Lead, type Appointment, type InsertLead, type InsertAppointment, type LeadNote, type InsertLeadNote, type Project, type InsertProject, type ProjectStage, type InsertProjectStage, type PlatformCost, type InsertPlatformCost, type ProjectAnalysis, type InsertProjectAnalysis } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, count, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Lead management
  getLeads(): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, updates: Partial<Lead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  
  // Lead notes management
  getLeadNotes(leadId: number): Promise<LeadNote[]>;
  createLeadNote(note: InsertLeadNote): Promise<LeadNote>;
  
  // Appointment management
  getAppointments(): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAvailableSlots(date: string): Promise<string[]>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  markAppointmentAsViewed(id: number): Promise<Appointment | undefined>;
  getNewAppointmentsCount(): Promise<number>;
  deleteAppointment(id: number): Promise<boolean>;
  
  // Project management
  getProjects(): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  getProjectStages(projectId: number): Promise<ProjectStage[]>;
  createProjectStage(stage: InsertProjectStage): Promise<ProjectStage>;
  updateProjectStage(id: number, updates: Partial<ProjectStage>): Promise<ProjectStage | undefined>;
  
  // Platform costs management
  getPlatformCosts(): Promise<PlatformCost[]>;
  createPlatformCost(cost: InsertPlatformCost): Promise<PlatformCost>;
  updatePlatformCost(id: number, updates: Partial<PlatformCost>): Promise<PlatformCost | undefined>;
  deletePlatformCost(id: number): Promise<boolean>;
  
  // Project analysis management
  getProjectAnalyses(): Promise<ProjectAnalysis[]>;
  createProjectAnalysis(analysis: InsertProjectAnalysis): Promise<ProjectAnalysis>;
  getProjectAnalysis(id: number): Promise<ProjectAnalysis | undefined>;
  deleteProjectAnalysis(id: number): Promise<boolean>;
  
  // User analytics management
  getUserAnalytics(): Promise<UserAnalytics[]>;
  createUserAnalytic(analytic: InsertUserAnalytics): Promise<UserAnalytics>;
  getUserAnalyticsByDateRange(startDate: string, endDate: string): Promise<UserAnalytics[]>;
  getDailyStats(): Promise<DailyStats[]>;
  createOrUpdateDailyStats(stats: InsertDailyStats): Promise<DailyStats>;
  getAnalyticsOverview(): Promise<{
    totalVisitors: number;
    dataAnalyzerUsers: number;
    marketplaceUsers: number;
    averageSessionTime: number;
    topPages: Array<{ page: string; visits: number }>;
    deviceDistribution: Array<{ device: string; count: number }>;
    countryDistribution: Array<{ country: string; count: number }>;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values({
        ...insertLead,
        status: insertLead.status || "new"
      })
      .returning();
    return lead;
  }

  async updateLead(id: number, updates: Partial<Lead>): Promise<Lead | undefined> {
    const [lead] = await db
      .update(leads)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(leads.id, id))
      .returning();
    return lead || undefined;
  }

  async deleteLead(id: number): Promise<boolean> {
    const result = await db
      .delete(leads)
      .where(eq(leads.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getLeadNotes(leadId: number): Promise<LeadNote[]> {
    return await db.select().from(leadNotes)
      .where(eq(leadNotes.leadId, leadId))
      .orderBy(desc(leadNotes.createdAt));
  }

  async createLeadNote(note: InsertLeadNote): Promise<LeadNote> {
    const [newNote] = await db
      .insert(leadNotes)
      .values({
        ...note,
        createdAt: new Date()
      })
      .returning();
    return newNote;
  }

  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments).orderBy(desc(appointments.createdAt));
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    // Use the intelligent conflict prevention system
    const { conflictPrevention } = await import('./conflict-prevention');
    
    const bookingAttempt = {
      date: insertAppointment.date,
      time: insertAppointment.time,
      name: insertAppointment.name,
      email: insertAppointment.email || '',
      phone: insertAppointment.phone || ''
    };

    const result = await conflictPrevention.attemptAtomicBooking(bookingAttempt);
    
    if (!result.success) {
      const errorMessage = result.message || 'Falha ao criar agendamento devido a conflito';
      
      // Include alternative suggestions in the error
      if (result.conflictResult?.alternativeSlots.length > 0) {
        const alternatives = result.conflictResult.alternativeSlots.slice(0, 3).join(', ');
        throw new Error(`${errorMessage} Horários alternativos disponíveis: ${alternatives}`);
      }
      
      throw new Error(errorMessage);
    }

    // Fetch and return the created appointment
    const [appointment] = await db.select()
      .from(appointments)
      .where(eq(appointments.id, result.appointmentId!));
    
    return appointment;
  }

  async getAvailableSlots(date: string): Promise<string[]> {
    const currentDate = new Date();
    const today = currentDate.toISOString().split('T')[0];
    
    // CORREÇÃO CRÍTICA: NÃO auto-completar agendamentos passados
    // Agendamentos só devem ser liberados manualmente no painel administrativo
    // await this.autoCompletePastAppointments(); // REMOVIDO
    
    console.log(`🔍 Verificando horários ocupados para data: ${date}`);
    
    // CORREÇÃO: Buscar TODOS os agendamentos ativos independente da data
    // Horários marcados ficam bloqueados até serem liberados manualmente no painel
    const bookedAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.date, date),
          or(
            eq(appointments.status, "scheduled"),
            eq(appointments.status, "pending"), 
            eq(appointments.status, "confirmed")
          )
        )
      );
      
    console.log(`📅 Data: ${date} - Encontrados ${bookedAppointments.length} agendamentos ocupados:`, 
      bookedAppointments.map(apt => `${apt.time} (${apt.status})`));
    
    console.log(`🔍 Query SQL: SELECT * FROM appointments WHERE date = '${date}' AND status IN ('scheduled', 'pending', 'confirmed')`);

    // Define all available time slots (horários de 8h às 23h)
    const allSlots = [
      "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
      "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", 
      "20:00", "21:00", "22:00", "23:00"
    ];
    
    // Extract booked times - TODOS os horários marcados ficam bloqueados
    const bookedTimes = bookedAppointments.map(appointment => appointment.time);
    console.log(`⏰ Horários PERMANENTEMENTE ocupados: [${bookedTimes.join(', ')}]`);
    
    // Filter out booked time slots - HORÁRIOS MARCADOS NUNCA FICAM DISPONÍVEIS ATÉ LIBERAÇÃO MANUAL
    let availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));
    console.log(`✅ Horários disponíveis ANTES do filtro de hoje: [${availableSlots.join(', ')}]`);
    
    // APENAS para hoje: filtrar horários que já passaram (mas manter horários marcados bloqueados)
    if (date === today) {
      const currentHour = currentDate.getHours();
      const currentMinute = currentDate.getMinutes();
      
      availableSlots = availableSlots.filter(slot => {
        const slotHour = parseInt(slot.split(':')[0]);
        const slotMinute = parseInt(slot.split(':')[1]);
        
        // Só mostrar horários que estão pelo menos 15 minutos no futuro
        if (slotHour > currentHour) return true;
        if (slotHour === currentHour && slotMinute > currentMinute + 15) return true;
        return false;
      });
      
      console.log(`🕒 Filtro aplicado para hoje - Horários disponíveis APÓS filtro: [${availableSlots.join(', ')}]`);
    }
    
    console.log(`🔥 RETORNANDO SLOTS FINAIS: [${availableSlots.join(', ')}]`);
    return availableSlots;
  }

  private async autoCompletePastAppointments(): Promise<void> {
    const currentDate = new Date();
    const currentDateTime = currentDate.toISOString();
    const today = currentDate.toISOString().split('T')[0];
    const currentTime = currentDate.toTimeString().substring(0, 5);
    
    // Find all scheduled appointments that are in the past
    const pastAppointments = await db
      .select()
      .from(appointments)
      .where(eq(appointments.status, "scheduled"));
    
    for (const appointment of pastAppointments) {
      const appointmentDate = appointment.date;
      const appointmentTime = appointment.time;
      
      // Check if appointment is in the past
      let isPast = false;
      
      if (appointmentDate < today) {
        // Appointment is on a previous date
        isPast = true;
      } else if (appointmentDate === today) {
        // Appointment is today, check if time has passed + 15 minutes
        const [appHour, appMinute] = appointmentTime.split(':').map(Number);
        const appointmentDateTime = new Date(currentDate);
        appointmentDateTime.setHours(appHour, appMinute + 15, 0, 0); // Add 15 minutes buffer
        
        if (currentDate > appointmentDateTime) {
          isPast = true;
        }
      }
      
      if (isPast) {
        // Auto-complete the appointment
        await db
          .update(appointments)
          .set({ 
            status: "completed",
            updatedAt: new Date(),
            notes: appointment.notes ? 
              `${appointment.notes}\n[Auto-completed: Appointment time passed]` : 
              "[Auto-completed: Appointment time passed]"
          })
          .where(eq(appointments.id, appointment.id));
      }
    }
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const [appointment] = await db
      .update(appointments)
      .set({ status, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  async markAppointmentAsViewed(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db
      .update(appointments)
      .set({ 
        isViewed: true,
        updatedAt: new Date()
      })
      .where(eq(appointments.id, id))
      .returning();
    return appointment || undefined;
  }

  async getNewAppointmentsCount(): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.isViewed, false),
          eq(appointments.status, "scheduled")
        )
      );
    return result[0]?.count || 0;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(appointments)
        .where(eq(appointments.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return false;
    }
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values({
        ...project,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newProject;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db
      .delete(projects)
      .where(eq(projects.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getProjectStages(projectId: number): Promise<ProjectStage[]> {
    return await db.select().from(projectStages)
      .where(eq(projectStages.projectId, projectId))
      .orderBy(projectStages.order);
  }

  async createProjectStage(stage: InsertProjectStage): Promise<ProjectStage> {
    const [newStage] = await db
      .insert(projectStages)
      .values({
        ...stage,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newStage;
  }

  async updateProjectStage(id: number, updates: Partial<ProjectStage>): Promise<ProjectStage | undefined> {
    const [stage] = await db
      .update(projectStages)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(projectStages.id, id))
      .returning();
    return stage || undefined;
  }

  // Platform costs methods
  async getPlatformCosts(): Promise<PlatformCost[]> {
    return await db.select().from(platformCosts).orderBy(desc(platformCosts.createdAt));
  }

  async createPlatformCost(insertCost: InsertPlatformCost): Promise<PlatformCost> {
    const [cost] = await db
      .insert(platformCosts)
      .values(insertCost)
      .returning();
    return cost;
  }

  async updatePlatformCost(id: number, updates: Partial<PlatformCost>): Promise<PlatformCost | undefined> {
    const [cost] = await db
      .update(platformCosts)
      .set(updates)
      .where(eq(platformCosts.id, id))
      .returning();
    return cost || undefined;
  }

  async deletePlatformCost(id: number): Promise<boolean> {
    const result = await db
      .delete(platformCosts)
      .where(eq(platformCosts.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getProjectAnalyses(): Promise<ProjectAnalysis[]> {
    return await db.select().from(projectAnalyses).orderBy(desc(projectAnalyses.createdAt));
  }

  async createProjectAnalysis(insertAnalysis: InsertProjectAnalysis): Promise<ProjectAnalysis> {
    const [analysis] = await db
      .insert(projectAnalyses)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  async getProjectAnalysis(id: number): Promise<ProjectAnalysis | undefined> {
    const [analysis] = await db.select().from(projectAnalyses).where(eq(projectAnalyses.id, id));
    return analysis || undefined;
  }

  async deleteProjectAnalysis(id: number): Promise<boolean> {
    try {
      await db.delete(projectAnalyses).where(eq(projectAnalyses.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting project analysis:", error);
      return false;
    }
  }

  // User Analytics methods
  async getUserAnalytics(): Promise<UserAnalytics[]> {
    return await db.select().from(userAnalytics)
      .orderBy(desc(userAnalytics.timestamp));
  }

  async createUserAnalytic(insertAnalytic: InsertUserAnalytics): Promise<UserAnalytics> {
    const [analytic] = await db.insert(userAnalytics)
      .values(insertAnalytic)
      .returning();
    return analytic;
  }

  async getUserAnalyticsByDateRange(startDate: string, endDate: string): Promise<UserAnalytics[]> {
    return await db.select().from(userAnalytics)
      .where(
        and(
          gte(userAnalytics.timestamp, new Date(startDate)),
          lte(userAnalytics.timestamp, new Date(endDate))
        )
      )
      .orderBy(desc(userAnalytics.timestamp));
  }

  async getDailyStats(): Promise<DailyStats[]> {
    return await db.select().from(dailyStats)
      .orderBy(desc(dailyStats.date));
  }

  async createOrUpdateDailyStats(insertStats: InsertDailyStats): Promise<DailyStats> {
    const [existing] = await db.select().from(dailyStats)
      .where(eq(dailyStats.date, insertStats.date));

    if (existing) {
      const [updated] = await db.update(dailyStats)
        .set(insertStats)
        .where(eq(dailyStats.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(dailyStats)
        .values(insertStats)
        .returning();
      return created;
    }
  }

  async getAnalyticsOverview(): Promise<{
    totalVisitors: number;
    dataAnalyzerUsers: number;
    marketplaceUsers: number;
    averageSessionTime: number;
    topPages: Array<{ page: string; visits: number }>;
    deviceDistribution: Array<{ device: string; count: number }>;
    countryDistribution: Array<{ country: string; count: number }>;
  }> {
    // Últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const analytics = await db.select().from(userAnalytics)
      .where(gte(userAnalytics.timestamp, thirtyDaysAgo));

    // Contar visitantes únicos por sessionId
    const uniqueVisitors = new Set(analytics.map(a => a.sessionId)).size;

    // Usuários do analisador de dados
    const dataAnalyzerUsers = new Set(
      analytics
        .filter(a => a.page === '/analisar-dados')
        .map(a => a.sessionId)
    ).size;

    // Usuários do processador de marketplace
    const marketplaceUsers = new Set(
      analytics
        .filter(a => a.action.includes('marketplace'))
        .map(a => a.sessionId)
    ).size;

    // Tempo médio de sessão
    const sessionsWithDuration = analytics.filter(a => a.duration && a.duration > 0);
    const averageSessionTime = sessionsWithDuration.length > 0
      ? Math.round(sessionsWithDuration.reduce((acc, a) => acc + (a.duration || 0), 0) / sessionsWithDuration.length)
      : 0;

    // Top páginas
    const pageCount = analytics.reduce((acc, a) => {
      acc[a.page] = (acc[a.page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topPages = Object.entries(pageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([page, visits]) => ({ page, visits }));

    // Distribuição de dispositivos
    const deviceCount = analytics.reduce((acc, a) => {
      const device = a.deviceType || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const deviceDistribution = Object.entries(deviceCount)
      .map(([device, count]) => ({ device, count }))
      .sort((a, b) => b.count - a.count);

    // Distribuição de países
    const countryCount = analytics.reduce((acc, a) => {
      const country = a.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const countryDistribution = Object.entries(countryCount)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalVisitors: uniqueVisitors,
      dataAnalyzerUsers,
      marketplaceUsers,
      averageSessionTime,
      topPages,
      deviceDistribution,
      countryDistribution
    };
  }

  // Gamified Achievement System Methods
  async getUserProfile(userId: string): Promise<any> {
    const profiles = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    if (profiles.length === 0) {
      // Create new profile
      const [newProfile] = await db.insert(userProfiles).values({
        userId,
        level: 1,
        xp: 0,
        totalProductsAnalyzed: 0,
        totalMarketResearch: 0,
        totalDatasetsUploaded: 0,
        totalInsightsGenerated: 0,
        streak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0]
      }).returning();
      return newProfile;
    }
    return profiles[0];
  }

  async updateUserProfile(userId: string, updates: Partial<any>): Promise<any> {
    const [updated] = await db
      .update(userProfiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updated;
  }

  async addXP(userId: string, xp: number): Promise<any> {
    const profile = await this.getUserProfile(userId);
    const newXP = profile.xp + xp;
    const newLevel = Math.floor(newXP / 100) + 1; // 100 XP per level
    
    return this.updateUserProfile(userId, {
      xp: newXP,
      level: newLevel
    });
  }

  async recordActivity(activity: any): Promise<void> {
    await db.insert(marketResearchActivities).values(activity);
    
    // Award XP based on activity type
    const xpRewards = {
      'product_extraction': 10,
      'price_analysis': 15,
      'data_upload': 20,
      'market_comparison': 25,
      'insight_generation': 30
    };
    
    const xp = xpRewards[activity.activityType as keyof typeof xpRewards] || 5;
    await this.addXP(activity.userId, xp);
    
    // Update profile statistics
    const profile = await this.getUserProfile(activity.userId);
    const updates: any = {};
    
    switch (activity.activityType) {
      case 'product_extraction':
        updates.totalProductsAnalyzed = profile.totalProductsAnalyzed + 1;
        break;
      case 'data_upload':
        updates.totalDatasetsUploaded = profile.totalDatasetsUploaded + 1;
        break;
      case 'market_comparison':
      case 'price_analysis':
        updates.totalMarketResearch = profile.totalMarketResearch + 1;
        break;
      case 'insight_generation':
        updates.totalInsightsGenerated = profile.totalInsightsGenerated + 1;
        break;
    }
    
    if (Object.keys(updates).length > 0) {
      await this.updateUserProfile(activity.userId, updates);
    }
    
    // Check for achievements
    await this.checkAchievements(activity.userId);
  }

  async getAchievements(): Promise<any[]> {
    return await db.select().from(achievements).where(eq(achievements.isActive, true));
  }

  async getUserAchievements(userId: string): Promise<any[]> {
    return await db
      .select({
        id: userAchievements.id,
        achievementId: userAchievements.achievementId,
        earnedAt: userAchievements.earnedAt,
        progress: userAchievements.progress,
        achievement: achievements
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));
  }

  async checkAchievements(userId: string): Promise<any[]> {
    const profile = await this.getUserProfile(userId);
    const userAchievs = await this.getUserAchievements(userId);
    const allAchievements = await this.getAchievements();
    const earnedIds = userAchievs.map(ua => ua.achievementId);
    const newAchievements = [];

    for (const achievement of allAchievements) {
      if (earnedIds.includes(achievement.id)) continue;

      const req = achievement.requirement as any;
      let earned = false;

      switch (req.type) {
        case 'products_analyzed':
          earned = profile.totalProductsAnalyzed >= req.value;
          break;
        case 'market_research':
          earned = profile.totalMarketResearch >= req.value;
          break;
        case 'datasets_uploaded':
          earned = profile.totalDatasetsUploaded >= req.value;
          break;
        case 'xp_earned':
          earned = profile.xp >= req.value;
          break;
        case 'level_reached':
          earned = profile.level >= req.value;
          break;
        case 'streak_days':
          earned = profile.streak >= req.value;
          break;
      }

      if (earned) {
        await db.insert(userAchievements).values({
          userId,
          achievementId: achievement.id,
          progress: req.value
        });
        
        // Award achievement XP
        if (achievement.xpReward > 0) {
          await this.addXP(userId, achievement.xpReward);
        }
        
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  async initializeAchievements(): Promise<void> {
    const existing = await this.getAchievements();
    if (existing.length > 0) return;

    const defaultAchievements = [
      {
        name: "First Steps",
        description: "Analyze your first product",
        category: "research",
        icon: "🎯",
        xpReward: 50,
        rarity: "common",
        requirement: { type: "products_analyzed", value: 1 }
      },
      {
        name: "Market Explorer", 
        description: "Analyze 10 products",
        category: "research",
        icon: "🔍",
        xpReward: 100,
        rarity: "common",
        requirement: { type: "products_analyzed", value: 10 }
      },
      {
        name: "Data Scientist",
        description: "Upload 5 datasets",
        category: "analysis",
        icon: "📊",
        xpReward: 150,
        rarity: "rare",
        requirement: { type: "datasets_uploaded", value: 5 }
      },
      {
        name: "Research Master",
        description: "Complete 25 market research activities",
        category: "research",
        icon: "🏆",
        xpReward: 300,
        rarity: "epic",
        requirement: { type: "market_research", value: 25 }
      },
      {
        name: "XP Hunter",
        description: "Earn 1000 XP",
        category: "progression",
        icon: "⚡",
        xpReward: 200,
        rarity: "rare",
        requirement: { type: "xp_earned", value: 1000 }
      },
      {
        name: "Level 10 Elite",
        description: "Reach level 10",
        category: "progression",
        icon: "👑",
        xpReward: 500,
        rarity: "legendary",
        requirement: { type: "level_reached", value: 10 }
      }
    ];

    for (const achievement of defaultAchievements) {
      await db.insert(achievements).values(achievement);
    }
  }
}

export const storage = new DatabaseStorage();
