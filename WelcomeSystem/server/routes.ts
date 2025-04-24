import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import path from "path";
import { insertStartupSchema, insertStartupIdeaSchema, insertTargetAudienceSchema, insertBusinessModelSchema, insertCompetitorSchema, insertRevenueModelSchema, insertMvpSchema, insertTaskSchema } from "@shared/schema";
import { generateStartupRecommendations, generateBusinessModelSuggestions, generatePitchDeckOutline } from "./openai";

// Add a simple diagnostic route for testing API connectivity
export function addDiagnosticRoutes(app: Express) {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });

  // Simple test endpoint that doesn't require auth
  app.get("/api/test", (req, res) => {
    res.json({
      message: "API is working correctly",
      timestamp: new Date().toISOString()
    });
  });

  // Service info endpoint
  app.get("/api/info", (req, res) => {
    res.json({
      name: "StartupLaunchpad API",
      description: "Backend services for the StartupLaunchpad platform",
      routes: [
        { path: "/api/health", method: "GET", description: "Health check endpoint" },
        { path: "/api/test", method: "GET", description: "Test endpoint" },
        { path: "/api/info", method: "GET", description: "Service information" },
        { path: "/api/user", method: "GET", description: "Get current user (requires auth)" },
        { path: "/api/login", method: "POST", description: "Login endpoint" },
        { path: "/api/register", method: "POST", description: "Registration endpoint" },
        { path: "/api/logout", method: "POST", description: "Logout endpoint" }
      ]
    });
  });
}

export async function registerRoutes(app: Express, existingServer?: Server): Promise<Server> {
  // Add diagnostic routes first for better debugging
  addDiagnosticRoutes(app);
  
  // Set up authentication routes
  setupAuth(app);
  
  // AI Routes
  app.post("/api/ai/analyze-idea", async (req, res) => {
    try {
      const { idea, industry } = req.body;
      
      if (!idea || !industry) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields" 
        });
      }
      
      const result = await generateStartupRecommendations(idea, industry);
      res.json(result);
    } catch (error) {
      console.error("AI analysis error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to analyze idea" 
      });
    }
  });
  
  app.post("/api/ai/business-model", async (req, res) => {
    try {
      const { idea, industry, targetAudience } = req.body;
      
      if (!idea || !industry || !targetAudience) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields" 
        });
      }
      
      const result = await generateBusinessModelSuggestions(idea, industry, targetAudience);
      res.json(result);
    } catch (error) {
      console.error("AI business model error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to generate business model suggestions" 
      });
    }
  });
  
  app.post("/api/ai/pitch-deck", async (req, res) => {
    try {
      const { startupName, idea, industry, targetAudience, businessModel } = req.body;
      
      if (!startupName || !idea || !industry || !targetAudience || !businessModel) {
        return res.status(400).json({ 
          success: false, 
          error: "Missing required fields" 
        });
      }
      
      const result = await generatePitchDeckOutline(startupName, idea, industry, targetAudience, businessModel);
      res.json(result);
    } catch (error) {
      console.error("AI pitch deck error:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to generate pitch deck outline" 
      });
    }
  });
  
  // Startups API
  app.get("/api/startups", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const startups = await storage.getStartupsByUserId(req.user.id);
    res.json(startups);
  });
  
  app.post("/api/startups", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const startupData = insertStartupSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const startup = await storage.createStartup(startupData);
      res.status(201).json(startup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  app.get("/api/startups/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const startup = await storage.getStartup(id);
    
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }
    
    if (startup.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    res.json(startup);
  });
  
  app.patch("/api/startups/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const startup = await storage.getStartup(id);
    
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }
    
    if (startup.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const updatedStartup = await storage.updateStartup(id, req.body);
      res.json(updatedStartup);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/startups/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const startup = await storage.getStartup(id);
    
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }
    
    if (startup.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const success = await storage.deleteStartup(id);
    if (success) {
      res.sendStatus(204);
    } else {
      res.status(500).json({ message: "Failed to delete startup" });
    }
  });
  
  // Startup Idea API
  app.get("/api/startups/:id/idea", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const startupId = parseInt(req.params.id);
    const startup = await storage.getStartup(startupId);
    
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }
    
    if (startup.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const idea = await storage.getStartupIdea(startupId);
    if (!idea) {
      return res.status(404).json({ message: "Startup idea not found" });
    }
    
    res.json(idea);
  });
  
  app.post("/api/startups/:id/idea", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const startupId = parseInt(req.params.id);
    const startup = await storage.getStartup(startupId);
    
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }
    
    if (startup.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const ideaData = insertStartupIdeaSchema.parse({
        ...req.body,
        startupId
      });
      
      // Check if idea already exists
      const existingIdea = await storage.getStartupIdea(startupId);
      if (existingIdea) {
        const updatedIdea = await storage.updateStartupIdea(startupId, ideaData);
        return res.json(updatedIdea);
      }
      
      const idea = await storage.createStartupIdea(ideaData);
      res.status(201).json(idea);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  // Target Audience API
  app.get("/api/startups/:id/audience", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const startupId = parseInt(req.params.id);
    const startup = await storage.getStartup(startupId);
    
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }
    
    if (startup.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const audience = await storage.getTargetAudience(startupId);
    if (!audience) {
      return res.status(404).json({ message: "Target audience not found" });
    }
    
    res.json(audience);
  });
  
  app.post("/api/startups/:id/audience", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const startupId = parseInt(req.params.id);
    const startup = await storage.getStartup(startupId);
    
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }
    
    if (startup.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const audienceData = insertTargetAudienceSchema.parse({
        ...req.body,
        startupId
      });
      
      // Check if audience already exists
      const existingAudience = await storage.getTargetAudience(startupId);
      if (existingAudience) {
        const updatedAudience = await storage.updateTargetAudience(startupId, audienceData);
        return res.json(updatedAudience);
      }
      
      const audience = await storage.createTargetAudience(audienceData);
      res.status(201).json(audience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  // Business Model API
  app.get("/api/startups/:id/business-model", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const startupId = parseInt(req.params.id);
    const startup = await storage.getStartup(startupId);
    
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }
    
    if (startup.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const model = await storage.getBusinessModel(startupId);
    if (!model) {
      return res.status(404).json({ message: "Business model not found" });
    }
    
    res.json(model);
  });
  
  app.post("/api/startups/:id/business-model", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const startupId = parseInt(req.params.id);
    const startup = await storage.getStartup(startupId);
    
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }
    
    if (startup.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const modelData = insertBusinessModelSchema.parse({
        ...req.body,
        startupId
      });
      
      // Check if model already exists
      const existingModel = await storage.getBusinessModel(startupId);
      if (existingModel) {
        const updatedModel = await storage.updateBusinessModel(startupId, modelData);
        return res.json(updatedModel);
      }
      
      const model = await storage.createBusinessModel(modelData);
      res.status(201).json(model);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  // Competition API
  app.get("/api/startups/:id/competition", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const startupId = parseInt(req.params.id);
    const startup = await storage.getStartup(startupId);
    
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }
    
    if (startup.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const competitor = await storage.getCompetitor(startupId);
    if (!competitor) {
      return res.status(404).json({ message: "Competition data not found" });
    }
    
    res.json(competitor);
  });
  
  app.post("/api/startups/:id/competition", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const startupId = parseInt(req.params.id);
    const startup = await storage.getStartup(startupId);
    
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }
    
    if (startup.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const competitorData = insertCompetitorSchema.parse({
        ...req.body,
        startupId
      });
      
      // Check if competitor data already exists
      const existingCompetitor = await storage.getCompetitor(startupId);
      if (existingCompetitor) {
        const updatedCompetitor = await storage.updateCompetitor(startupId, competitorData);
        return res.json(updatedCompetitor);
      }
      
      const competitor = await storage.createCompetitor(competitorData);
      res.status(201).json(competitor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  // Revenue Model API
  app.get("/api/startups/:id/revenue", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const startupId = parseInt(req.params.id);
    const startup = await storage.getStartup(startupId);
    
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }
    
    if (startup.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const model = await storage.getRevenueModel(startupId);
    if (!model) {
      return res.status(404).json({ message: "Revenue model not found" });
    }
    
    res.json(model);
  });
  
  app.post("/api/startups/:id/revenue", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const startupId = parseInt(req.params.id);
    const startup = await storage.getStartup(startupId);
    
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }
    
    if (startup.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const modelData = insertRevenueModelSchema.parse({
        ...req.body,
        startupId
      });
      
      // Check if model already exists
      const existingModel = await storage.getRevenueModel(startupId);
      if (existingModel) {
        const updatedModel = await storage.updateRevenueModel(startupId, modelData);
        return res.json(updatedModel);
      }
      
      const model = await storage.createRevenueModel(modelData);
      res.status(201).json(model);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  // MVP API
  app.get("/api/startups/:id/mvp", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const startupId = parseInt(req.params.id);
    const startup = await storage.getStartup(startupId);
    
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }
    
    if (startup.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const mvp = await storage.getMvp(startupId);
    if (!mvp) {
      return res.status(404).json({ message: "MVP not found" });
    }
    
    res.json(mvp);
  });
  
  app.post("/api/startups/:id/mvp", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const startupId = parseInt(req.params.id);
    const startup = await storage.getStartup(startupId);
    
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }
    
    if (startup.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const mvpData = insertMvpSchema.parse({
        ...req.body,
        startupId
      });
      
      // Check if MVP already exists
      const existingMvp = await storage.getMvp(startupId);
      if (existingMvp) {
        const updatedMvp = await storage.updateMvp(startupId, mvpData);
        return res.json(updatedMvp);
      }
      
      const mvp = await storage.createMvp(mvpData);
      res.status(201).json(mvp);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  // Tasks API
  app.get("/api/startups/:id/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const startupId = parseInt(req.params.id);
    const startup = await storage.getStartup(startupId);
    
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }
    
    if (startup.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const tasks = await storage.getTasksByStartupId(startupId);
    res.json(tasks);
  });
  
  app.post("/api/startups/:id/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const startupId = parseInt(req.params.id);
    const startup = await storage.getStartup(startupId);
    
    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }
    
    if (startup.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const taskData = insertTaskSchema.parse({
        ...req.body,
        startupId
      });
      
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  app.patch("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const task = await storage.getTask(id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    const startup = await storage.getStartup(task.startupId);
    if (startup?.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    try {
      const updatedTask = await storage.updateTask(id, req.body);
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const task = await storage.getTask(id);
    
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    const startup = await storage.getStartup(task.startupId);
    if (startup?.userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    const success = await storage.deleteTask(id);
    if (success) {
      res.sendStatus(204);
    } else {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });
  
  // Resources API
  app.get("/api/resources", async (req, res) => {
    const resources = await storage.getResources();
    res.json(resources);
  });
  
  app.get("/api/resources/category/:category", async (req, res) => {
    const { category } = req.params;
    const resources = await storage.getResourcesByCategory(category);
    res.json(resources);
  });
  
  app.get("/api/resources/industry/:industry", async (req, res) => {
    const { industry } = req.params;
    const resources = await storage.getResourcesByIndustry(industry);
    res.json(resources);
  });
  
  app.get("/api/resources/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const resource = await storage.getResource(id);
    
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    res.json(resource);
  });

  // Simple test endpoint that doesn't require authentication
  app.get("/api/test", (req, res) => {
    res.json({ 
      status: "success", 
      message: "API is working correctly", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  });
  
  // Direct route to serve the landing page
  app.get("/landing", (req, res) => {
    const landingPagePath = path.resolve(process.cwd(), "client", "index.html");
    res.sendFile(landingPagePath);
  });

  // HTML status page for debugging
  app.get("/debug-status", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Server Status</title>
          <style>
            body { font-family: -apple-system, sans-serif; line-height: 1.6; padding: 20px; }
            .container { max-width: 800px; margin: 0 auto; }
            .card { padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px; }
            h1 { color: #333; }
            pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto; }
            .success { color: green; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Server Status: <span class="success">Running</span></h1>
            
            <div class="card">
              <h2>Server Information</h2>
              <p>Node Version: ${process.version}</p>
              <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
              <p>Current Time: ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="card">
              <h2>API Test</h2>
              <button id="testApi">Test API</button>
              <div id="apiResult"></div>
            </div>
            
            <div class="card">
              <h2>Debug Resources</h2>
              <p><a href="/test.html">Access Test HTML Page</a></p>
              <p><a href="/debug">Access Debug Page</a></p>
            </div>
          </div>
          
          <script>
            document.getElementById('testApi').addEventListener('click', async () => {
              const resultEl = document.getElementById('apiResult');
              resultEl.innerHTML = 'Testing API...';
              
              try {
                const response = await fetch('/api/test');
                const data = await response.json();
                resultEl.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
              } catch (error) {
                resultEl.innerHTML = '<p style="color:red">Error: ' + error.message + '</p>';
              }
            });
          </script>
        </body>
      </html>
    `);
  });

  // Use the existing server if provided, otherwise create a new one
  const httpServer = existingServer || createServer(app);

  return httpServer;
}
