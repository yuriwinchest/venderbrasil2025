import express from 'express';
import { createServer } from 'http';
import { setupVite, serveStatic, log } from './vite';
import { storage } from './storage';

const PORT = parseInt(process.env.PORT || '5000');
const isDev = process.env.NODE_ENV !== 'production';

async function startServer() {
  const app = express();
  
  // Basic middleware
  app.use(express.json());
  
  // API Routes - imported inline to avoid circular dependencies
  const { registerRoutes } = await import('./routes');
  
  // Create HTTP server
  const server = createServer(app);
  
  // Register routes BEFORE Vite middleware
  // This ensures API routes are handled before Vite catches all requests
  await registerRoutes(app);
  
  // Setup Vite for development or serve static files for production
  if (isDev) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  
  // Start server
  server.listen(PORT, '0.0.0.0', () => {
    log(`Server running on port ${PORT} in ${isDev ? 'development' : 'production'} mode`);
  });
}

startServer().catch(console.error);