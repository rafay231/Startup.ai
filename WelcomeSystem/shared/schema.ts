import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  profilePicture: text("profile_picture"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  googleId: text("google_id"),
  linkedinId: text("linkedin_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  userAnalytics: jsonb("user_analytics"),
});

export const startups = pgTable("startups", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  industry: text("industry").notNull(),
  stage: text("stage").notNull(),
  progress: integer("progress").default(0).notNull(),
  logo: text("logo"),
  tagline: text("tagline"),
  brandColors: jsonb("brand_colors"),
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
  feasibilityScore: integer("feasibility_score"),
  similarStartups: jsonb("similar_startups"),
  category: text("category"),
  validationNotes: text("validation_notes"),
});

export const targetAudiences = pgTable("target_audiences", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  demographics: jsonb("demographics").notNull(),
  psychographics: jsonb("psychographics").notNull(),
  buyingBehavior: jsonb("buying_behavior").notNull(),
  personas: jsonb("personas"),
  marketingChannels: jsonb("marketing_channels"),
  summary: text("summary"),
  geographicFocus: jsonb("geographic_focus"),
  ageRanges: jsonb("age_ranges"),
  genderDistribution: jsonb("gender_distribution"),
  interestsAndHobbies: jsonb("interests_and_hobbies"),
});

export const businessModels = pgTable("business_models", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  modelType: text("model_type").notNull(),
  keyResources: jsonb("key_resources"),
  operationalPlan: jsonb("operational_plan"),
  employeeCount: integer("employee_count"),
  infrastructureCost: jsonb("infrastructure_cost"),
  keyPartners: jsonb("key_partners"),
  keyActivities: jsonb("key_activities"),
  valuePropositions: jsonb("value_propositions"),
  customerRelationships: jsonb("customer_relationships"),
  channels: jsonb("channels"),
  costStructure: jsonb("cost_structure"),
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
  top5Competitors: jsonb("top_5_competitors"),
  strengthsWeaknesses: jsonb("strengths_weaknesses"),
  marketTrends: jsonb("market_trends"),
  marketGaps: jsonb("market_gaps"),
  competitiveAdvantage: text("competitive_advantage"),
});

export const revenueModels = pgTable("revenue_models", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  revenueStreams: jsonb("revenue_streams"),
  pricingStrategy: text("pricing_strategy"),
  financialProjections: jsonb("financial_projections"),
  oneYearProjection: jsonb("one_year_projection"),
  threeYearProjection: jsonb("three_year_projection"),
  fiveYearProjection: jsonb("five_year_projection"),
  costAnalysis: jsonb("cost_analysis"),
  developmentCosts: jsonb("development_costs"),
  marketingCosts: jsonb("marketing_costs"),
  salaryCosts: jsonb("salary_costs"),
  breakEvenAnalysis: jsonb("break_even_analysis"),
});

export const mvps = pgTable("mvps", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  features: jsonb("features"),
  timeline: jsonb("timeline"),
  resources: jsonb("resources"),
  success_criteria: jsonb("success_criteria"),
  techStack: jsonb("tech_stack"),
  designSystem: jsonb("design_system"),
  developmentRoadmap: jsonb("development_roadmap"),
  testingStrategy: jsonb("testing_strategy"),
  launchStrategy: jsonb("launch_strategy"),
  feedbackMechanisms: jsonb("feedback_mechanisms"),
});

export const roadmaps = pgTable("roadmaps", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  timeline: jsonb("timeline"),
  milestones: jsonb("milestones"),
  launchSteps: jsonb("launch_steps"),
  keyDeliverables: jsonb("key_deliverables"),
  riskFactors: jsonb("risk_factors"),
  criticalPath: jsonb("critical_path"),
});

export const fundingStrategies = pgTable("funding_strategies", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  recommendedApproach: text("recommended_approach"),
  bootstrapStrategy: jsonb("bootstrap_strategy"),
  ventureFundingStrategy: jsonb("venture_funding_strategy"),
  relevantInvestors: jsonb("relevant_investors"),
  fundingRoadmap: jsonb("funding_roadmap"),
  pitchDeckOutline: jsonb("pitch_deck_outline"),
  valuationEstimate: jsonb("valuation_estimate"),
  equityAllocation: jsonb("equity_allocation"),
});

export const scalabilityPlans = pgTable("scalability_plans", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  growthStrategy: jsonb("growth_strategy"),
  infrastructureScaling: jsonb("infrastructure_scaling"),
  teamExpansion: jsonb("team_expansion"),
  marketExpansion: jsonb("market_expansion"),
  keyMetrics: jsonb("key_metrics"),
  scalingChallenges: jsonb("scaling_challenges"),
});

export const launchToolkits = pgTable("launch_toolkits", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  goToMarketPlan: jsonb("go_to_market_plan"),
  launchChecklist: jsonb("launch_checklist"),
  betaTestingPlan: jsonb("beta_testing_plan"),
  earlyAdopterStrategy: jsonb("early_adopter_strategy"),
  prLaunchStrategy: jsonb("pr_launch_strategy"),
  launchTimeline: jsonb("launch_timeline"),
  successMetrics: jsonb("success_metrics"),
});

export const legalPacks = pgTable("legal_packs", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  termsAndConditions: text("terms_and_conditions"),
  privacyPolicy: text("privacy_policy"),
  ipProtectionStrategy: jsonb("ip_protection_strategy"),
  legalStructure: text("legal_structure"),
  complianceChecklist: jsonb("compliance_checklist"),
});

export const marketingPlans = pgTable("marketing_plans", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  seoStrategy: jsonb("seo_strategy"),
  paidAdsStrategy: jsonb("paid_ads_strategy"),
  socialMediaStrategy: jsonb("social_media_strategy"),
  contentPlan: jsonb("content_plan"),
  marketingBudget: jsonb("marketing_budget"),
  conversionStrategy: jsonb("conversion_strategy"),
  customerAcquisitionCost: jsonb("customer_acquisition_cost"),
  brandingGuidelines: jsonb("branding_guidelines"),
});

export const brandingKits = pgTable("branding_kits", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  logoOptions: jsonb("logo_options"),
  nameIdeas: jsonb("name_ideas"),
  taglineIdeas: jsonb("tagline_ideas"),
  colorPalettes: jsonb("color_palettes"),
  typographyChoices: jsonb("typography_choices"),
  brandVoice: jsonb("brand_voice"),
  brandValues: jsonb("brand_values"),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  startupId: integer("startup_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("medium"),
  assignee: text("assignee"),
  category: text("category"),
  completedAt: timestamp("completed_at"),
  reminderSet: boolean("reminder_set").default(false),
  attachments: jsonb("attachments"),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  format: text("format").notNull(),
  industry: text("industry"),
  tags: jsonb("tags"),
  author: text("author"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  featured: boolean("featured").default(false),
});

export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  likes: integer("likes").default(0),
  views: integer("views").default(0),
});

export const forumComments = pgTable("forum_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  likes: integer("likes").default(0),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  relatedEntityId: integer("related_entity_id"),
  relatedEntityType: text("related_entity_type"),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  profilePicture: true,
  googleId: true,
  linkedinId: true,
});

export const insertStartupSchema = createInsertSchema(startups).pick({
  userId: true,
  name: true,
  description: true,
  industry: true,
  stage: true,
  logo: true,
  tagline: true,
  brandColors: true,
});

export const insertStartupIdeaSchema = createInsertSchema(startupIdeas).pick({
  startupId: true,
  problemStatement: true,
  solution: true,
  uniqueValueProposition: true,
  targetIndustry: true,
  targetMarketSize: true,
  challengesAndOpportunities: true,
  category: true,
  feasibilityScore: true,
  similarStartups: true,
});

export const insertTargetAudienceSchema = createInsertSchema(targetAudiences).pick({
  startupId: true,
  demographics: true,
  psychographics: true,
  buyingBehavior: true,
  personas: true,
  marketingChannels: true,
  summary: true,
  geographicFocus: true,
  ageRanges: true,
  genderDistribution: true,
  interestsAndHobbies: true,
});

export const insertBusinessModelSchema = createInsertSchema(businessModels).pick({
  startupId: true,
  modelType: true,
  keyResources: true,
  operationalPlan: true,
  employeeCount: true,
  infrastructureCost: true,
  keyPartners: true,
  keyActivities: true,
  valuePropositions: true,
  customerRelationships: true,
  channels: true,
  costStructure: true,
});

export const insertCompetitorSchema = createInsertSchema(competitors).pick({
  startupId: true,
  competitorData: true,
  swotAnalysis: true,
  marketPositioning: true,
  top5Competitors: true,
  strengthsWeaknesses: true,
  marketTrends: true,
  marketGaps: true,
  competitiveAdvantage: true,
});

export const insertRevenueModelSchema = createInsertSchema(revenueModels).pick({
  startupId: true,
  revenueStreams: true,
  pricingStrategy: true,
  financialProjections: true,
  oneYearProjection: true,
  threeYearProjection: true,
  fiveYearProjection: true,
  costAnalysis: true,
  developmentCosts: true,
  marketingCosts: true,
  salaryCosts: true,
  breakEvenAnalysis: true,
});

export const insertMvpSchema = createInsertSchema(mvps).pick({
  startupId: true,
  features: true,
  timeline: true,
  resources: true,
  success_criteria: true,
  techStack: true,
  designSystem: true,
  developmentRoadmap: true,
  testingStrategy: true,
  launchStrategy: true,
  feedbackMechanisms: true,
});

export const insertRoadmapSchema = createInsertSchema(roadmaps).pick({
  startupId: true,
  timeline: true,
  milestones: true,
  launchSteps: true,
  keyDeliverables: true,
  riskFactors: true,
  criticalPath: true,
});

export const insertFundingStrategySchema = createInsertSchema(fundingStrategies).pick({
  startupId: true,
  recommendedApproach: true,
  bootstrapStrategy: true,
  ventureFundingStrategy: true,
  relevantInvestors: true,
  fundingRoadmap: true,
  pitchDeckOutline: true,
  valuationEstimate: true,
  equityAllocation: true,
});

export const insertScalabilityPlanSchema = createInsertSchema(scalabilityPlans).pick({
  startupId: true,
  growthStrategy: true,
  infrastructureScaling: true,
  teamExpansion: true,
  marketExpansion: true,
  keyMetrics: true,
  scalingChallenges: true,
});

export const insertLaunchToolkitSchema = createInsertSchema(launchToolkits).pick({
  startupId: true,
  goToMarketPlan: true,
  launchChecklist: true,
  betaTestingPlan: true,
  earlyAdopterStrategy: true,
  prLaunchStrategy: true,
  launchTimeline: true,
  successMetrics: true,
});

export const insertLegalPackSchema = createInsertSchema(legalPacks).pick({
  startupId: true,
  termsAndConditions: true,
  privacyPolicy: true,
  ipProtectionStrategy: true,
  legalStructure: true,
  complianceChecklist: true,
});

export const insertMarketingPlanSchema = createInsertSchema(marketingPlans).pick({
  startupId: true,
  seoStrategy: true,
  paidAdsStrategy: true,
  socialMediaStrategy: true,
  contentPlan: true,
  marketingBudget: true,
  conversionStrategy: true,
  customerAcquisitionCost: true,
  brandingGuidelines: true,
});

export const insertBrandingKitSchema = createInsertSchema(brandingKits).pick({
  startupId: true,
  logoOptions: true,
  nameIdeas: true,
  taglineIdeas: true,
  colorPalettes: true,
  typographyChoices: true,
  brandVoice: true,
  brandValues: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  startupId: true,
  title: true,
  description: true,
  dueDate: true,
  status: true,
  priority: true,
  assignee: true,
  category: true,
  reminderSet: true,
  attachments: true,
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  category: true,
  title: true,
  description: true,
  content: true,
  format: true,
  industry: true,
  tags: true,
  author: true,
  featured: true,
});

export const insertForumPostSchema = createInsertSchema(forumPosts).pick({
  userId: true,
  title: true,
  content: true,
  category: true,
  tags: true,
});

export const insertForumCommentSchema = createInsertSchema(forumComments).pick({
  postId: true,
  userId: true,
  content: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  type: true,
  message: true,
  relatedEntityId: true,
  relatedEntityType: true,
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

export type InsertRoadmap = z.infer<typeof insertRoadmapSchema>;
export type Roadmap = typeof roadmaps.$inferSelect;

export type InsertFundingStrategy = z.infer<typeof insertFundingStrategySchema>;
export type FundingStrategy = typeof fundingStrategies.$inferSelect;

export type InsertScalabilityPlan = z.infer<typeof insertScalabilityPlanSchema>;
export type ScalabilityPlan = typeof scalabilityPlans.$inferSelect;

export type InsertLaunchToolkit = z.infer<typeof insertLaunchToolkitSchema>;
export type LaunchToolkit = typeof launchToolkits.$inferSelect;

export type InsertLegalPack = z.infer<typeof insertLegalPackSchema>;
export type LegalPack = typeof legalPacks.$inferSelect;

export type InsertMarketingPlan = z.infer<typeof insertMarketingPlanSchema>;
export type MarketingPlan = typeof marketingPlans.$inferSelect;

export type InsertBrandingKit = z.infer<typeof insertBrandingKitSchema>;
export type BrandingKit = typeof brandingKits.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumPost = typeof forumPosts.$inferSelect;

export type InsertForumComment = z.infer<typeof insertForumCommentSchema>;
export type ForumComment = typeof forumComments.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
