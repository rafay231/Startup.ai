import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log } from "./vite";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES Module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// OPTIMIZATION: Make sure we signal port readiness as early as possible
// for Replit's workflow detection
const app = express();
const port = process.env.PORT || 12000; // Use port 12000 as specified in the runtime information
// Create HTTP server instance early to help with faster port binding
const server = createServer(app);

// Signal to Replit that we're starting up
console.log(`Starting server initialization on port ${port}...`);

// Enable CORS for all origins to help with debugging
app.use(cors({
  origin: '*', // Allow all origins
  credentials: true, // Allow credentials (cookies)
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Length", "X-Requested-With", "X-Total-Count"]
}));

// Add preflight OPTIONS handler for all routes
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simplified logging middleware with reduced overhead
app.use((req, res, next) => {
  // Only track API requests
  if (req.path.startsWith("/api")) {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    });
  }
  next();
});

// First, start listening on the port immediately to signal Replit
// This allows the workflow to detect that the port is open
server.listen(Number(port), "0.0.0.0", () => {
  log(`Server started successfully on port ${port}`);
  console.log(`Server is running at http://0.0.0.0:${port}`);
  console.log(`READY - Server listening on port ${port}`);
});

// Serve static files from the client/dist directory
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Serve a more comprehensive landing page for the root path
app.get("/", (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Startup.ai - AI-Powered Startup Platform</title>
      <style>
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          margin: 0;
          padding: 0;
          line-height: 1.6;
          color: #333;
          background-color: #f9fafb;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        header {
          background-color: #0070f3;
          color: white;
          padding: 1.5rem 0;
          text-align: center;
        }
        h1 { 
          font-size: 2.5rem;
          margin: 0;
        }
        h2 {
          color: #0070f3;
          margin-top: 2rem;
        }
        .tagline {
          font-size: 1.2rem;
          opacity: 0.9;
        }
        .status { 
          padding: 1rem; 
          background: #e6f7ff; 
          border-left: 4px solid #0070f3; 
          margin: 1.5rem 0;
          border-radius: 0 4px 4px 0;
        }
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin: 2rem 0;
        }
        .feature {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .feature:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.1);
        }
        .feature h3 {
          color: #0070f3;
          margin-top: 0;
        }
        .button {
          display: inline-block;
          background-color: #0070f3;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
          margin-right: 1rem;
          margin-bottom: 1rem;
          transition: background-color 0.2s;
        }
        .button:hover {
          background-color: #005cc5;
        }
        .button.secondary {
          background-color: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
        }
        .button.secondary:hover {
          background-color: #e5e5e5;
        }
        .navigation {
          margin: 2rem 0;
        }
        footer {
          text-align: center;
          margin-top: 3rem;
          padding: 1.5rem 0;
          color: #666;
          border-top: 1px solid #eaeaea;
        }
      </style>
    </head>
    <body>
      <header>
        <div class="container">
          <h1>Startup.ai</h1>
          <p class="tagline">Transform your entrepreneurial ideas into actionable business strategies with AI-powered tools</p>
        </div>
      </header>
      
      <div class="container">
        <div class="status">
          <strong>✅ Status:</strong> Server is running. API routes available. Ready to help you build your startup!
        </div>
        
        <div class="navigation">
          <h2>Quick Navigation</h2>
          <a href="/auth" class="button">Login / Register</a>
          <a href="/dashboard" class="button">Dashboard</a>
          <a href="/forum" class="button">Community Forum</a>
          <a href="/health" class="button secondary">System Health</a>
          <a href="/api/info" class="button secondary">API Documentation</a>
        </div>
        
        <h2>AI-Powered Features</h2>
        <div class="features">
          <div class="feature">
            <h3>Startup Roadmap</h3>
            <p>Create a comprehensive roadmap for your startup journey with milestones and timelines.</p>
          </div>
          <div class="feature">
            <h3>Funding Strategy</h3>
            <p>Develop a customized funding strategy based on your business model and growth plans.</p>
          </div>
          <div class="feature">
            <h3>Scalability Planning</h3>
            <p>Plan for growth with AI-generated scalability strategies tailored to your industry.</p>
          </div>
          <div class="feature">
            <h3>Launch Toolkit</h3>
            <p>Get everything you need for a successful product launch, from checklists to marketing plans.</p>
          </div>
          <div class="feature">
            <h3>Legal Pack</h3>
            <p>Generate essential legal documents and compliance guidelines for your startup.</p>
          </div>
          <div class="feature">
            <h3>Marketing Plan</h3>
            <p>Create data-driven marketing strategies to reach your target audience effectively.</p>
          </div>
        </div>
        
        <h2>Getting Started</h2>
        <p>To begin using Startup.ai, register an account or log in if you already have one. Once logged in, you'll be able to create a new startup project and access all our AI-powered tools.</p>
        <a href="/auth" class="button">Get Started Now</a>
      </div>
      
      <footer>
        <div class="container">
          <p>© 2025 Startup.ai - The AI-Powered Platform for Entrepreneurs</p>
        </div>
      </footer>
    </body>
    </html>
  `);
});

// API routes should be handled by the API router
// Frontend routes should be handled by the frontend server

// Then continue with the rest of the setup asynchronously
(async () => {
  try {
    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error("Server error:", err);
    });

    // Register all API routes, passing the existing server instance
    await registerRoutes(app, server);
    
    // Add a catch-all route to handle SPA routing
    app.get('*', (req, res) => {
      // Skip API routes
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API endpoint not found' });
      }
      
      // Serve the main index.html for all other routes
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
    
    log("All routes registered successfully");
  } catch (error) {
    console.error("Failed to initialize server:", error);
  }
})();
