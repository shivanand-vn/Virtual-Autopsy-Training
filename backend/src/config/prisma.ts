import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

/**
 * Normalizes Supabase connection pooler URLs to use transaction mode (port 6543 with pgbouncer=true).
 * This prevents idle connection drops (OS error 10054 ConnectionReset) and pool exhaustion (P1001).
 */
export function getOptimizedDatabaseUrl(): string | undefined {
  const isCloudOrProd =
    process.env.RENDER === 'true' ||
    !!process.env.RENDER_SERVICE_ID ||
    process.env.NODE_ENV === 'production' ||
    env.NODE_ENV === 'production';

  // Only use DIRECT_URL strictly in local machine development (where IPv6 and direct port 5432 are supported and not on Render)
  if (!isCloudOrProd && process.env.DIRECT_URL) {
    return process.env.DIRECT_URL.trim();
  }

  const rawUrl = process.env.DATABASE_URL || env.DATABASE_URL || process.env.DIRECT_URL;
  if (!rawUrl) return undefined;

  let url = rawUrl.trim();

  // If a direct Supabase host (db.[ref].supabase.co) is detected in production,
  // automatically adapt to the IPv4 transaction pooler because Render Free Tier lacks IPv6 outbound
  if (url.includes('.supabase.co')) {
    const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@db\.([a-z0-9]+)\.supabase\.co(?::\d+)?\/(.+)$/i);
    if (match) {
      const [, origUser, password, projectRef, dbNameAndQuery] = match;
      const cleanDbName = dbNameAndQuery.split('?')[0] || 'postgres';
      const poolerUser = origUser.includes('.') ? origUser : `${origUser}.${projectRef}`;
      const poolerHost = process.env.SUPABASE_POOLER_HOST || 'aws-0-ap-northeast-1.pooler.supabase.com';
      url = `postgresql://${poolerUser}:${password}@${poolerHost}:6543/${cleanDbName}?pgbouncer=true&sslmode=require&connection_limit=5&connect_timeout=5`;
      console.log(`[Prisma Config] Automatically adapted direct Supabase URL to IPv4 Transaction Pooler for project ${projectRef}`);
      return url;
    }
  }

  // If using Supabase pooler on port 5432 (session mode), switch to 6543 (transaction mode)
  if (url.includes('.pooler.supabase.com:5432')) {
    url = url.replace('.pooler.supabase.com:5432', '.pooler.supabase.com:6543');
  }

  // When connecting via pooler on port 6543, ensure pgbouncer=true is present
  if (url.includes('.pooler.supabase.com:6543') && !url.includes('pgbouncer=true')) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}pgbouncer=true`;
  }

  // Ensure sslmode=require is present for Supabase pooler
  if (url.includes('.pooler.supabase.com') && !url.includes('sslmode=')) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}sslmode=require`;
  }

  // Ensure connection_limit is set to prevent pool exhaustion on Render free tier
  if (url.includes('.pooler.supabase.com') && !url.includes('connection_limit=')) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}connection_limit=5`;
  }

  // Ensure connect_timeout is fast (5s) so failed connections fail fast rather than hanging clients
  if (url.includes('.pooler.supabase.com') && !url.includes('connect_timeout=')) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}connect_timeout=5`;
  }

  return url;
}

const isCloudOrProd =
  process.env.RENDER === 'true' ||
  !!process.env.RENDER_SERVICE_ID ||
  process.env.NODE_ENV === 'production' ||
  env.NODE_ENV === 'production';

const optimizedUrl = getOptimizedDatabaseUrl();
if (optimizedUrl) {
  process.env.DATABASE_URL = optimizedUrl;
  if (isCloudOrProd) {
    // Overwrite DIRECT_URL with the IPv4 pooler URL so Prisma never tries to reach db.*.supabase.co via IPv6
    process.env.DIRECT_URL = optimizedUrl;
  }
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
          const maxAttempts = 2; // Fail fast rather than stacking multiple 15-second timeouts

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
                const backoffMs = 300;
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
