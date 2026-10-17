import { Redis } from 'ioredis';
import { env } from '../config/env.js';

let redisClient: Redis | null = null;
let isConnected = false;
let isConnecting = false;

// In-memory fallback cache in case Redis is temporarily disconnected or unreachable
const memoryFallback = new Map<string, { value: any; expiry: number }>();

function cleanMemoryFallback() {
  const now = Date.now();
  for (const [key, item] of memoryFallback.entries()) {
    if (now > item.expiry) {
      memoryFallback.delete(key);
    }
  }
}
setInterval(cleanMemoryFallback, 60000).unref();

export function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  const rawUrl = process.env.REDIS_URL || env.REDIS_URL;
  if (!rawUrl || rawUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
    return null;
  }

  try {
    const isTls = rawUrl.startsWith('rediss://');
    redisClient = new Redis(rawUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      enableReadyCheck: true,
      retryStrategy(times) {
        if (times > 10) return null; // stop retrying after 10 failed attempts
        return Math.min(times * 200, 3000);
      },
      ...(isTls ? { tls: { rejectUnauthorized: false } } : {}),
    });

    redisClient.on('connect', () => {
      isConnected = true;
      console.log('  Redis Cache : Connected to Upstash Redis (Ready)');
    });

    redisClient.on('ready', () => {
      isConnected = true;
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      // Do not spam console with repeated reconnect errors
      if (process.env.DEBUG_REDIS) {
        console.warn('[Redis] Connection warning:', err.message);
      }
    });

    redisClient.on('close', () => {
      isConnected = false;
    });

    // Initiate lazy connection without blocking process boot
    if (!isConnecting) {
      isConnecting = true;
      redisClient.connect().catch((err) => {
        isConnected = false;
        console.warn('  Redis Cache : Upstash Redis warmup warning (will fallback gracefully):', err.message);
      });
    }

    return redisClient;
  } catch (err: any) {
    console.warn('[Redis Init] Failed to initialize Redis client, using in-memory fallback:', err?.message || err);
    return null;
  }
}

export function isRedisConnected(): boolean {
  return isConnected && redisClient !== null;
}

/**
 * Retrieve cached JSON value by key
 */
export async function cacheGet<T = any>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (client && isConnected) {
    try {
      const data = await client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch {
      // Fall through to memory fallback
    }
  }

  // Memory fallback
  const memItem = memoryFallback.get(key);
  if (memItem && Date.now() < memItem.expiry) {
    return memItem.value as T;
  }
  return null;
}

/**
 * Store JSON value in cache with optional TTL in seconds (default: 3600s / 1 hour)
 */
export async function cacheSet(key: string, value: any, ttlSeconds = 3600): Promise<boolean> {
  const stringified = JSON.stringify(value);

  // Set in memory fallback
  memoryFallback.set(key, {
    value,
    expiry: Date.now() + ttlSeconds * 1000,
  });

  const client = getRedisClient();
  if (client && isConnected) {
    try {
      if (ttlSeconds > 0) {
        await client.set(key, stringified, 'EX', ttlSeconds);
      } else {
        await client.set(key, stringified);
      }
      return true;
    } catch {
      return false;
    }
  }

  return true;
}

/**
 * Remove specific cache key
 */
export async function cacheDel(key: string): Promise<boolean> {
  memoryFallback.delete(key);
  const client = getRedisClient();
  if (client && isConnected) {
    try {
      await client.del(key);
      return true;
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * Invalidate all keys matching a prefix pattern
 */
export async function cacheDelByPrefix(prefix: string): Promise<void> {
  // Clear from memory fallback
  for (const k of memoryFallback.keys()) {
    if (k.startsWith(prefix)) {
      memoryFallback.delete(k);
    }
  }

  const client = getRedisClient();
  if (client && isConnected) {
    try {
      const keys = await client.keys(`${prefix}*`);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch {
      // Ignore Redis pattern errors
    }
  }
}

/**
 * Diagnostic ping check for Health Check endpoint
 */
export async function verifyRedisConnection(): Promise<{
  connected: boolean;
  provider: string;
  latencyMs?: number;
  error?: string;
}> {
  const client = getRedisClient();
  if (!client) {
    return {
      connected: false,
      provider: 'Upstash Redis',
      error: 'REDIS_URL not configured or inactive',
    };
  }

  const start = Date.now();
  try {
    await client.ping();
    const latencyMs = Date.now() - start;
    return {
      connected: true,
      provider: 'Upstash Redis',
      latencyMs,
    };
  } catch (err: any) {
    return {
      connected: false,
      provider: 'Upstash Redis',
      error: err?.message || 'Redis ping failed',
    };
  }
}
