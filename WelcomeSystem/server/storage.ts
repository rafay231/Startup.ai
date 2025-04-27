import { users, startups, startupIdeas, targetAudiences, businessModels, competitors, revenueModels, mvps, roadmaps, fundingStrategies, scalabilityPlans, launchToolkits, legalPacks, marketingPlans, brandingKits, tasks, resources, forumPosts, forumComments, notifications } from "@shared/schema";
import type { 
  User, InsertUser, 
  Startup, InsertStartup, 
  StartupIdea, InsertStartupIdea, 
  TargetAudience, InsertTargetAudience, 
  BusinessModel, InsertBusinessModel, 
  Competitor, InsertCompetitor, 
  RevenueModel, InsertRevenueModel, 
  Mvp, InsertMvp, 
  Roadmap, InsertRoadmap,
  FundingStrategy, InsertFundingStrategy,
  ScalabilityPlan, InsertScalabilityPlan,
  LaunchToolkit, InsertLaunchToolkit,
  LegalPack, InsertLegalPack,
  MarketingPlan, InsertMarketingPlan,
  BrandingKit, InsertBrandingKit,
  Task, InsertTask, 
  Resource, InsertResource,
  ForumPost, InsertForumPost,
  ForumComment, InsertForumComment,
  Notification, InsertNotification
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByLinkedinId(linkedinId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  updateUserAnalytics(id: number, analytics: any): Promise<User | undefined>;
  
  // Startup methods
  getStartup(id: number): Promise<Startup | undefined>;
  getStartupsByUserId(userId: number): Promise<Startup[]>;
  createStartup(startup: InsertStartup): Promise<Startup>;
  updateStartup(id: number, startup: Partial<Startup>): Promise<Startup | undefined>;
  deleteStartup(id: number): Promise<boolean>;
  
  // Startup Idea methods
  getStartupIdea(startupId: number): Promise<StartupIdea | undefined>;
  createStartupIdea(idea: InsertStartupIdea): Promise<StartupIdea>;
  updateStartupIdea(startupId: number, idea: Partial<StartupIdea>): Promise<StartupIdea | undefined>;
  
  // Target Audience methods
  getTargetAudience(startupId: number): Promise<TargetAudience | undefined>;
  createTargetAudience(audience: InsertTargetAudience): Promise<TargetAudience>;
  updateTargetAudience(startupId: number, audience: Partial<TargetAudience>): Promise<TargetAudience | undefined>;
  
  // Business Model methods
  getBusinessModel(startupId: number): Promise<BusinessModel | undefined>;
  createBusinessModel(model: InsertBusinessModel): Promise<BusinessModel>;
  updateBusinessModel(startupId: number, model: Partial<BusinessModel>): Promise<BusinessModel | undefined>;
  
  // Competitor methods
  getCompetitor(startupId: number): Promise<Competitor | undefined>;
  createCompetitor(competitor: InsertCompetitor): Promise<Competitor>;
  updateCompetitor(startupId: number, competitor: Partial<Competitor>): Promise<Competitor | undefined>;
  
  // Revenue Model methods
  getRevenueModel(startupId: number): Promise<RevenueModel | undefined>;
  createRevenueModel(model: InsertRevenueModel): Promise<RevenueModel>;
  updateRevenueModel(startupId: number, model: Partial<RevenueModel>): Promise<RevenueModel | undefined>;
  
  // MVP methods
  getMvp(startupId: number): Promise<Mvp | undefined>;
  createMvp(mvp: InsertMvp): Promise<Mvp>;
  updateMvp(startupId: number, mvp: Partial<Mvp>): Promise<Mvp | undefined>;
  
  // Roadmap methods
  getRoadmap(startupId: number): Promise<Roadmap | undefined>;
  createRoadmap(roadmap: InsertRoadmap): Promise<Roadmap>;
  updateRoadmap(startupId: number, roadmap: Partial<Roadmap>): Promise<Roadmap | undefined>;
  
  // Funding Strategy methods
  getFundingStrategy(startupId: number): Promise<FundingStrategy | undefined>;
  createFundingStrategy(strategy: InsertFundingStrategy): Promise<FundingStrategy>;
  updateFundingStrategy(startupId: number, strategy: Partial<FundingStrategy>): Promise<FundingStrategy | undefined>;
  
  // Scalability Plan methods
  getScalabilityPlan(startupId: number): Promise<ScalabilityPlan | undefined>;
  createScalabilityPlan(plan: InsertScalabilityPlan): Promise<ScalabilityPlan>;
  updateScalabilityPlan(startupId: number, plan: Partial<ScalabilityPlan>): Promise<ScalabilityPlan | undefined>;
  
  // Launch Toolkit methods
  getLaunchToolkit(startupId: number): Promise<LaunchToolkit | undefined>;
  createLaunchToolkit(toolkit: InsertLaunchToolkit): Promise<LaunchToolkit>;
  updateLaunchToolkit(startupId: number, toolkit: Partial<LaunchToolkit>): Promise<LaunchToolkit | undefined>;
  
  // Legal Pack methods
  getLegalPack(startupId: number): Promise<LegalPack | undefined>;
  createLegalPack(pack: InsertLegalPack): Promise<LegalPack>;
  updateLegalPack(startupId: number, pack: Partial<LegalPack>): Promise<LegalPack | undefined>;
  
  // Marketing Plan methods
  getMarketingPlan(startupId: number): Promise<MarketingPlan | undefined>;
  createMarketingPlan(plan: InsertMarketingPlan): Promise<MarketingPlan>;
  updateMarketingPlan(startupId: number, plan: Partial<MarketingPlan>): Promise<MarketingPlan | undefined>;
  
  // Branding Kit methods
  getBrandingKit(startupId: number): Promise<BrandingKit | undefined>;
  createBrandingKit(kit: InsertBrandingKit): Promise<BrandingKit>;
  updateBrandingKit(startupId: number, kit: Partial<BrandingKit>): Promise<BrandingKit | undefined>;
  
  // Task methods
  getTasksByStartupId(startupId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Resource methods
  getResources(): Promise<Resource[]>;
  getResourcesByCategory(category: string): Promise<Resource[]>;
  getResourcesByIndustry(industry: string): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<Resource>): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;
  
  // Forum methods
  getForumPosts(): Promise<ForumPost[]>;
  getForumPostsByCategory(category: string): Promise<ForumPost[]>;
  getForumPostsByUser(userId: number): Promise<ForumPost[]>;
  getForumPost(id: number): Promise<ForumPost | undefined>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  updateForumPost(id: number, post: Partial<ForumPost>): Promise<ForumPost | undefined>;
  deleteForumPost(id: number): Promise<boolean>;
  
  // Forum Comment methods
  getForumComments(postId: number): Promise<ForumComment[]>;
  getForumComment(id: number): Promise<ForumComment | undefined>;
  createForumComment(comment: InsertForumComment): Promise<ForumComment>;
  updateForumComment(id: number, comment: Partial<ForumComment>): Promise<ForumComment | undefined>;
  deleteForumComment(id: number): Promise<boolean>;
  
  // Notification methods
  getNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  deleteNotification(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private startups: Map<number, Startup>;
  private startupIdeas: Map<number, StartupIdea>;
  private targetAudiences: Map<number, TargetAudience>;
  private businessModels: Map<number, BusinessModel>;
  private competitors: Map<number, Competitor>;
  private revenueModels: Map<number, RevenueModel>;
  private mvps: Map<number, Mvp>;
  private roadmaps: Map<number, Roadmap>;
  private fundingStrategies: Map<number, FundingStrategy>;
  private scalabilityPlans: Map<number, ScalabilityPlan>;
  private launchToolkits: Map<number, LaunchToolkit>;
  private legalPacks: Map<number, LegalPack>;
  private marketingPlans: Map<number, MarketingPlan>;
  private brandingKits: Map<number, BrandingKit>;
  private tasks: Map<number, Task>;
  private resources: Map<number, Resource>;
  private forumPosts: Map<number, ForumPost>;
  private forumComments: Map<number, ForumComment>;
  private notifications: Map<number, Notification>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private startupIdCounter: number;
  private startupIdeaIdCounter: number;
  private targetAudienceIdCounter: number;
  private businessModelIdCounter: number;
  private competitorIdCounter: number;
  private revenueModelIdCounter: number;
  private mvpIdCounter: number;
  private roadmapIdCounter: number;
  private fundingStrategyIdCounter: number;
  private scalabilityPlanIdCounter: number;
  private launchToolkitIdCounter: number;
  private legalPackIdCounter: number;
  private marketingPlanIdCounter: number;
  private brandingKitIdCounter: number;
  private taskIdCounter: number;
  private resourceIdCounter: number;
  private forumPostIdCounter: number;
  private forumCommentIdCounter: number;
  private notificationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.startups = new Map();
    this.startupIdeas = new Map();
    this.targetAudiences = new Map();
    this.businessModels = new Map();
    this.competitors = new Map();
    this.revenueModels = new Map();
    this.mvps = new Map();
    this.roadmaps = new Map();
    this.fundingStrategies = new Map();
    this.scalabilityPlans = new Map();
    this.launchToolkits = new Map();
    this.legalPacks = new Map();
    this.marketingPlans = new Map();
    this.brandingKits = new Map();
    this.tasks = new Map();
    this.resources = new Map();
    this.forumPosts = new Map();
    this.forumComments = new Map();
    this.notifications = new Map();
    
    this.userIdCounter = 1;
    this.startupIdCounter = 1;
    this.startupIdeaIdCounter = 1;
    this.targetAudienceIdCounter = 1;
    this.businessModelIdCounter = 1;
    this.competitorIdCounter = 1;
    this.revenueModelIdCounter = 1;
    this.mvpIdCounter = 1;
    this.roadmapIdCounter = 1;
    this.fundingStrategyIdCounter = 1;
    this.scalabilityPlanIdCounter = 1;
    this.launchToolkitIdCounter = 1;
    this.legalPackIdCounter = 1;
    this.marketingPlanIdCounter = 1;
    this.brandingKitIdCounter = 1;
    this.taskIdCounter = 1;
    this.resourceIdCounter = 1;
    this.forumPostIdCounter = 1;
    this.forumCommentIdCounter = 1;
    this.notificationIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Initialize sample resources
    this.initializeResources();
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId,
    );
  }
  
  async getUserByLinkedinId(linkedinId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.linkedinId === linkedinId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now,
      updatedAt: now,
      twoFactorEnabled: false
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...userData,
      updatedAt: new Date(),
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserAnalytics(id: number, analytics: any): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      userAnalytics: analytics,
      updatedAt: new Date(),
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Startup methods
  async getStartup(id: number): Promise<Startup | undefined> {
    return this.startups.get(id);
  }
  
  async getStartupsByUserId(userId: number): Promise<Startup[]> {
    return Array.from(this.startups.values()).filter(
      (startup) => startup.userId === userId,
    );
  }
  
  async createStartup(startup: InsertStartup): Promise<Startup> {
    const id = this.startupIdCounter++;
    const now = new Date();
    const newStartup: Startup = { 
      ...startup, 
      id, 
      progress: 0,
      createdAt: now,
      updatedAt: now
    };
    this.startups.set(id, newStartup);
    return newStartup;
  }
  
  async updateStartup(id: number, startup: Partial<Startup>): Promise<Startup | undefined> {
    const existingStartup = this.startups.get(id);
    if (!existingStartup) return undefined;
    
    const updatedStartup = { 
      ...existingStartup, 
      ...startup,
      updatedAt: new Date()
    };
    this.startups.set(id, updatedStartup);
    return updatedStartup;
  }
  
  async deleteStartup(id: number): Promise<boolean> {
    return this.startups.delete(id);
  }
  
  // Startup Idea methods
  async getStartupIdea(startupId: number): Promise<StartupIdea | undefined> {
    return Array.from(this.startupIdeas.values()).find(
      (idea) => idea.startupId === startupId,
    );
  }
  
  async createStartupIdea(idea: InsertStartupIdea): Promise<StartupIdea> {
    const id = this.startupIdeaIdCounter++;
    const newIdea: StartupIdea = { ...idea, id };
    this.startupIdeas.set(id, newIdea);
    
    // Update startup progress
    await this.updateStartupProgress(idea.startupId);
    
    return newIdea;
  }
  
  async updateStartupIdea(startupId: number, idea: Partial<StartupIdea>): Promise<StartupIdea | undefined> {
    const existingIdea = Array.from(this.startupIdeas.values()).find(
      (i) => i.startupId === startupId,
    );
    if (!existingIdea) return undefined;
    
    const updatedIdea = { ...existingIdea, ...idea };
    this.startupIdeas.set(existingIdea.id, updatedIdea);
    return updatedIdea;
  }
  
  // Target Audience methods
  async getTargetAudience(startupId: number): Promise<TargetAudience | undefined> {
    return Array.from(this.targetAudiences.values()).find(
      (audience) => audience.startupId === startupId,
    );
  }
  
  async createTargetAudience(audience: InsertTargetAudience): Promise<TargetAudience> {
    const id = this.targetAudienceIdCounter++;
    const newAudience: TargetAudience = { ...audience, id };
    this.targetAudiences.set(id, newAudience);
    
    // Update startup progress
    await this.updateStartupProgress(audience.startupId);
    
    return newAudience;
  }
  
  async updateTargetAudience(startupId: number, audience: Partial<TargetAudience>): Promise<TargetAudience | undefined> {
    const existingAudience = Array.from(this.targetAudiences.values()).find(
      (a) => a.startupId === startupId,
    );
    if (!existingAudience) return undefined;
    
    const updatedAudience = { ...existingAudience, ...audience };
    this.targetAudiences.set(existingAudience.id, updatedAudience);
    return updatedAudience;
  }
  
  // Business Model methods
  async getBusinessModel(startupId: number): Promise<BusinessModel | undefined> {
    return Array.from(this.businessModels.values()).find(
      (model) => model.startupId === startupId,
    );
  }
  
  async createBusinessModel(model: InsertBusinessModel): Promise<BusinessModel> {
    const id = this.businessModelIdCounter++;
    const newModel: BusinessModel = { ...model, id };
    this.businessModels.set(id, newModel);
    
    // Update startup progress
    await this.updateStartupProgress(model.startupId);
    
    return newModel;
  }
  
  async updateBusinessModel(startupId: number, model: Partial<BusinessModel>): Promise<BusinessModel | undefined> {
    const existingModel = Array.from(this.businessModels.values()).find(
      (m) => m.startupId === startupId,
    );
    if (!existingModel) return undefined;
    
    const updatedModel = { ...existingModel, ...model };
    this.businessModels.set(existingModel.id, updatedModel);
    return updatedModel;
  }
  
  // Competitor methods
  async getCompetitor(startupId: number): Promise<Competitor | undefined> {
    return Array.from(this.competitors.values()).find(
      (competitor) => competitor.startupId === startupId,
    );
  }
  
  async createCompetitor(competitor: InsertCompetitor): Promise<Competitor> {
    const id = this.competitorIdCounter++;
    const newCompetitor: Competitor = { ...competitor, id };
    this.competitors.set(id, newCompetitor);
    
    // Update startup progress
    await this.updateStartupProgress(competitor.startupId);
    
    return newCompetitor;
  }
  
  async updateCompetitor(startupId: number, competitor: Partial<Competitor>): Promise<Competitor | undefined> {
    const existingCompetitor = Array.from(this.competitors.values()).find(
      (c) => c.startupId === startupId,
    );
    if (!existingCompetitor) return undefined;
    
    const updatedCompetitor = { ...existingCompetitor, ...competitor };
    this.competitors.set(existingCompetitor.id, updatedCompetitor);
    return updatedCompetitor;
  }
  
  // Revenue Model methods
  async getRevenueModel(startupId: number): Promise<RevenueModel | undefined> {
    return Array.from(this.revenueModels.values()).find(
      (model) => model.startupId === startupId,
    );
  }
  
  async createRevenueModel(model: InsertRevenueModel): Promise<RevenueModel> {
    const id = this.revenueModelIdCounter++;
    const newModel: RevenueModel = { ...model, id };
    this.revenueModels.set(id, newModel);
    
    // Update startup progress
    await this.updateStartupProgress(model.startupId);
    
    return newModel;
  }
  
  async updateRevenueModel(startupId: number, model: Partial<RevenueModel>): Promise<RevenueModel | undefined> {
    const existingModel = Array.from(this.revenueModels.values()).find(
      (m) => m.startupId === startupId,
    );
    if (!existingModel) return undefined;
    
    const updatedModel = { ...existingModel, ...model };
    this.revenueModels.set(existingModel.id, updatedModel);
    return updatedModel;
  }
  
  // MVP methods
  async getMvp(startupId: number): Promise<Mvp | undefined> {
    return Array.from(this.mvps.values()).find(
      (mvp) => mvp.startupId === startupId,
    );
  }
  
  async createMvp(mvp: InsertMvp): Promise<Mvp> {
    const id = this.mvpIdCounter++;
    const newMvp: Mvp = { ...mvp, id };
    this.mvps.set(id, newMvp);
    
    // Update startup progress
    await this.updateStartupProgress(mvp.startupId);
    
    return newMvp;
  }
  
  async updateMvp(startupId: number, mvp: Partial<Mvp>): Promise<Mvp | undefined> {
    const existingMvp = Array.from(this.mvps.values()).find(
      (m) => m.startupId === startupId,
    );
    if (!existingMvp) return undefined;
    
    const updatedMvp = { ...existingMvp, ...mvp };
    this.mvps.set(existingMvp.id, updatedMvp);
    return updatedMvp;
  }
  
  // Roadmap methods
  async getRoadmap(startupId: number): Promise<Roadmap | undefined> {
    return Array.from(this.roadmaps.values()).find(
      (roadmap) => roadmap.startupId === startupId,
    );
  }
  
  async createRoadmap(roadmap: InsertRoadmap): Promise<Roadmap> {
    const id = this.roadmapIdCounter++;
    const newRoadmap: Roadmap = { ...roadmap, id };
    this.roadmaps.set(id, newRoadmap);
    
    // Update startup progress
    await this.updateStartupProgress(roadmap.startupId);
    
    return newRoadmap;
  }
  
  async updateRoadmap(startupId: number, roadmap: Partial<Roadmap>): Promise<Roadmap | undefined> {
    const existingRoadmap = Array.from(this.roadmaps.values()).find(
      (r) => r.startupId === startupId,
    );
    if (!existingRoadmap) return undefined;
    
    const updatedRoadmap = { ...existingRoadmap, ...roadmap };
    this.roadmaps.set(existingRoadmap.id, updatedRoadmap);
    return updatedRoadmap;
  }
  
  // Funding Strategy methods
  async getFundingStrategy(startupId: number): Promise<FundingStrategy | undefined> {
    return Array.from(this.fundingStrategies.values()).find(
      (strategy) => strategy.startupId === startupId,
    );
  }
  
  async createFundingStrategy(strategy: InsertFundingStrategy): Promise<FundingStrategy> {
    const id = this.fundingStrategyIdCounter++;
    const newStrategy: FundingStrategy = { ...strategy, id };
    this.fundingStrategies.set(id, newStrategy);
    
    // Update startup progress
    await this.updateStartupProgress(strategy.startupId);
    
    return newStrategy;
  }
  
  async updateFundingStrategy(startupId: number, strategy: Partial<FundingStrategy>): Promise<FundingStrategy | undefined> {
    const existingStrategy = Array.from(this.fundingStrategies.values()).find(
      (s) => s.startupId === startupId,
    );
    if (!existingStrategy) return undefined;
    
    const updatedStrategy = { ...existingStrategy, ...strategy };
    this.fundingStrategies.set(existingStrategy.id, updatedStrategy);
    return updatedStrategy;
  }
  
  // Scalability Plan methods
  async getScalabilityPlan(startupId: number): Promise<ScalabilityPlan | undefined> {
    return Array.from(this.scalabilityPlans.values()).find(
      (plan) => plan.startupId === startupId,
    );
  }
  
  async createScalabilityPlan(plan: InsertScalabilityPlan): Promise<ScalabilityPlan> {
    const id = this.scalabilityPlanIdCounter++;
    const newPlan: ScalabilityPlan = { ...plan, id };
    this.scalabilityPlans.set(id, newPlan);
    
    // Update startup progress
    await this.updateStartupProgress(plan.startupId);
    
    return newPlan;
  }
  
  async updateScalabilityPlan(startupId: number, plan: Partial<ScalabilityPlan>): Promise<ScalabilityPlan | undefined> {
    const existingPlan = Array.from(this.scalabilityPlans.values()).find(
      (p) => p.startupId === startupId,
    );
    if (!existingPlan) return undefined;
    
    const updatedPlan = { ...existingPlan, ...plan };
    this.scalabilityPlans.set(existingPlan.id, updatedPlan);
    return updatedPlan;
  }
  
  // Launch Toolkit methods
  async getLaunchToolkit(startupId: number): Promise<LaunchToolkit | undefined> {
    return Array.from(this.launchToolkits.values()).find(
      (toolkit) => toolkit.startupId === startupId,
    );
  }
  
  async createLaunchToolkit(toolkit: InsertLaunchToolkit): Promise<LaunchToolkit> {
    const id = this.launchToolkitIdCounter++;
    const newToolkit: LaunchToolkit = { ...toolkit, id };
    this.launchToolkits.set(id, newToolkit);
    
    // Update startup progress
    await this.updateStartupProgress(toolkit.startupId);
    
    return newToolkit;
  }
  
  async updateLaunchToolkit(startupId: number, toolkit: Partial<LaunchToolkit>): Promise<LaunchToolkit | undefined> {
    const existingToolkit = Array.from(this.launchToolkits.values()).find(
      (t) => t.startupId === startupId,
    );
    if (!existingToolkit) return undefined;
    
    const updatedToolkit = { ...existingToolkit, ...toolkit };
    this.launchToolkits.set(existingToolkit.id, updatedToolkit);
    return updatedToolkit;
  }
  
  // Legal Pack methods
  async getLegalPack(startupId: number): Promise<LegalPack | undefined> {
    return Array.from(this.legalPacks.values()).find(
      (pack) => pack.startupId === startupId,
    );
  }
  
  async createLegalPack(pack: InsertLegalPack): Promise<LegalPack> {
    const id = this.legalPackIdCounter++;
    const newPack: LegalPack = { ...pack, id };
    this.legalPacks.set(id, newPack);
    
    // Update startup progress
    await this.updateStartupProgress(pack.startupId);
    
    return newPack;
  }
  
  async updateLegalPack(startupId: number, pack: Partial<LegalPack>): Promise<LegalPack | undefined> {
    const existingPack = Array.from(this.legalPacks.values()).find(
      (p) => p.startupId === startupId,
    );
    if (!existingPack) return undefined;
    
    const updatedPack = { ...existingPack, ...pack };
    this.legalPacks.set(existingPack.id, updatedPack);
    return updatedPack;
  }
  
  // Marketing Plan methods
  async getMarketingPlan(startupId: number): Promise<MarketingPlan | undefined> {
    return Array.from(this.marketingPlans.values()).find(
      (plan) => plan.startupId === startupId,
    );
  }
  
  async createMarketingPlan(plan: InsertMarketingPlan): Promise<MarketingPlan> {
    const id = this.marketingPlanIdCounter++;
    const newPlan: MarketingPlan = { ...plan, id };
    this.marketingPlans.set(id, newPlan);
    
    // Update startup progress
    await this.updateStartupProgress(plan.startupId);
    
    return newPlan;
  }
  
  async updateMarketingPlan(startupId: number, plan: Partial<MarketingPlan>): Promise<MarketingPlan | undefined> {
    const existingPlan = Array.from(this.marketingPlans.values()).find(
      (p) => p.startupId === startupId,
    );
    if (!existingPlan) return undefined;
    
    const updatedPlan = { ...existingPlan, ...plan };
    this.marketingPlans.set(existingPlan.id, updatedPlan);
    return updatedPlan;
  }
  
  // Branding Kit methods
  async getBrandingKit(startupId: number): Promise<BrandingKit | undefined> {
    return Array.from(this.brandingKits.values()).find(
      (kit) => kit.startupId === startupId,
    );
  }
  
  async createBrandingKit(kit: InsertBrandingKit): Promise<BrandingKit> {
    const id = this.brandingKitIdCounter++;
    const newKit: BrandingKit = { ...kit, id };
    this.brandingKits.set(id, newKit);
    
    // Update startup progress
    await this.updateStartupProgress(kit.startupId);
    
    return newKit;
  }
  
  async updateBrandingKit(startupId: number, kit: Partial<BrandingKit>): Promise<BrandingKit | undefined> {
    const existingKit = Array.from(this.brandingKits.values()).find(
      (k) => k.startupId === startupId,
    );
    if (!existingKit) return undefined;
    
    const updatedKit = { ...existingKit, ...kit };
    this.brandingKits.set(existingKit.id, updatedKit);
    return updatedKit;
  }
  
  // Task methods
  async getTasksByStartupId(startupId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.startupId === startupId,
    );
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const newTask: Task = { ...task, id };
    this.tasks.set(id, newTask);
    return newTask;
  }
  
  async updateTask(id: number, task: Partial<Task>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;
    
    const updatedTask = { ...existingTask, ...task };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  // Resource methods
  async getResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }
  
  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(
      (resource) => resource.category === category,
    );
  }
  
  async getResourcesByIndustry(industry: string): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(
      (resource) => resource.industry === industry || resource.industry === null,
    );
  }
  
  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }
  
  async createResource(resource: InsertResource): Promise<Resource> {
    const id = this.resourceIdCounter++;
    const now = new Date();
    const newResource: Resource = { 
      ...resource, 
      id,
      createdAt: now,
      updatedAt: now,
      featured: resource.featured || false
    };
    this.resources.set(id, newResource);
    return newResource;
  }
  
  async updateResource(id: number, resource: Partial<Resource>): Promise<Resource | undefined> {
    const existingResource = this.resources.get(id);
    if (!existingResource) return undefined;
    
    const updatedResource = { 
      ...existingResource, 
      ...resource,
      updatedAt: new Date()
    };
    this.resources.set(id, updatedResource);
    return updatedResource;
  }
  
  async deleteResource(id: number): Promise<boolean> {
    return this.resources.delete(id);
  }
  
  // Helper methods
  private async updateStartupProgress(startupId: number): Promise<void> {
    const startup = await this.getStartup(startupId);
    if (!startup) return;
    
    // Calculate progress based on completed steps
    const steps = [
      await this.getStartupIdea(startupId),
      await this.getTargetAudience(startupId),
      await this.getBusinessModel(startupId),
      await this.getCompetitor(startupId),
      await this.getRevenueModel(startupId),
      await this.getMvp(startupId),
      await this.getRoadmap(startupId),
      await this.getFundingStrategy(startupId),
      await this.getScalabilityPlan(startupId),
      await this.getLaunchToolkit(startupId),
      await this.getLegalPack(startupId),
      await this.getMarketingPlan(startupId),
      await this.getBrandingKit(startupId)
    ];
    
    const completedSteps = steps.filter(step => !!step).length;
    const progress = Math.floor((completedSteps / 13) * 100);
    
    await this.updateStartup(startupId, { progress });
  }
  
  private initializeResources(): void {
    // Business Plan Templates
    const businessPlanTemplate: InsertResource = {
      category: "Business Plan Templates",
      title: "Standard Business Plan Template",
      description: "A comprehensive template for creating a detailed business plan",
      content: "# Business Plan Template\n\n## Executive Summary\n\n- Business concept\n- Current situation\n- Key objectives\n- Success factors\n\n## Company Description\n\n- Company overview\n- Mission statement\n- Vision statement\n- Company values\n\n## Market Analysis\n\n- Industry overview\n- Target market\n- Market size and growth\n- Market trends\n- Competitive analysis\n\n## Organization & Management\n\n- Organizational structure\n- Key management roles\n- Board of directors/advisors\n- External resources\n\n## Service or Product Line\n\n- Product/service description\n- Product lifecycle\n- Intellectual property\n- R&D activities\n\n## Marketing & Sales\n\n- Marketing strategy\n- Sales strategy\n- Pricing strategy\n- Promotion strategy\n\n## Financial Projections\n\n- Revenue model\n- Startup costs\n- Break-even analysis\n- Projected P&L\n- Cash flow forecast\n- Balance sheet forecast\n\n## Funding Request\n\n- Current funding requirement\n- Future funding requirements\n- Use of funds\n- Exit strategy\n\n## Appendix\n\n- Supporting documents\n- Market research data\n- Legal documents\n- Other relevant information",
      format: "markdown",
      industry: null,
    };
    
    const techStartupTemplate: InsertResource = {
      category: "Business Plan Templates",
      title: "Tech Startup Plan Template",
      description: "Specialized business plan template for tech startups",
      content: "# Tech Startup Business Plan\n\n## Executive Summary\n\n- Tech solution overview\n- Problem statement\n- Solution description\n- Market opportunity\n- Key objectives\n\n## Technology\n\n- Core technology description\n- Development status\n- Intellectual property\n- Future development roadmap\n\n## Market Analysis\n\n- Industry overview\n- Target market segments\n- Market size and growth potential\n- Technology adoption trends\n- Competitive landscape\n\n## Business Model\n\n- Revenue streams\n- Pricing strategy\n- Customer acquisition strategy\n- Unit economics\n- Scaling strategy\n\n## Marketing & Growth\n\n- Go-to-market strategy\n- User acquisition channels\n- Growth metrics\n- Retention strategy\n- Partnership opportunities\n\n## Team\n\n- Founding team\n- Key hires\n- Advisory board\n- Organizational structure\n\n## Financial Projections\n\n- Startup costs\n- Burn rate\n- Revenue forecast\n- Cash flow projections\n- Funding requirements\n\n## Milestones & Timeline\n\n- Product development milestones\n- Market entry strategy\n- Scaling phases\n- Key performance indicators\n\n## Risk Analysis\n\n- Market risks\n- Technology risks\n- Competitive risks\n- Operational risks\n- Mitigation strategies\n\n## Funding Strategy\n\n- Current funding status\n- Funding requirements\n- Investor targets\n- Use of funds\n- Exit opportunities",
      format: "markdown",
      industry: "Technology",
    };
    
    // Market Research Guides
    const marketResearchGuide: InsertResource = {
      category: "Market Research Guides",
      title: "Comprehensive Market Research Guide",
      description: "Step-by-step guide for conducting effective market research",
      content: "# Market Research Guide\n\n## Define Your Research Objectives\n\n- Identify specific questions to answer\n- Establish clear goals for the research\n- Determine key information needs\n- Set timeline and budget constraints\n\n## Identify Your Target Market\n\n- Define demographic characteristics\n- Understand psychographic factors\n- Create customer personas\n- Determine market size and segments\n\n## Choose Research Methodologies\n\n### Primary Research Methods\n\n- Surveys and questionnaires\n- In-depth interviews\n- Focus groups\n- Observational research\n- Field trials and experiments\n\n### Secondary Research Sources\n\n- Industry reports and publications\n- Government data and statistics\n- Competitor analysis\n- Academic research\n- Online databases\n\n## Data Collection Process\n\n- Design research instruments\n- Determine sample size and selection method\n- Implement data collection plan\n- Ensure data quality and integrity\n\n## Data Analysis Techniques\n\n- Quantitative analysis methods\n- Qualitative analysis approaches\n- Statistical tools and software\n- Data visualization techniques\n\n## Interpret Findings\n\n- Identify key trends and patterns\n- Draw meaningful conclusions\n- Connect findings to business objectives\n- Develop actionable insights\n\n## Apply Research Insights\n\n- Integrate findings into business strategy\n- Inform product development\n- Guide marketing and sales approaches\n- Support business decision-making\n\n## Monitor and Update\n\n- Establish ongoing research processes\n- Track market changes and trends\n- Update research as needed\n- Measure impact of implemented changes",
      format: "markdown",
      industry: null,
    };
    
    // Financial Models
    const financialModelTemplate: InsertResource = {
      category: "Financial Models",
      title: "Startup Financial Model",
      description: "Financial projection templates for early-stage ventures",
      content: "# Startup Financial Model\n\n## Revenue Projections\n\n### Basic Model Template\n\n| Month | Customers | Price | Revenue |\n|-------|-----------|-------|--------|\n| 1     | [value]   | [value] | [calc] |\n| 2     | [value]   | [value] | [calc] |\n| 3     | [value]   | [value] | [calc] |\n\n### SaaS Model Template\n\n| Month | New Customers | Churn Rate | Total Customers | MRR | ARR |\n|-------|---------------|------------|-----------------|-----|-----|\n| 1     | [value]       | [value]    | [calc]          | [calc] | [calc] |\n| 2     | [value]       | [value]    | [calc]          | [calc] | [calc] |\n| 3     | [value]       | [value]    | [calc]          | [calc] | [calc] |\n\n## Expense Projections\n\n### Fixed Costs\n\n| Expense Category | Monthly Cost | Annual Cost |\n|-----------------|--------------|-------------|\n| Salaries        | [value]      | [calc]      |\n| Rent            | [value]      | [calc]      |\n| Software        | [value]      | [calc]      |\n| Insurance       | [value]      | [calc]      |\n| Other           | [value]      | [calc]      |\n| Total           | [calc]       | [calc]      |\n\n### Variable Costs\n\n| Expense Category | Cost per Unit | Units | Total Cost |\n|-----------------|---------------|-------|------------|\n| COGS             | [value]       | [value] | [calc]  |\n| Marketing        | [value]       | [value] | [calc]  |\n| Sales Commission | [value]       | [value] | [calc]  |\n| Other            | [value]       | [value] | [calc]  |\n| Total            | [calc]        | [calc]  | [calc]  |\n\n## Cash Flow Forecast\n\n| Month | Beginning Balance | Revenue | Expenses | Net Cash Flow | Ending Balance |\n|-------|-------------------|---------|----------|---------------|----------------|\n| 1     | [value]           | [calc]  | [calc]   | [calc]        | [calc]         |\n| 2     | [calc]            | [calc]  | [calc]   | [calc]        | [calc]         |\n| 3     | [calc]            | [calc]  | [calc]   | [calc]        | [calc]         |\n\n## Break-even Analysis\n\n- Fixed Costs: [value]\n- Contribution Margin per Unit: [value]\n- Break-even Units: [calc]\n- Break-even Revenue: [calc]\n\n## Funding Requirements\n\n| Funding Round | Amount | Timing | Use of Funds | Equity |\n|---------------|--------|--------|--------------|--------|\n| Seed          | [value] | [value] | [value]    | [value] |\n| Series A      | [value] | [value] | [value]    | [value] |\n| Series B      | [value] | [value] | [value]    | [value] |",
      format: "markdown",
      industry: null,
    };
    
    // Pitch Deck Templates
    const pitchDeckTemplate: InsertResource = {
      category: "Pitch Deck Templates",
      title: "Startup Pitch Deck Template",
      description: "Structured template for creating compelling investor presentations",
      content: "# Startup Pitch Deck Template\n\n## 1. Cover Slide\n\n- Company name and logo\n- Tagline\n- Presenter's name and title\n- Contact information\n\n## 2. Problem\n\n- Clear statement of the problem\n- Who experiences this problem\n- Why it's important to solve\n- Current alternatives and their limitations\n\n## 3. Solution\n\n- Your product/service overview\n- How it solves the problem\n- Key features and benefits\n- Unique value proposition\n\n## 4. Market Opportunity\n\n- Target market size (TAM, SAM, SOM)\n- Market growth rate\n- Industry trends\n- Timing advantages\n\n## 5. Product/Service\n\n- More detailed explanation\n- Product screenshots/demo\n- Current development stage\n- Product roadmap\n\n## 6. Business Model\n\n- How you make money\n- Pricing strategy\n- Sales and distribution channels\n- Customer lifetime value\n- Unit economics\n\n## 7. Go-to-Market Strategy\n\n- Marketing and sales approach\n- Customer acquisition strategy\n- Partnerships and channels\n- Launch timeline\n\n## 8. Competitive Analysis\n\n- Competitive landscape\n- Your competitive advantages\n- Barriers to entry\n- Differentiation factors\n\n## 9. Traction\n\n- Current customers/users\n- Revenue to date\n- Key growth metrics\n- Partnerships and milestones\n\n## 10. Team\n\n- Founders and key team members\n- Relevant experience and expertise\n- Advisory board\n- Key hires needed\n\n## 11. Financial Projections\n\n- 3-5 year projections\n- Revenue model\n- Key expense categories\n- Profitability timeline\n\n## 12. Funding Ask\n\n- Amount you're raising\n- How funds will be used\n- Previous funding rounds\n- Timeline to next milestone\n\n## 13. Vision & Closing\n\n- Long-term vision\n- Impact potential\n- Key takeaways\n- Call to action\n- Contact information",
      format: "markdown",
      industry: null,
    };
    
    // Legal Templates
    const legalTemplates: InsertResource = {
      category: "Legal Templates",
      title: "Essential Startup Legal Documents",
      description: "Templates for common legal documents needed by startups",
      content: "# Essential Startup Legal Documents\n\n## Incorporation Documents\n\n### Articles of Incorporation/Organization\n\n- Company name\n- Business purpose\n- Stock structure\n- Registered agent information\n- Management structure\n\n### Bylaws/Operating Agreement\n\n- Management structure\n- Voting rights\n- Meeting procedures\n- Ownership transfers\n- Dissolution procedures\n\n## Founder Agreements\n\n### Founder Equity Agreement\n\n- Initial equity distribution\n- Vesting schedules\n- Roles and responsibilities\n- Decision-making authority\n- Intellectual property assignments\n\n### Founder Vesting Agreement\n\n- Vesting schedule (typically 4 years with 1-year cliff)\n- Acceleration provisions\n- Departure scenarios\n- Buyback rights\n\n## Intellectual Property Protection\n\n### Employee IP Assignment Agreement\n\n- Assignment of work product\n- Confidentiality provisions\n- Non-compete clauses\n- Non-solicitation terms\n\n### Contractor Agreement\n\n- Work scope and deliverables\n- Payment terms\n- IP ownership\n- Confidentiality requirements\n\n## Investment Documents\n\n### SAFE (Simple Agreement for Future Equity)\n\n- Investment amount\n- Valuation cap\n- Discount rate\n- Conversion provisions\n\n### Convertible Note\n\n- Principal amount\n- Interest rate\n- Maturity date\n- Conversion triggers and terms\n\n## Customer Agreements\n\n### Terms of Service\n\n- Service description\n- User rights and responsibilities\n- Payment terms\n- Limitation of liability\n- Dispute resolution\n\n### Privacy Policy\n\n- Data collection practices\n- Data usage policies\n- User rights\n- Security measures\n- Compliance statements\n\n## Employment Documents\n\n### Offer Letter Template\n\n- Position and duties\n- Compensation and benefits\n- Start date\n- At-will employment statement\n- Contingencies\n\n### Employee Handbook\n\n- Company policies\n- Code of conduct\n- Benefits information\n- Complaint procedures\n- Acknowledgment form",
      format: "markdown",
      industry: null,
    };
    
    // Add resources to store
    const resources = [
      businessPlanTemplate,
      techStartupTemplate,
      marketResearchGuide,
      financialModelTemplate,
      pitchDeckTemplate,
      legalTemplates
    ];
    
    resources.forEach(resource => {
      const id = this.resourceIdCounter++;
      this.resources.set(id, { ...resource, id });
    });
  }
  
  // Forum Post methods
  async getForumPosts(): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values());
  }
  
  async getForumPostsByCategory(category: string): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values()).filter(
      (post) => post.category === category,
    );
  }
  
  async getForumPostsByUser(userId: number): Promise<ForumPost[]> {
    return Array.from(this.forumPosts.values()).filter(
      (post) => post.userId === userId,
    );
  }
  
  async getForumPost(id: number): Promise<ForumPost | undefined> {
    return this.forumPosts.get(id);
  }
  
  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const id = this.forumPostIdCounter++;
    const now = new Date();
    const newPost: ForumPost = { 
      ...post, 
      id, 
      createdAt: now,
      updatedAt: now,
      likes: 0,
      views: 0
    };
    this.forumPosts.set(id, newPost);
    return newPost;
  }
  
  async updateForumPost(id: number, post: Partial<ForumPost>): Promise<ForumPost | undefined> {
    const existingPost = this.forumPosts.get(id);
    if (!existingPost) return undefined;
    
    const updatedPost = { 
      ...existingPost, 
      ...post,
      updatedAt: new Date()
    };
    this.forumPosts.set(id, updatedPost);
    return updatedPost;
  }
  
  async deleteForumPost(id: number): Promise<boolean> {
    return this.forumPosts.delete(id);
  }
  
  // Forum Comment methods
  async getForumComments(postId: number): Promise<ForumComment[]> {
    return Array.from(this.forumComments.values()).filter(
      (comment) => comment.postId === postId,
    );
  }
  
  async getForumComment(id: number): Promise<ForumComment | undefined> {
    return this.forumComments.get(id);
  }
  
  async createForumComment(comment: InsertForumComment): Promise<ForumComment> {
    const id = this.forumCommentIdCounter++;
    const now = new Date();
    const newComment: ForumComment = { 
      ...comment, 
      id, 
      createdAt: now,
      updatedAt: now,
      likes: 0
    };
    this.forumComments.set(id, newComment);
    return newComment;
  }
  
  async updateForumComment(id: number, comment: Partial<ForumComment>): Promise<ForumComment | undefined> {
    const existingComment = this.forumComments.get(id);
    if (!existingComment) return undefined;
    
    const updatedComment = { 
      ...existingComment, 
      ...comment,
      updatedAt: new Date()
    };
    this.forumComments.set(id, updatedComment);
    return updatedComment;
  }
  
  async deleteForumComment(id: number): Promise<boolean> {
    return this.forumComments.delete(id);
  }
  
  // Notification methods
  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId,
    );
  }
  
  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId && !notification.read,
    );
  }
  
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const now = new Date();
    const newNotification: Notification = { 
      ...notification, 
      id, 
      createdAt: now,
      read: false
    };
    this.notifications.set(id, newNotification);
    return newNotification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updatedNotification = { ...notification, read: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
  
  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }
}

export const storage = new MemStorage();
