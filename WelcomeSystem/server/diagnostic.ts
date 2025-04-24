import express from "express";

// Create a completely standalone, minimal Express server for testing
const app = express();

// Simple ping endpoint
app.get("/ping", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Diagnostic server is up and running",
    timestamp: new Date().toISOString()
  });
});

// Service status info
app.get("/info", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString()
  });
});

// Basic HTML page for human visitors
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Diagnostic Server</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          margin: 0;
          padding: 0;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        h1 {
          color: #0070f3;
        }
        .card {
          background-color: #f8f9fa;
          border-radius: 10px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .endpoints {
          margin-top: 2rem;
        }
        .endpoint {
          background-color: #e6f7ff;
          padding: 1rem;
          border-radius: 5px;
          margin-bottom: 0.5rem;
        }
        .endpoint p {
          margin: 0;
        }
        .button {
          display: inline-block;
          background-color: #0070f3;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          text-decoration: none;
          margin-top: 1rem;
        }
      </style>
    </head>
    <body>
      <h1>Diagnostic Server</h1>
      <div class="card">
        <p>This is a simplified diagnostic server for the StartupLaunchpad application.</p>
        <p>Current time: ${new Date().toLocaleString()}</p>
        <p>Environment: ${process.env.NODE_ENV || "development"}</p>
        <p>Node version: ${process.version}</p>
        <a href="/info" class="button">View Server Info</a>
      </div>
      
      <div class="endpoints">
        <h2>Available Endpoints</h2>
        <div class="endpoint">
          <p><strong>GET /</strong> - This page</p>
        </div>
        <div class="endpoint">
          <p><strong>GET /ping</strong> - Simple health check</p>
        </div>
        <div class="endpoint">
          <p><strong>GET /info</strong> - Server information</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Fallback route
app.use("*", (req, res) => {
  res.redirect("/");
});

// Start the server on a different port to avoid conflicts
const port = process.env.DIAG_PORT || 3000;
app.listen(Number(port), "0.0.0.0", () => {
  console.log(`Diagnostic server running at http://0.0.0.0:${port}`);
  console.log(`READY - Server listening on port ${port}`);
});