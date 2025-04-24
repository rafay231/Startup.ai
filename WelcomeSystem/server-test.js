import express from 'express';
const app = express();
const port = process.env.PORT || 5000;

// Signal startup
console.log(`Starting test server on port ${port}...`);

// Minimal route
app.get('/', (req, res) => {
  res.send('Server is running');
});

app.get('/api/test', (req, res) => {
  res.json({ message: 'API test successful', timestamp: new Date().toISOString() });
});

// Start server immediately
app.listen(port, '0.0.0.0', () => {
  console.log(`Test server is running at http://0.0.0.0:${port}`);
  console.log(`READY - Server listening on port ${port}`);
});