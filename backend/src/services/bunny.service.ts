import crypto from 'crypto';
import { env } from '../config/env.js';

/**
 * Generate a secure, time-expiring Bunny.net Stream token for HLS video playback
 * According to Bunny.net SHA256 Token Authentication specification.
 */
export function generateBunnyStreamToken(
  videoId: string,
  expiresInSeconds = 7200 // 2 hours
): { streamUrl: string; expiresAt: number; token: string } {
  const securityKey = env.BUNNY_STREAM_TOKEN_KEY || 'dev_dummy_key';
  const pullZone = env.BUNNY_STREAM_PULL_ZONE || 'vz-dummy.b-cdn.net';
  
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  
  // Format: SHA256(securityKey + videoId + expires)
  const hashString = `${securityKey}${videoId}${expires}`;
  const token = crypto.createHash('sha256').update(hashString).digest('hex');

  const streamUrl = `https://${pullZone}/${videoId}/playlist.m3u8?token=${token}&expires=${expires}`;

  return {
    streamUrl,
    expiresAt: expires,
    token,
  };
}
