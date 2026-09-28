import crypto from 'crypto';
import { env } from '../config/env.js';

/**
 * Generate a secure, time-expiring Bunny.net Stream token for HLS video playback & iframe embed.
 * According to Bunny.net SHA256 Token Authentication specification:
 * SHA256(securityKey + videoId + expires)
 */
export function generateBunnyStreamToken(
  videoId: string,
  expiresInSeconds = 7200 // 2 hours
): { streamUrl: string; embedUrl: string; expiresAt: number; token: string } {
  const securityKey = env.BUNNY_STREAM_TOKEN_KEY || 'dev_dummy_key';
  const pullZone = env.BUNNY_STREAM_PULL_ZONE || 'vz-6c065033-dcc.b-cdn.net';
  const libraryId = env.BUNNY_STREAM_LIBRARY_ID || '764331';

  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;

  // Format: SHA256(securityKey + videoId + expires)
  const hashString = `${securityKey}${videoId}${expires}`;
  const token = crypto.createHash('sha256').update(hashString).digest('hex');

  // Direct HLS playlist URL (for custom video players with floating watermarks)
  const streamUrl = `https://${pullZone}/${videoId}/playlist.m3u8?token=${token}&expires=${expires}`;

  // Responsive Bunny Embed Player URL (with built-in DRM protection & player controls)
  const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}&autoplay=false`;

  return {
    streamUrl,
    embedUrl,
    expiresAt: expires,
    token,
  };
}

/**
 * Create a new video entry in Bunny Stream library via REST API
 */
export async function createBunnyVideo(title: string): Promise<string> {
  const libraryId = env.BUNNY_STREAM_LIBRARY_ID;
  const apiKey = env.BUNNY_STREAM_API_KEY;

  if (!libraryId || !apiKey) {
    throw new Error('Bunny Stream Library ID or API Key is missing in environment variables');
  }

  const response = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
    method: 'POST',
    headers: {
      AccessKey: apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create video entry in Bunny Stream: ${errorText}`);
  }

  const data = (await response.json()) as { guid: string };
  return data.guid;
}

/**
 * Upload binary video buffer to Bunny Stream
 */
export async function uploadBunnyVideoBuffer(videoId: string, videoBuffer: Buffer): Promise<void> {
  const libraryId = env.BUNNY_STREAM_LIBRARY_ID;
  const apiKey = env.BUNNY_STREAM_API_KEY;

  if (!libraryId || !apiKey) {
    throw new Error('Bunny Stream Library ID or API Key is missing in environment variables');
  }

  const response = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
    method: 'PUT',
    headers: {
      AccessKey: apiKey,
      'Content-Type': 'application/octet-stream',
    },
    body: videoBuffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload video stream to Bunny.net: ${errorText}`);
  }
}
