export const SAVVY_IMAGES_BUCKET = 'savvy-images';

const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif']);

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
};

export function isUploadableImageUri(uri: string | null | undefined): boolean {
  if (!uri) return false;
  return /^(file:|content:|ph:|assets-library:|blob:|data:image)/i.test(uri.trim());
}

export function isRemoteHttpUrl(uri: string | null | undefined): boolean {
  if (!uri) return false;
  return /^https?:\/\//i.test(uri.trim());
}

export function extensionFromUri(uri: string): string {
  const cleaned = uri.split('?')[0].split('#')[0];
  const match = cleaned.match(/\.([a-z0-9]+)$/i);
  const ext = match?.[1]?.toLowerCase();
  if (ext && IMAGE_EXT.has(ext)) return ext === 'jpeg' ? 'jpg' : ext;
  if (uri.startsWith('data:image/')) {
    const mime = uri.slice('data:'.length).split(';')[0];
    const fromMime = mime.split('/')[1]?.toLowerCase();
    if (fromMime && IMAGE_EXT.has(fromMime)) return fromMime === 'jpeg' ? 'jpg' : fromMime;
  }
  return 'jpg';
}

export function contentTypeForExtension(ext: string): string {
  return MIME_BY_EXT[ext.toLowerCase()] || 'image/jpeg';
}

export function storagePathFromPublicUrl(
  url: string,
  bucket = SAVVY_IMAGES_BUCKET
): string | null {
  const markers = [
    `/storage/v1/object/public/${bucket}/`,
    `/storage/v1/object/sign/${bucket}/`,
  ];
  for (const marker of markers) {
    const idx = url.indexOf(marker);
    if (idx === -1) continue;
    const path = decodeURIComponent(url.slice(idx + marker.length).split('?')[0]);
    return path || null;
  }
  return null;
}
