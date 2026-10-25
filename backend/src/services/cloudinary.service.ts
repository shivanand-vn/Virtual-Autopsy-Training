import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

let isConfigured = false;

function configureCloudinary() {
  if (!isConfigured) {
    if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
        secure: true,
        timeout: 600000, // 10 minutes timeout for media processing
      });
      isConfigured = true;
    } else {
      console.warn('Cloudinary credentials not provided in environment variables.');
    }
  }
}

export function extractPublicId(urlOrPublicId: string): string | null {
  if (!urlOrPublicId) return null;

  // If it's already a relative path or public_id without URL protocol
  if (!urlOrPublicId.startsWith('http://') && !urlOrPublicId.startsWith('https://')) {
    return urlOrPublicId.replace(/\.[^/.]+$/, '');
  }

  try {
    const uploadIdx = urlOrPublicId.indexOf('/upload/');
    if (uploadIdx === -1) return null;

    let pathAfterUpload = urlOrPublicId.substring(uploadIdx + 8);
    // Remove query parameters or hash if any
    pathAfterUpload = pathAfterUpload.split('?')[0].split('#')[0];

    // If vat-lms folder is in the path, extract directly starting from vat-lms
    const vatIdx = pathAfterUpload.indexOf('vat-lms/');
    if (vatIdx !== -1) {
      const idWithExt = pathAfterUpload.substring(vatIdx);
      return idWithExt.replace(/\.[^/.]+$/, '');
    }

    // Otherwise strip version prefix e.g. v1790682472/ and any transformation segments
    const segments = pathAfterUpload.split('/');
    const filteredSegments = segments.filter(seg => !/^v\d+$/.test(seg) && !seg.includes(','));
    const joined = filteredSegments.join('/');
    return joined.replace(/\.[^/.]+$/, '');
  } catch {
    return null;
  }
}


export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string,
  fileName: string,
  isPdf = false,
  explicitResourceType?: 'image' | 'video' | 'raw' | 'auto'
): Promise<string> {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    let resourceType: 'image' | 'video' | 'raw' | 'auto' = isPdf ? 'raw' : 'auto';
    if (explicitResourceType) {
      resourceType = explicitResourceType;
    } else if (folder.includes('video')) {
      resourceType = 'video';
    }

    const isVideo = resourceType === 'video';

    // Preserve filename extension for raw binary files (PDF, DOCX, ZIP) so Cloudinary keeps extension in URL
    const extMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? `.${extMatch[1]}` : (isPdf ? '.pdf' : '');
    const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const publicId = (isPdf || resourceType === 'raw' || folder === 'cvs') ? `${baseName}${ext}` : baseName;

    const options: any = {
      folder: `vat-lms/${folder}`,
      public_id: publicId,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: false,
      timeout: 600000, // 10 minutes timeout to prevent 'Request Timeout'
    };

    if (isVideo) {
      options.chunk_size = 6000000; // 6MB chunks for videos to stream reliably without timing out
    }

    // Optimize square face-centered crop for profile avatars
    if (!isPdf && folder === 'avatars') {
      options.transformation = [
        { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto', fetch_format: 'auto' },
      ];
    }

    const streamCallback = (error: any, result: any) => {
      if (error || !result) {
        console.error('Cloudinary upload stream error:', error);
        return reject(error || new Error('Failed to upload file to Cloudinary'));
      }
      resolve(result.secure_url);
    };

    // Use upload_chunked_stream for video files to avoid timeouts
    const uploadStream = isVideo
      ? cloudinary.uploader.upload_chunked_stream(options, streamCallback)
      : cloudinary.uploader.upload_stream(options, streamCallback);

    uploadStream.end(fileBuffer);
  });
}

/**
 * Uploads a base64 Data URI or raw base64 string to Cloudinary.
 * Returns the secure HTTPS Cloudinary CDN URL.
 * Falls back to the original string if Cloudinary credentials are missing or upload fails.
 */
export async function uploadBase64ImageToCloudinary(
  base64Data: string,
  folder: string = 'support-screenshots'
): Promise<string> {
  if (!base64Data) return base64Data;

  // If already an HTTP/HTTPS URL, return it directly
  if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
    return base64Data;
  }

  configureCloudinary();
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    console.warn('[Cloudinary] Credentials missing, falling back to raw data');
    return base64Data;
  }

  try {
    const result = await cloudinary.uploader.upload(base64Data, {
      folder: `vat-lms/${folder}`,
      resource_type: 'image',
      timeout: 60000,
    });
    return result.secure_url;
  } catch (err: any) {
    console.warn('[Cloudinary] Failed to upload base64 screenshot, falling back to raw data:', err?.message || err);
    return base64Data;
  }
}

/**
 * Diagnostic ping check for Cloudinary storage
 */
export async function verifyCloudinaryConnection(): Promise<{
  connected: boolean;
  cloudName?: string;
  error?: string;
}> {
  configureCloudinary();
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    return { connected: false, error: 'Cloudinary credentials missing' };
  }
  try {
    await cloudinary.api.ping();
    return { connected: true, cloudName: env.CLOUDINARY_CLOUD_NAME };
  } catch (err: any) {
    return { connected: false, cloudName: env.CLOUDINARY_CLOUD_NAME, error: err?.message || 'Ping failed' };
  }
}

export async function deleteFromCloudinary(
  urlOrPublicId: string,
  resourceType: 'image' | 'raw' | 'video' = 'image'
): Promise<boolean> {
  if (!urlOrPublicId) return false;

  // Only attempt deletion if it's a Cloudinary asset or local publicId
  if (urlOrPublicId.startsWith('http') && !urlOrPublicId.includes('cloudinary.com')) {
    return false;
  }

  const publicId = extractPublicId(urlOrPublicId);
  if (!publicId) return false;

  configureCloudinary();

  try {
    console.log(`🗑️ Deleting asset from Cloudinary: ${publicId}`);
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    console.log(`✅ Cloudinary deletion response for ${publicId}:`, result);
    return result.result === 'ok' || result.result === 'not found';
  } catch (err: any) {
    console.warn(`⚠️ Failed to delete Cloudinary asset (${publicId}):`, err?.message || err);
    return false;
  }
}
