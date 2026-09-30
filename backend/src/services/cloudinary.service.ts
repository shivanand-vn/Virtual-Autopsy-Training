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

    const options: any = {
      folder: `vat-lms/${folder}`,
      public_id: fileName.replace(/\.[^/.]+$/, ''),
      resource_type: resourceType,
      use_filename: true,
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
