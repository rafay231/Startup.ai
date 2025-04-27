import express from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../auth";
import { 
  insertRoadmapSchema, 
  insertFundingStrategySchema, 
  insertScalabilityPlanSchema,
  insertLaunchToolkitSchema,
  insertLegalPackSchema,
  insertMarketingPlanSchema,
  insertBrandingKitSchema
} from "@shared/schema";

const router = express.Router();

// Roadmap routes
router.get("/roadmap/:startupId", async (req, res) => {
  try {
    const startupId = parseInt(req.params.startupId);
    if (isNaN(startupId)) {
      return res.status(400).json({ error: "Invalid startup ID" });
    }
    
    const roadmap = await storage.getRoadmap(startupId);
    if (!roadmap) {
      return res.status(404).json({ error: "Roadmap not found" });
    }
    
    res.json(roadmap);
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    res.status(500).json({ error: "Failed to fetch roadmap" });
  }
});

router.post("/roadmap", isAuthenticated, async (req, res) => {
  try {
    const result = insertRoadmapSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid roadmap data", details: result.error });
    }
    
    // Check if the startup exists and belongs to the user
    const startup = await storage.getStartup(result.data.startupId);
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }
    
    if (startup.userId !== req.user!.id) {
      return res.status(403).json({ error: "You are not authorized to add a roadmap to this startup" });
    }
    
    // Check if a roadmap already exists for this startup
    const existingRoadmap = await storage.getRoadmap(result.data.startupId);
    if (existingRoadmap) {
      return res.status(409).json({ error: "A roadmap already exists for this startup" });
    }
    
    const roadmap = await storage.createRoadmap(result.data);
    res.status(201).json(roadmap);
  } catch (error) {
    console.error("Error creating roadmap:", error);
    res.status(500).json({ error: "Failed to create roadmap" });
  }
});

router.put("/roadmap/:startupId", isAuthenticated, async (req, res) => {
  try {
    const startupId = parseInt(req.params.startupId);
    if (isNaN(startupId)) {
      return res.status(400).json({ error: "Invalid startup ID" });
    }
    
    // Check if the startup exists and belongs to the user
    const startup = await storage.getStartup(startupId);
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }
    
    if (startup.userId !== req.user!.id) {
      return res.status(403).json({ error: "You are not authorized to update this roadmap" });
    }
    
    const roadmap = await storage.updateRoadmap(startupId, req.body);
    if (!roadmap) {
      return res.status(404).json({ error: "Roadmap not found" });
    }
    
    res.json(roadmap);
  } catch (error) {
    console.error("Error updating roadmap:", error);
    res.status(500).json({ error: "Failed to update roadmap" });
  }
});

// Funding Strategy routes
router.get("/funding-strategy/:startupId", async (req, res) => {
  try {
    const startupId = parseInt(req.params.startupId);
    if (isNaN(startupId)) {
      return res.status(400).json({ error: "Invalid startup ID" });
    }
    
    const strategy = await storage.getFundingStrategy(startupId);
    if (!strategy) {
      return res.status(404).json({ error: "Funding strategy not found" });
    }
    
    res.json(strategy);
  } catch (error) {
    console.error("Error fetching funding strategy:", error);
    res.status(500).json({ error: "Failed to fetch funding strategy" });
  }
});

router.post("/funding-strategy", isAuthenticated, async (req, res) => {
  try {
    const result = insertFundingStrategySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid funding strategy data", details: result.error });
    }
    
    // Check if the startup exists and belongs to the user
    const startup = await storage.getStartup(result.data.startupId);
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }
    
    if (startup.userId !== req.user!.id) {
      return res.status(403).json({ error: "You are not authorized to add a funding strategy to this startup" });
    }
    
    // Check if a funding strategy already exists for this startup
    const existingStrategy = await storage.getFundingStrategy(result.data.startupId);
    if (existingStrategy) {
      return res.status(409).json({ error: "A funding strategy already exists for this startup" });
    }
    
    const strategy = await storage.createFundingStrategy(result.data);
    res.status(201).json(strategy);
  } catch (error) {
    console.error("Error creating funding strategy:", error);
    res.status(500).json({ error: "Failed to create funding strategy" });
  }
});

router.put("/funding-strategy/:startupId", isAuthenticated, async (req, res) => {
  try {
    const startupId = parseInt(req.params.startupId);
    if (isNaN(startupId)) {
      return res.status(400).json({ error: "Invalid startup ID" });
    }
    
    // Check if the startup exists and belongs to the user
    const startup = await storage.getStartup(startupId);
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }
    
    if (startup.userId !== req.user!.id) {
      return res.status(403).json({ error: "You are not authorized to update this funding strategy" });
    }
    
    const strategy = await storage.updateFundingStrategy(startupId, req.body);
    if (!strategy) {
      return res.status(404).json({ error: "Funding strategy not found" });
    }
    
    res.json(strategy);
  } catch (error) {
    console.error("Error updating funding strategy:", error);
    res.status(500).json({ error: "Failed to update funding strategy" });
  }
});

// Scalability Plan routes
router.get("/scalability-plan/:startupId", async (req, res) => {
  try {
    const startupId = parseInt(req.params.startupId);
    if (isNaN(startupId)) {
      return res.status(400).json({ error: "Invalid startup ID" });
    }
    
    const plan = await storage.getScalabilityPlan(startupId);
    if (!plan) {
      return res.status(404).json({ error: "Scalability plan not found" });
    }
    
    res.json(plan);
  } catch (error) {
    console.error("Error fetching scalability plan:", error);
    res.status(500).json({ error: "Failed to fetch scalability plan" });
  }
});

router.post("/scalability-plan", isAuthenticated, async (req, res) => {
  try {
    const result = insertScalabilityPlanSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid scalability plan data", details: result.error });
    }
    
    // Check if the startup exists and belongs to the user
    const startup = await storage.getStartup(result.data.startupId);
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }
    
    if (startup.userId !== req.user!.id) {
      return res.status(403).json({ error: "You are not authorized to add a scalability plan to this startup" });
    }
    
    // Check if a scalability plan already exists for this startup
    const existingPlan = await storage.getScalabilityPlan(result.data.startupId);
    if (existingPlan) {
      return res.status(409).json({ error: "A scalability plan already exists for this startup" });
    }
    
    const plan = await storage.createScalabilityPlan(result.data);
    res.status(201).json(plan);
  } catch (error) {
    console.error("Error creating scalability plan:", error);
    res.status(500).json({ error: "Failed to create scalability plan" });
  }
});

router.put("/scalability-plan/:startupId", isAuthenticated, async (req, res) => {
  try {
    const startupId = parseInt(req.params.startupId);
    if (isNaN(startupId)) {
      return res.status(400).json({ error: "Invalid startup ID" });
    }
    
    // Check if the startup exists and belongs to the user
    const startup = await storage.getStartup(startupId);
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }
    
    if (startup.userId !== req.user!.id) {
      return res.status(403).json({ error: "You are not authorized to update this scalability plan" });
    }
    
    const plan = await storage.updateScalabilityPlan(startupId, req.body);
    if (!plan) {
      return res.status(404).json({ error: "Scalability plan not found" });
    }
    
    res.json(plan);
  } catch (error) {
    console.error("Error updating scalability plan:", error);
    res.status(500).json({ error: "Failed to update scalability plan" });
  }
});

// Launch Toolkit routes
router.get("/launch-toolkit/:startupId", async (req, res) => {
  try {
    const startupId = parseInt(req.params.startupId);
    if (isNaN(startupId)) {
      return res.status(400).json({ error: "Invalid startup ID" });
    }
    
    const toolkit = await storage.getLaunchToolkit(startupId);
    if (!toolkit) {
      return res.status(404).json({ error: "Launch toolkit not found" });
    }
    
    res.json(toolkit);
  } catch (error) {
    console.error("Error fetching launch toolkit:", error);
    res.status(500).json({ error: "Failed to fetch launch toolkit" });
  }
});

router.post("/launch-toolkit", isAuthenticated, async (req, res) => {
  try {
    const result = insertLaunchToolkitSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid launch toolkit data", details: result.error });
    }
    
    // Check if the startup exists and belongs to the user
    const startup = await storage.getStartup(result.data.startupId);
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }
    
    if (startup.userId !== req.user!.id) {
      return res.status(403).json({ error: "You are not authorized to add a launch toolkit to this startup" });
    }
    
    // Check if a launch toolkit already exists for this startup
    const existingToolkit = await storage.getLaunchToolkit(result.data.startupId);
    if (existingToolkit) {
      return res.status(409).json({ error: "A launch toolkit already exists for this startup" });
    }
    
    const toolkit = await storage.createLaunchToolkit(result.data);
    res.status(201).json(toolkit);
  } catch (error) {
    console.error("Error creating launch toolkit:", error);
    res.status(500).json({ error: "Failed to create launch toolkit" });
  }
});

router.put("/launch-toolkit/:startupId", isAuthenticated, async (req, res) => {
  try {
    const startupId = parseInt(req.params.startupId);
    if (isNaN(startupId)) {
      return res.status(400).json({ error: "Invalid startup ID" });
    }
    
    // Check if the startup exists and belongs to the user
    const startup = await storage.getStartup(startupId);
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }
    
    if (startup.userId !== req.user!.id) {
      return res.status(403).json({ error: "You are not authorized to update this launch toolkit" });
    }
    
    const toolkit = await storage.updateLaunchToolkit(startupId, req.body);
    if (!toolkit) {
      return res.status(404).json({ error: "Launch toolkit not found" });
    }
    
    res.json(toolkit);
  } catch (error) {
    console.error("Error updating launch toolkit:", error);
    res.status(500).json({ error: "Failed to update launch toolkit" });
  }
});

// Legal Pack routes
router.get("/legal-pack/:startupId", async (req, res) => {
  try {
    const startupId = parseInt(req.params.startupId);
    if (isNaN(startupId)) {
      return res.status(400).json({ error: "Invalid startup ID" });
    }
    
    const pack = await storage.getLegalPack(startupId);
    if (!pack) {
      return res.status(404).json({ error: "Legal pack not found" });
    }
    
    res.json(pack);
  } catch (error) {
    console.error("Error fetching legal pack:", error);
    res.status(500).json({ error: "Failed to fetch legal pack" });
  }
});

router.post("/legal-pack", isAuthenticated, async (req, res) => {
  try {
    const result = insertLegalPackSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid legal pack data", details: result.error });
    }
    
    // Check if the startup exists and belongs to the user
    const startup = await storage.getStartup(result.data.startupId);
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }
    
    if (startup.userId !== req.user!.id) {
      return res.status(403).json({ error: "You are not authorized to add a legal pack to this startup" });
    }
    
    // Check if a legal pack already exists for this startup
    const existingPack = await storage.getLegalPack(result.data.startupId);
    if (existingPack) {
      return res.status(409).json({ error: "A legal pack already exists for this startup" });
    }
    
    const pack = await storage.createLegalPack(result.data);
    res.status(201).json(pack);
  } catch (error) {
    console.error("Error creating legal pack:", error);
    res.status(500).json({ error: "Failed to create legal pack" });
  }
});

router.put("/legal-pack/:startupId", isAuthenticated, async (req, res) => {
  try {
    const startupId = parseInt(req.params.startupId);
    if (isNaN(startupId)) {
      return res.status(400).json({ error: "Invalid startup ID" });
    }
    
    // Check if the startup exists and belongs to the user
    const startup = await storage.getStartup(startupId);
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }
    
    if (startup.userId !== req.user!.id) {
      return res.status(403).json({ error: "You are not authorized to update this legal pack" });
    }
    
    const pack = await storage.updateLegalPack(startupId, req.body);
    if (!pack) {
      return res.status(404).json({ error: "Legal pack not found" });
    }
    
    res.json(pack);
  } catch (error) {
    console.error("Error updating legal pack:", error);
    res.status(500).json({ error: "Failed to update legal pack" });
  }
});

// Marketing Plan routes
router.get("/marketing-plan/:startupId", async (req, res) => {
  try {
    const startupId = parseInt(req.params.startupId);
    if (isNaN(startupId)) {
      return res.status(400).json({ error: "Invalid startup ID" });
    }
    
    const plan = await storage.getMarketingPlan(startupId);
    if (!plan) {
      return res.status(404).json({ error: "Marketing plan not found" });
    }
    
    res.json(plan);
  } catch (error) {
    console.error("Error fetching marketing plan:", error);
    res.status(500).json({ error: "Failed to fetch marketing plan" });
  }
});

router.post("/marketing-plan", isAuthenticated, async (req, res) => {
  try {
    const result = insertMarketingPlanSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid marketing plan data", details: result.error });
    }
    
    // Check if the startup exists and belongs to the user
    const startup = await storage.getStartup(result.data.startupId);
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }
    
    if (startup.userId !== req.user!.id) {
      return res.status(403).json({ error: "You are not authorized to add a marketing plan to this startup" });
    }
    
    // Check if a marketing plan already exists for this startup
    const existingPlan = await storage.getMarketingPlan(result.data.startupId);
    if (existingPlan) {
      return res.status(409).json({ error: "A marketing plan already exists for this startup" });
    }
    
    const plan = await storage.createMarketingPlan(result.data);
    res.status(201).json(plan);
  } catch (error) {
    console.error("Error creating marketing plan:", error);
    res.status(500).json({ error: "Failed to create marketing plan" });
  }
});

router.put("/marketing-plan/:startupId", isAuthenticated, async (req, res) => {
  try {
    const startupId = parseInt(req.params.startupId);
    if (isNaN(startupId)) {
      return res.status(400).json({ error: "Invalid startup ID" });
    }
    
    // Check if the startup exists and belongs to the user
    const startup = await storage.getStartup(startupId);
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }
    
    if (startup.userId !== req.user!.id) {
      return res.status(403).json({ error: "You are not authorized to update this marketing plan" });
    }
    
    const plan = await storage.updateMarketingPlan(startupId, req.body);
    if (!plan) {
      return res.status(404).json({ error: "Marketing plan not found" });
    }
    
    res.json(plan);
  } catch (error) {
    console.error("Error updating marketing plan:", error);
    res.status(500).json({ error: "Failed to update marketing plan" });
  }
});

// Branding Kit routes
router.get("/branding-kit/:startupId", async (req, res) => {
  try {
    const startupId = parseInt(req.params.startupId);
    if (isNaN(startupId)) {
      return res.status(400).json({ error: "Invalid startup ID" });
    }
    
    const kit = await storage.getBrandingKit(startupId);
    if (!kit) {
      return res.status(404).json({ error: "Branding kit not found" });
    }
    
    res.json(kit);
  } catch (error) {
    console.error("Error fetching branding kit:", error);
    res.status(500).json({ error: "Failed to fetch branding kit" });
  }
});

router.post("/branding-kit", isAuthenticated, async (req, res) => {
  try {
    const result = insertBrandingKitSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid branding kit data", details: result.error });
    }
    
    // Check if the startup exists and belongs to the user
    const startup = await storage.getStartup(result.data.startupId);
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }
    
    if (startup.userId !== req.user!.id) {
      return res.status(403).json({ error: "You are not authorized to add a branding kit to this startup" });
    }
    
    // Check if a branding kit already exists for this startup
    const existingKit = await storage.getBrandingKit(result.data.startupId);
    if (existingKit) {
      return res.status(409).json({ error: "A branding kit already exists for this startup" });
    }
    
    const kit = await storage.createBrandingKit(result.data);
    res.status(201).json(kit);
  } catch (error) {
    console.error("Error creating branding kit:", error);
    res.status(500).json({ error: "Failed to create branding kit" });
  }
});

router.put("/branding-kit/:startupId", isAuthenticated, async (req, res) => {
  try {
    const startupId = parseInt(req.params.startupId);
    if (isNaN(startupId)) {
      return res.status(400).json({ error: "Invalid startup ID" });
    }
    
    // Check if the startup exists and belongs to the user
    const startup = await storage.getStartup(startupId);
    if (!startup) {
      return res.status(404).json({ error: "Startup not found" });
    }
    
    if (startup.userId !== req.user!.id) {
      return res.status(403).json({ error: "You are not authorized to update this branding kit" });
    }
    
    const kit = await storage.updateBrandingKit(startupId, req.body);
    if (!kit) {
      return res.status(404).json({ error: "Branding kit not found" });
    }
    
    res.json(kit);
  } catch (error) {
    console.error("Error updating branding kit:", error);
    res.status(500).json({ error: "Failed to update branding kit" });
  }
});

export default router;