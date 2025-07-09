import { pgTable, text, serial, timestamp, varchar, json, decimal, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  serviceType: varchar("service_type", { length: 100 }).notNull(),
  message: text("message"),
  status: varchar("status", { length: 50 }).notNull().default("new"),
  source: varchar("source", { length: 100 }).default("website"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  deadline: timestamp("deadline"),
  notes: text("notes"),
  priority: varchar("priority", { length: 20 }).default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("planning"),
  budget: decimal("budget", { precision: 10, scale: 2 }),
  amountReceived: decimal("amount_received", { precision: 10, scale: 2 }).default("0"),
  amountPending: decimal("amount_pending", { precision: 10, scale: 2 }).default("0"),
  startDate: varchar("start_date", { length: 50 }),
  endDate: varchar("end_date", { length: 50 }),
  progress: integer("progress").default(0),
  source: varchar("source", { length: 100 }).default("direto"), // 99freelas, website, indicacao, direto, etc
  sourceUrl: varchar("source_url", { length: 500 }), // URL do projeto na plataforma
  projectType: varchar("project_type", { length: 100 }).default("website"), // website, app-flutter, sistema, etc
  projectUrl: varchar("project_url", { length: 500 }), // URL do projeto finalizado
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectStages = pgTable("project_stages", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  order: integer("order").notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  estimatedHours: integer("estimated_hours"),
  actualHours: integer("actual_hours"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leadNotes = pgTable("lead_notes", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id, { onDelete: "cascade" }).notNull(),
  note: text("note").notNull(),
  type: varchar("type", { length: 50 }).default("general"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD format
  time: varchar("time", { length: 5 }).notNull(), // HH:MM format
  notes: text("notes"),
  status: varchar("status", { length: 50 }).notNull().default("scheduled"),
  isViewed: boolean("is_viewed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Nova tabela para rastrear custos de plataformas
export const platformCosts = pgTable("platform_costs", {
  id: serial("id").primaryKey(),
  platform: varchar("platform", { length: 100 }).notNull(), // 99freelas, workana, etc
  monthYear: varchar("month_year", { length: 7 }).notNull(), // 2024-09, 2024-10, etc
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela para análises de complexidade de projetos com IA
export const projectAnalyses = pgTable("project_analyses", {
  id: serial("id").primaryKey(),
  projectName: varchar("project_name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  projectType: varchar("project_type", { length: 50 }).notNull(), // web, mobile, desktop, api, etc.
  targetAudience: varchar("target_audience", { length: 200 }),
  complexityScore: integer("complexity_score").notNull(), // 1-10 scale
  effortEstimate: varchar("effort_estimate", { length: 50 }).notNull(), // e.g., "2-4 weeks"
  budgetRange: varchar("budget_range", { length: 50 }).notNull(), // e.g., "R$ 2.000 - R$ 5.000"
  keyFeatures: text("key_features").array(), // JSON array of features
  technicalChallenges: text("technical_challenges").array(), // JSON array of challenges
  recommendations: text("recommendations").array(), // JSON array of recommendations
  riskFactors: text("risk_factors").array(), // JSON array of risks
  aiAnalysis: text("ai_analysis").notNull(), // Full AI analysis text
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leadsRelations = relations(leads, ({ many }) => ({
  appointments: many(appointments),
  projects: many(projects),
  notes: many(leadNotes),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  lead: one(leads, {
    fields: [projects.leadId],
    references: [leads.id],
  }),
  stages: many(projectStages),
}));

export const projectStagesRelations = relations(projectStages, ({ one }) => ({
  project: one(projects, {
    fields: [projectStages.projectId],
    references: [projects.id],
  }),
}));

export const leadNotesRelations = relations(leadNotes, ({ one }) => ({
  lead: one(leads, {
    fields: [leadNotes.leadId],
    references: [leads.id],
  }),
}));

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  isViewed: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectStageSchema = createInsertSchema(projectStages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadNoteSchema = createInsertSchema(leadNotes).omit({
  id: true,
  createdAt: true,
});

export const insertPlatformCostSchema = createInsertSchema(platformCosts).omit({
  id: true,
  createdAt: true,
});

export const insertProjectAnalysisSchema = createInsertSchema(projectAnalyses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProjectStage = z.infer<typeof insertProjectStageSchema>;
export type ProjectStage = typeof projectStages.$inferSelect;
export type InsertLeadNote = z.infer<typeof insertLeadNoteSchema>;
export type LeadNote = typeof leadNotes.$inferSelect;
export type InsertPlatformCost = z.infer<typeof insertPlatformCostSchema>;
export type PlatformCost = typeof platformCosts.$inferSelect;
export type InsertProjectAnalysis = z.infer<typeof insertProjectAnalysisSchema>;
export type ProjectAnalysis = typeof projectAnalyses.$inferSelect;

// Gamified Achievement System Tables
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 100 }).notNull().unique(), // Session/device identifier
  username: varchar("username", { length: 50 }),
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  totalProductsAnalyzed: integer("total_products_analyzed").default(0),
  totalMarketResearch: integer("total_market_research").default(0),
  totalDatasetsUploaded: integer("total_datasets_uploaded").default(0),
  totalInsightsGenerated: integer("total_insights_generated").default(0),
  streak: integer("streak").default(0), // Days of consecutive activity
  lastActiveDate: varchar("last_active_date", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).notNull(), // research, analysis, explorer, etc
  icon: varchar("icon", { length: 50 }).notNull(), // emoji or icon name
  xpReward: integer("xp_reward").default(0),
  rarity: varchar("rarity", { length: 20 }).default("common"), // common, rare, epic, legendary
  requirement: json("requirement").notNull(), // {"type": "products_analyzed", "value": 10}
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 100 }).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  progress: integer("progress").default(0), // For tracking partial progress
});

export const marketResearchActivities = pgTable("market_research_activities", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 100 }).notNull(),
  activityType: varchar("activity_type", { length: 50 }).notNull(), // product_extraction, price_analysis, data_upload, etc
  productUrl: text("product_url"),
  productName: text("product_name"),
  platform: varchar("platform", { length: 50 }), // amazon, mercadolivre, etc
  xpEarned: integer("xp_earned").default(0),
  metadata: json("metadata"), // Store additional activity details
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  earnedAt: true,
});

export const insertMarketResearchActivitySchema = createInsertSchema(marketResearchActivities).omit({
  id: true,
  createdAt: true,
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertMarketResearchActivity = z.infer<typeof insertMarketResearchActivitySchema>;
export type MarketResearchActivity = typeof marketResearchActivities.$inferSelect;
