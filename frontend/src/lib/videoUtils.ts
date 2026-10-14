/**
 * Video URL helper utilities for normalizing external video links
 * (YouTube, Vimeo, Bunny.net, direct MP4/WebM) into embeddable / playable formats.
 */

export interface NormalizedVideo {
  url: string;
  isEmbed: boolean;
  bunnyVideoId?: string;
  provider: 'youtube' | 'vimeo' | 'bunny' | 'gdrive' | 'dropbox' | 'onedrive' | 'direct' | 'unknown';
}

export function normalizeVideoUrl(rawUrl: string): NormalizedVideo {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { url: '', isEmbed: false, provider: 'unknown' };
  }

  let trimmed = rawUrl.trim();
  if (!trimmed) {
    return { url: '', isEmbed: false, provider: 'unknown' };
  }

  // 1. Raw Bunny Video GUID (e.g. "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(trimmed)) {
    return {
      url: `https://iframe.mediadelivery.net/embed/764331/${trimmed}`,
      isEmbed: true,
      bunnyVideoId: trimmed,
      provider: 'bunny',
    };
  }

  // 2. Prepend https:// if user omitted protocol (e.g. "youtube.com/watch?v=...")
  if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith('/')) {
    trimmed = `https://${trimmed}`;
  }

  // 3. YouTube Link Formats:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://m.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      url: `https://www.youtube.com/embed/${videoId}`,
      isEmbed: true,
      provider: 'youtube',
    };
  }

  // 4. Vimeo Link Formats:
  // - https://vimeo.com/123456789
  // - https://player.vimeo.com/video/123456789
  const vimeoMatch = trimmed.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const vimeoId = vimeoMatch[1];
    return {
      url: `https://player.vimeo.com/video/${vimeoId}`,
      isEmbed: true,
      provider: 'vimeo',
    };
  }

  // 5. Google Drive Video Link Formats:
  // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // - https://drive.google.com/file/d/FILE_ID/view
  // - https://drive.google.com/open?id=FILE_ID
  // - https://drive.google.com/uc?id=FILE_ID
  // Converts to Google's official embed player: https://drive.google.com/file/d/FILE_ID/preview
  const gDriveMatch = trimmed.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/i);
  if (gDriveMatch && gDriveMatch[1]) {
    const fileId = gDriveMatch[1];
    return {
      url: `https://drive.google.com/file/d/${fileId}/preview`,
      isEmbed: true,
      provider: 'gdrive',
    };
  }

  // 6. Dropbox Video Link Formats:
  // - https://www.dropbox.com/s/xyz/video.mp4?dl=0
  // Converts dl=0 to raw=1 for direct HTML5 streaming
  if (trimmed.includes('dropbox.com')) {
    const stripped = trimmed.replace(/[?&]dl=[01]/gi, '');
    const directDropboxUrl = stripped.includes('?') ? `${stripped}&raw=1` : `${stripped}?raw=1`;
    return {
      url: directDropboxUrl,
      isEmbed: false,
      provider: 'dropbox',
    };
  }

  // 7. OneDrive Embed / Share Links:
  if (trimmed.includes('onedrive.live.com') || trimmed.includes('1drv.ms')) {
    return {
      url: trimmed,
      isEmbed: true,
      provider: 'onedrive',
    };
  }

  // 8. Bunny.net Stream Play / Embed / CDN Formats:
  // - https://iframe.mediadelivery.net/play/764331/GUID
  const bunnyPlayMatch = trimmed.match(/iframe\.mediadelivery\.net\/play\/(\d+)\/([a-zA-Z0-9-]+)/i);
  if (bunnyPlayMatch) {
    const libId = bunnyPlayMatch[1];
    const vidId = bunnyPlayMatch[2];
    return {
      url: `https://iframe.mediadelivery.net/embed/${libId}/${vidId}`,
      isEmbed: true,
      bunnyVideoId: vidId,
      provider: 'bunny',
    };
  }

  // - https://iframe.mediadelivery.net/embed/764331/GUID
  const bunnyEmbedMatch = trimmed.match(/iframe\.mediadelivery\.net\/embed\/(\d+)\/([a-zA-Z0-9-]+)/i);
  if (bunnyEmbedMatch) {
    return {
      url: trimmed,
      isEmbed: true,
      bunnyVideoId: bunnyEmbedMatch[2],
      provider: 'bunny',
    };
  }

  // - https://vz-xxx.b-cdn.net/GUID/playlist.m3u8
  const bunnyBcdnMatch = trimmed.match(/b-cdn\.net\/([a-zA-Z0-9-]+)\/playlist\.m3u8/i);
  if (bunnyBcdnMatch) {
    return {
      url: `https://iframe.mediadelivery.net/embed/764331/${bunnyBcdnMatch[1]}`,
      isEmbed: true,
      bunnyVideoId: bunnyBcdnMatch[1],
      provider: 'bunny',
    };
  }

  // 9. Direct Video Files (.mp4, .webm, .ogg, .mov, /autopsy.mp4)
  const isDirectFile = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(trimmed) || trimmed.startsWith('/');
  if (isDirectFile) {
    return {
      url: trimmed,
      isEmbed: false,
      provider: 'direct',
    };
  }

  // 10. Generic embed URL (if already contains /embed/ or player. or drive.google.com/file/d/.../preview)
  const isEmbedGeneric = trimmed.includes('/embed/') || trimmed.includes('player.') || trimmed.includes('/preview');
  return {
    url: trimmed,
    isEmbed: isEmbedGeneric,
    provider: isEmbedGeneric ? 'unknown' : 'direct',
  };
}

export function isEmbedVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    url.includes('iframe.mediadelivery.net') ||
    url.includes('youtube.com/embed') ||
    url.includes('player.vimeo.com') ||
    url.includes('drive.google.com') ||
    url.includes('onedrive.live.com') ||
    url.includes('1drv.ms') ||
    url.includes('/embed/') ||
    url.includes('/preview')
  );
}

export function detectVideoProviderLabel(url: string): { label: string; color: string } | null {
  if (!url || !url.trim()) return null;
  const norm = normalizeVideoUrl(url);
  switch (norm.provider) {
    case 'gdrive':
      return { label: 'Google Drive Video', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' };
    case 'dropbox':
      return { label: 'Dropbox Video', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'onedrive':
      return { label: 'OneDrive Video', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    case 'youtube':
      return { label: 'YouTube Video', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    case 'vimeo':
      return { label: 'Vimeo Video', color: 'bg-sky-50 text-sky-700 border-sky-200' };
    case 'bunny':
      return { label: 'Bunny DRM Stream', color: 'bg-amber-50 text-amber-800 border-amber-300' };
    case 'direct':
      return { label: 'Direct Video Stream', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    default:
      return norm.isEmbed
        ? { label: 'Embed Player', color: 'bg-purple-50 text-purple-700 border-purple-200' }
        : null;
  }
}
