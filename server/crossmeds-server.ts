import express from 'express';
import { createServer } from 'vite';
import path from 'path';

const app = express();

// Basic CORS and security headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

async function startCrossMeds() {
  try {
    // Create Vite server for CrossMeds
    const vite = await createServer({
      server: { middlewareMode: true },
      root: path.resolve('crossmeds'),
      appType: 'spa'
    });

    // Use vite's connect instance as middleware
    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);

    const port = parseInt(process.env.PORT || '5000');
    
    app.listen(port, '0.0.0.0', () => {
      console.log(`🏥 CrossMeds running on port ${port}`);
      console.log(`🌐 Access: http://localhost:${port}`);
    });

  } catch (error) {
    console.error('Failed to start CrossMeds:', error);
    process.exit(1);
  }
}

startCrossMeds();