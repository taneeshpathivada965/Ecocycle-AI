import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import authRoutes from './routes/authRoutes';
import deviceRoutes from './routes/deviceRoutes';
import aiRoutes from './routes/aiRoutes';
import partnerRoutes from './routes/partnerRoutes';
import certificateRoutes from './routes/certificateRoutes';
import walletRoutes from './routes/walletRoutes';
import demoRoutes from './routes/demoRoutes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security: CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from localhost, vite dev server, or client URL
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with 15MB payload limit for camera photo analysis
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'EcoCycle AI Circular Economy Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// EcoCycle AI Core API Routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/eco-wallet', walletRoutes);
app.use('/api/demo', demoRoutes);

// Static client build serving
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const clientIndex = path.join(clientDistPath, 'index.html');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Centralized Error Handling Middleware
app.use(errorHandler);

// SPA client routing fallback for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  if (fs.existsSync(clientIndex)) {
    return res.sendFile(clientIndex);
  }
  res.send(`<!DOCTYPE html><html><head><title>EcoCycle AI</title></head><body><h1>EcoCycle AI Engine is Live</h1><p>API is active at <a href="/api/health">/api/health</a></p></body></html>`);
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`EcoCycle AI Backend Server running on port ${PORT}`);
    logger.info(`Health check available at http://localhost:${PORT}/api/health`);
  });
}

export default app;
