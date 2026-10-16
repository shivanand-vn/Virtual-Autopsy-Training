import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

/**
 * Normalizes Supabase connection pooler URLs to use transaction mode (port 6543 with pgbouncer=true).
 * This prevents idle connection drops (OS error 10054 ConnectionReset) and pool exhaustion (P1001).
 */
export function getOptimizedDatabaseUrl(): string | undefined {
  // In development, prefer DIRECT_URL if available for maximum speed and rock-solid stability
  if (process.env.NODE_ENV !== 'production' && process.env.DIRECT_URL) {
    return process.env.DIRECT_URL.trim();
  }

  const rawUrl = process.env.DATABASE_URL || env.DATABASE_URL;
  if (!rawUrl) return undefined;

  let url = rawUrl.trim();

  // If using Supabase pooler on port 5432 (session mode), switch to 6543 (transaction mode)
  if (url.includes('.pooler.supabase.com:5432')) {
    url = url.replace('.pooler.supabase.com:5432', '.pooler.supabase.com:6543');
  }

  // When connecting via pooler on port 6543, ensure pgbouncer=true is present
  if (url.includes('.pooler.supabase.com:6543') && !url.includes('pgbouncer=true')) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}pgbouncer=true`;
  }

  return url;
}

const optimizedUrl = getOptimizedDatabaseUrl();
if (optimizedUrl) {
  process.env.DATABASE_URL = optimizedUrl;
}

function createResilientPrismaClient() {
  const baseClient = new PrismaClient({
    datasources: optimizedUrl ? { db: { url: optimizedUrl } } : undefined,
    log: ['error'],
  });

  return baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          let attempts = 0;
          const maxAttempts = 3;

          while (true) {
            try {
              return await query(args);
            } catch (error: any) {
              attempts++;
              const errMsg = String(error?.message || '');
              const errCode = String(error?.code || '');

              const isTransientConnectionError =
                errCode === 'P1001' || // Can't reach database server
                errCode === 'P1017' || // Server has closed the connection
                errCode === 'P1002' || // Database server was reached but timed out
                errMsg.includes('10054') ||
                errMsg.includes('ConnectionReset') ||
                errMsg.includes('Connection closed') ||
                errMsg.includes('forcibly closed') ||
                errMsg.includes('Connection lost') ||
                errMsg.includes('socket has been ended') ||
                errMsg.includes('ECONNRESET');

              if (isTransientConnectionError && attempts < maxAttempts) {
                const backoffMs = attempts * 500;
                console.warn(
                  `[Prisma Resilience] Reconnecting after transient DB issue on ${model}.${operation} (attempt ${attempts}/${maxAttempts}, retrying in ${backoffMs}ms)...`
                );
                await new Promise((resolve) => setTimeout(resolve, backoffMs));
                continue;
              }

              throw error;
            }
          }
        },
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createResilientPrismaClient>;

const globalForPrisma = global as unknown as { prisma: ExtendedPrismaClient };

export const prisma: ExtendedPrismaClient =
  globalForPrisma.prisma || createResilientPrismaClient();

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
