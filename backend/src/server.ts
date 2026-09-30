import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';

const app = createApp();

// Warm up database connection on server boot (handles Supabase cold-start)
prisma.$connect()
  .then(() => console.log('  Database    : Connected to Supabase PostgreSQL (Ready)'))
  .catch((err) => console.warn('  Database    : Supabase warmup warning (will retry on query):', err.message));

const server = app.listen(env.PORT, () => {
  console.log(`
  ======================================================
  Virtual Autopsy Online Training LMS - Backend API
  ======================================================
  Environment : ${env.NODE_ENV}
  Server URL  : http://localhost:${env.PORT}
  API Base    : http://localhost:${env.PORT}/api
  Health Check: http://localhost:${env.PORT}/api/health
  Frontend    : ${env.FRONTEND_URL}
  ======================================================
  `);
});

// Configure 10-minute timeouts on the HTTP server to support large video and asset uploads
server.setTimeout(10 * 60 * 1000);
server.headersTimeout = 10 * 60 * 1000 + 10000;
server.requestTimeout = 10 * 60 * 1000;

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason: any) => {
  console.error('[Process] Unhandled Promise Rejection (server kept alive):', reason?.message || reason);
});

process.on('uncaughtException', (err: Error) => {
  console.error('[Process] Uncaught Exception (server kept alive):', err.message);
});
