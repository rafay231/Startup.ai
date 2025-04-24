import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const startups = pgTable("startups", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  industry: text("industry").notNull(),
  stage: text("stage").notNull(),
  progress: integer("progress").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const startupIdeas = pgTable("startup_ideas", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  problemStatement: text("problem_statement").notNull(),
  solution: text("solution").notNull(),
  uniqueValueProposition: text("unique_value_proposition").notNull(),
  targetIndustry: text("target_industry").notNull(),
  targetMarketSize: text("target_market_size"),
  challengesAndOpportunities: text("challenges_and_opportunities"),
});

export const targetAudiences = pgTable("target_audiences", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  demographics: jsonb("demographics").notNull(),
  psychographics: jsonb("psychographics").notNull(),
  buyingBehavior: jsonb("buying_behavior").notNull(),
  summary: text("summary"),
});

export const businessModels = pgTable("business_models", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  modelType: text("model_type").notNull(),
  keyResources: jsonb("key_resources"),
  keyActivities: jsonb("key_activities"),
  valueProposition: text("value_proposition"),
  customerRelationships: text("customer_relationships"),
  channels: jsonb("channels"),
  costStructure: jsonb("cost_structure"),
});

export const competitors = pgTable("competitors", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  competitorData: jsonb("competitor_data"),
  swotAnalysis: jsonb("swot_analysis"),
  marketPositioning: text("market_positioning"),
});

export const revenueModels = pgTable("revenue_models", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  revenueStreams: jsonb("revenue_streams"),
  pricingStrategy: text("pricing_strategy"),
  financialProjections: jsonb("financial_projections"),
});

export const mvps = pgTable("mvps", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  features: jsonb("features"),
  timeline: jsonb("timeline"),
  resources: jsonb("resources"),
  success_criteria: jsonb("success_criteria"),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("medium"),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  format: text("format").notNull(),
  industry: text("industry"),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
});

export const insertStartupSchema = createInsertSchema(startups).pick({
  userId: true,
  name: true,
  description: true,
  industry: true,
  stage: true,
});

export const insertStartupIdeaSchema = createInsertSchema(startupIdeas).pick({
  startupId: true,
  problemStatement: true,
  solution: true,
  uniqueValueProposition: true,
  targetIndustry: true,
  targetMarketSize: true,
  challengesAndOpportunities: true,
});

export const insertTargetAudienceSchema = createInsertSchema(targetAudiences).pick({
  startupId: true,
  demographics: true,
  psychographics: true,
  buyingBehavior: true,
  summary: true,
});

export const insertBusinessModelSchema = createInsertSchema(businessModels).pick({
  startupId: true,
  modelType: true,
  keyResources: true,
  keyActivities: true,
  valueProposition: true,
  customerRelationships: true,
  channels: true,
  costStructure: true,
});

export const insertCompetitorSchema = createInsertSchema(competitors).pick({
  startupId: true,
  competitorData: true,
  swotAnalysis: true,
  marketPositioning: true,
});

export const insertRevenueModelSchema = createInsertSchema(revenueModels).pick({
  startupId: true,
  revenueStreams: true,
  pricingStrategy: true,
  financialProjections: true,
});

export const insertMvpSchema = createInsertSchema(mvps).pick({
  startupId: true,
  features: true,
  timeline: true,
  resources: true,
  success_criteria: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  startupId: true,
  title: true,
  description: true,
  dueDate: true,
  status: true,
  priority: true,
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  category: true,
  title: true,
  description: true,
  content: true,
  format: true,
  industry: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStartup = z.infer<typeof insertStartupSchema>;
export type Startup = typeof startups.$inferSelect;

export type InsertStartupIdea = z.infer<typeof insertStartupIdeaSchema>;
export type StartupIdea = typeof startupIdeas.$inferSelect;

export type InsertTargetAudience = z.infer<typeof insertTargetAudienceSchema>;
export type TargetAudience = typeof targetAudiences.$inferSelect;

export type InsertBusinessModel = z.infer<typeof insertBusinessModelSchema>;
export type BusinessModel = typeof businessModels.$inferSelect;

export type InsertCompetitor = z.infer<typeof insertCompetitorSchema>;
export type Competitor = typeof competitors.$inferSelect;

export type InsertRevenueModel = z.infer<typeof insertRevenueModelSchema>;
export type RevenueModel = typeof revenueModels.$inferSelect;

export type InsertMvp = z.infer<typeof insertMvpSchema>;
export type Mvp = typeof mvps.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;
