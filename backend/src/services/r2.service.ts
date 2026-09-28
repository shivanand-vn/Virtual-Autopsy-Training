import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';

let s3Client: S3Client | null = null;

function getClient(): S3Client {
  if (!s3Client) {
    if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_R2_ACCESS_KEY_ID || !env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
      console.warn('Cloudflare R2 credentials not fully configured. Using mock storage client.');
    }

    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID || 'dummy'}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID || 'dummy',
        secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || 'dummy',
      },
    });
  }
  return s3Client;
}

export async function uploadToR2(
  fileBuffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const client = getClient();
  const command = new PutObjectCommand({
    Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await client.send(command);

  // Return public or CDN URL if configured, otherwise key identifier
  if (env.CLOUDFLARE_R2_PUBLIC_DOMAIN) {
    return `${env.CLOUDFLARE_R2_PUBLIC_DOMAIN}/${key}`;
  }
  return `/api/files/${key}`;
}

export async function getSignedDownloadUrl(
  key: string,
  downloadFilename: string,
  expiresInSeconds = 3600
): Promise<string> {
  const client = getClient();
  const command = new GetObjectCommand({
    Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${downloadFilename}"`,
  });

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

export async function getObjectStream(key: string) {
  const client = getClient();
  const command = new GetObjectCommand({
    Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: key,
  });

  return client.send(command);
}
