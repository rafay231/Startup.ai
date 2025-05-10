import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 12001;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  credentials: true,
  exposedHeaders: ['Content-Length', 'X-Requested-With', 'X-Total-Count']
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const uptime = process.uptime();
  console.log(`Health check requested at ${new Date().toISOString()}`);
  res.json({
    status: 'ok',
    uptime,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    server: 'second-server'
  });
});

// Root endpoint for basic testing
app.get('/', (req, res) => {
  console.log(`Root endpoint requested at ${new Date().toISOString()}`);
  res.send(`
    <html>
      <head>
        <title>Startup.ai - Server Status (Second Server)</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #0070f3; }
          .card { border: 1px solid #eaeaea; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
          .success { color: green; }
          .button { background-color: #0070f3; color: white; border: none; padding: 10px 20px; 
                   border-radius: 4px; cursor: pointer; font-size: 16px; text-decoration: none; display: inline-block; }
          .button:hover { background-color: #0051a8; }
        </style>
      </head>
      <body>
        <h1>Startup.ai Server (Second Instance)</h1>
        <div class="card">
          <h2>Server Status: <span class="success">Running</span></h2>
          <p>Server is running on port ${PORT}</p>
          <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
          <p>Server Time: ${new Date().toISOString()}</p>
          <p>Uptime: ${process.uptime().toFixed(2)} seconds</p>
        </div>
        <div class="card">
          <h2>Available Endpoints</h2>
          <ul>
            <li><a href="/api/health">/api/health</a> - Health check endpoint</li>
            <li><a href="/ai-demo.html">/ai-demo.html</a> - AI Demo page</li>
          </ul>
        </div>
        <a href="/ai-demo.html" class="button">Try AI Demo</a>
      </body>
    </html>
  `);
});

// AI demo endpoint
app.post('/api/ai/demo/analyze-idea', (req, res) => {
  console.log('AI demo endpoint requested:', req.body);
  const { idea } = req.body;
  
  if (!idea) {
    console.log('Error: Idea is required');
    return res.status(400).json({ error: 'Idea is required' });
  }
  
  // Mock response for demo purposes
  const response = {
    analysis: {
      strengths: [
        "Innovative concept with potential market appeal",
        "Addresses a clear pain point in the target market",
        "Scalable business model with multiple revenue streams"
      ],
      weaknesses: [
        "Potential regulatory challenges in certain markets",
        "High initial development costs",
        "Requires significant user adoption to be successful"
      ],
      opportunities: [
        "Growing market demand for this type of solution",
        "Potential for strategic partnerships with established companies",
        "International expansion possibilities"
      ],
      threats: [
        "Established competitors with market share",
        "Rapidly evolving technology landscape",
        "Economic uncertainties affecting investment climate"
      ]
    },
    recommendations: [
      "Focus on a specific niche market initially to validate the concept",
      "Develop a minimum viable product (MVP) to test with early adopters",
      "Secure intellectual property protection where applicable",
      "Build a strong advisory board with industry expertise",
      "Create a detailed financial model with realistic projections"
    ],
    marketPotential: {
      targetMarketSize: "$2.5B - $3.8B globally",
      growthRate: "12-15% annually",
      keyCompetitors: ["Competitor A", "Competitor B", "Competitor C"],
      entryBarriers: "Medium to High",
      timeToMarket: "6-12 months for MVP"
    }
  };
  
  // Add a slight delay to simulate AI processing
  setTimeout(() => {
    console.log('Sending AI demo response');
    res.json(response);
  }, 500);
});

// Add a test endpoint that returns plain text
app.get('/test', (req, res) => {
  console.log('Test endpoint requested');
  res.send('Second server is working correctly');
});

// Fallback for all routes - serve index.html for SPA routing
app.get('*', (req, res) => {
  console.log(`Fallback route requested: ${req.path}`);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Second server running on port ${PORT}`);
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'public')}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});