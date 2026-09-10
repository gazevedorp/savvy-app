import { MediaMetadata } from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';

const MEDIA_CACHE_KEY = 'media_metadata';

type MediaCache = Record<string, MediaMetadata>;

export async function saveCachedMediaMetadata(
  linkId: string,
  metadata: MediaMetadata | null | undefined
): Promise<void> {
  if (!linkId || !metadata) return;
  try {
    const cache = (await loadFromStorage<MediaCache>(MEDIA_CACHE_KEY)) || {};
    cache[linkId] = metadata;
    await saveToStorage(MEDIA_CACHE_KEY, cache);
  } catch (error) {
    console.warn('Failed to cache media metadata:', error);
  }
}

export async function loadCachedMediaMetadata(linkId: string): Promise<MediaMetadata | null> {
  if (!linkId) return null;
  try {
    const cache = (await loadFromStorage<MediaCache>(MEDIA_CACHE_KEY)) || {};
    return cache[linkId] || null;
  } catch (error) {
    console.warn('Failed to load cached media metadata:', error);
    return null;
  }
}

export async function mergeCachedMetadata<T extends { id?: string; metadata?: MediaMetadata | null }>(
  links: T[]
): Promise<T[]> {
  try {
    const cache = (await loadFromStorage<MediaCache>(MEDIA_CACHE_KEY)) || {};
    return links.map((link) => {
      if (link.metadata || !link.id) return link;
      const cached = cache[link.id];
      return cached ? { ...link, metadata: cached } : link;
    });
  } catch {
    return links;
  }
}
