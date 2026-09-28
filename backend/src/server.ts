import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

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

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
