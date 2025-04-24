import { users, startups, startupIdeas, targetAudiences, businessModels, competitors, revenueModels, mvps, tasks, resources } from "@shared/schema";
import type { User, InsertUser, Startup, InsertStartup, StartupIdea, InsertStartupIdea, TargetAudience, InsertTargetAudience, BusinessModel, InsertBusinessModel, Competitor, InsertCompetitor, RevenueModel, InsertRevenueModel, Mvp, InsertMvp, Task, InsertTask, Resource, InsertResource } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  private tasks: Map<number, Task>;
  private resources: Map<number, Resource>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private startupIdCounter: number;
  private startupIdeaIdCounter: number;
  private targetAudienceIdCounter: number;
  private businessModelIdCounter: number;
  private competitorIdCounter: number;
  private revenueModelIdCounter: number;
  private mvpIdCounter: number;
  private taskIdCounter: number;
  private resourceIdCounter: number;

  constructor() {
    this.users = new Map();
    this.startups = new Map();
    this.startupIdeas = new Map();
    this.targetAudiences = new Map();
    this.businessModels = new Map();
    this.competitors = new Map();
    this.revenueModels = new Map();
    this.mvps = new Map();
    this.tasks = new Map();
    this.resources = new Map();
    
    this.userIdCounter = 1;
    this.startupIdCounter = 1;
    this.startupIdeaIdCounter = 1;
    this.targetAudienceIdCounter = 1;
    this.businessModelIdCounter = 1;
    this.competitorIdCounter = 1;
    this.revenueModelIdCounter = 1;
    this.mvpIdCounter = 1;
    this.taskIdCounter = 1;
    this.resourceIdCounter = 1;
    
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
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
      await this.getMvp(startupId)
    ];
    
    const completedSteps = steps.filter(step => !!step).length;
    const progress = Math.floor((completedSteps / 6) * 100);
    
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
}

export const storage = new MemStorage();
