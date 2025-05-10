import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 12000;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  credentials: true,
  exposedHeaders: ['Content-Length', 'X-Requested-With', 'X-Total-Count']
}));

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  const uptime = process.uptime();
  res.json({
    status: 'ok',
    uptime,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// AI demo endpoint
app.post('/api/ai/demo/analyze-idea', (req, res) => {
  const { idea } = req.body;
  
  if (!idea) {
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
    res.json(response);
  }, 1500);
});

// Fallback for all routes - serve index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'public')}`);
});