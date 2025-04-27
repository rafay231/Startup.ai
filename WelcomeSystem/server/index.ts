import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log } from "./vite";
import cors from "cors";
import path from "path";
import { createServer } from "http";

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

// Serve a simplified static page for the root path
app.get("/", (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>StartupLaunchpad</title>
      <style>
        body {
          font-family: system-ui, sans-serif;
          margin: 0;
          padding: 20px;
          line-height: 1.5;
          color: #333;
        }
        h1 { color: #0070f3; }
        .status { padding: 10px; background: #f0f0f0; border-left: 4px solid #0070f3; }
        .button {
          display: inline-block;
          background-color: #0070f3;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <h1>Startup.ai</h1>
      <div class="status">
        <strong>Status:</strong> Server is running. API routes available.
      </div>
      <p>Transform your entrepreneurial ideas into actionable business strategies with AI-powered tools.</p>
      <p>
        <a href="/api/test" class="button">Test API</a>
        <a href="/api/info" class="button">API Info</a>
      </p>
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
    
    log("All routes registered successfully");
  } catch (error) {
    console.error("Failed to initialize server:", error);
  }
})();
