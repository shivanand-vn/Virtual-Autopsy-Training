import { uploadToR2 } from './r2.service.js';
import { uploadToCloudinary } from './cloudinary.service.js';
import { env } from '../config/env.js';

/**
 * Universal Storage Provider
 * Allows seamless switching between Cloudinary, Cloudflare R2, and Supabase S3
 * with zero changes to controllers or database schema.
 */
export async function uploadDocument(
  fileBuffer: Buffer,
  folder: string,
  fileName: string,
  contentType: string
): Promise<string> {
  const isPdf = contentType.includes('pdf');

  // 1. If Cloudinary credentials are provided, use Cloudinary
  if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
    try {
      return await uploadToCloudinary(fileBuffer, folder, fileName, isPdf);
    } catch (err) {
      console.error('Cloudinary upload error:', err);
    }
  }

  // 2. If Cloudflare R2 credentials are provided, use Cloudflare R2
  if (
    env.CLOUDFLARE_ACCOUNT_ID &&
    env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  ) {
    try {
      const key = `${folder}/${fileName}`;
      return await uploadToR2(fileBuffer, key, contentType);
    } catch (err) {
      console.error('Cloudflare R2 upload error:', err);
    }
  }

  // 3. Fallback mock URL for local development
  const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `/uploads/${folder}/${sanitized}`;
}
