import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z
    .string()
    .optional()
    .transform((val) => {
      const raw =
        (val && val.trim()) ||
        process.env.FRONTEND_URL ||
        process.env.UI_URL ||
        process.env.CLIENT_URL ||
        process.env.APP_URL ||
        process.env.VERCEL_URL ||
        process.env.UI_LINK ||
        (process.env.NODE_ENV === 'production'
          ? 'https://virtual-autopsy-training.vercel.app'
          : 'http://localhost:5173');

      let clean = raw.trim().replace(/\/+$/, '');
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = `https://${clean}`;
      }
      return clean;
    })
    .default('http://localhost:5173'),

  // Auth & Cookies
  JWT_SECRET: z.string().min(16).default('vat_jwt_super_secret_dev_key_change_in_production_9988776655'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(16).default('vat_cookie_secret_dev_key_change_in_production_1122334455'),

  // Database
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/vat_lms?schema=public'),
  DIRECT_URL: z.string().optional(),

  // Cloudflare R2
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().optional(),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().optional(),
  CLOUDFLARE_R2_BUCKET_NAME: z.string().default('vat-lms-files'),
  CLOUDFLARE_R2_PUBLIC_DOMAIN: z.string().optional(),

  // Cloudinary File & Image Storage
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_URL: z.string().optional(),

  // Bunny.net Stream
  BUNNY_STREAM_LIBRARY_ID: z.string().optional(),
  BUNNY_STREAM_API_KEY: z.string().optional(),
  BUNNY_STREAM_TOKEN_KEY: z.string().optional(),
  BUNNY_STREAM_PULL_ZONE: z.string().optional(),

  // Brevo Email
  BREVO_API_KEY: z.string().optional(),
  BREVO_SENDER_EMAIL: z.string().default('admin@virtualautopsylms.com'),
  BREVO_SENDER_NAME: z.string().default('Virtual Autopsy LMS'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
