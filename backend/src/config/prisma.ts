import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
