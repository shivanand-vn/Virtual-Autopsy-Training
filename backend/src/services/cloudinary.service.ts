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
      });
      isConfigured = true;
    } else {
      console.warn('Cloudinary credentials not provided in environment variables.');
    }
  }
}

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string,
  fileName: string,
  isPdf = false
): Promise<string> {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    // Cloudinary treats PDFs as raw or auto depending on use-case
    const resourceType = isPdf ? 'raw' : 'auto';

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `vat-lms/${folder}`,
        public_id: fileName.replace(/\.[^/.]+$/, ''), // Strip extension
        resource_type: resourceType,
        use_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Failed to upload file to Cloudinary'));
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
}
