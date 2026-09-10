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

/**
 * Gap-fill only: rows that already have `metadata` from Supabase keep it.
 * AsyncStorage is not the primary path after Phase C (`links.metadata` JSONB).
 * Phase D can delete this helper once every environment is migrated.
 */
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
