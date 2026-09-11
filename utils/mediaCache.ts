import { MediaMetadata } from '@/types';
import { supabase } from '@/lib/supabase';
import { loadFromStorage, removeFromStorage } from '@/utils/storage';

export const MEDIA_CACHE_KEY = 'media_metadata';

type MediaCache = Record<string, MediaMetadata>;

async function loadCache(): Promise<MediaCache> {
  try {
    return (await loadFromStorage<MediaCache>(MEDIA_CACHE_KEY)) || {};
  } catch (error) {
    console.warn('Failed to load leftover media cache:', error);
    return {};
  }
}

export async function clearMediaCache(): Promise<void> {
  try {
    await removeFromStorage(MEDIA_CACHE_KEY);
  } catch (error) {
    console.warn('Failed to clear leftover media cache:', error);
  }
}

/**
 * One-shot import of pre-Phase-D AsyncStorage metadata into `links.metadata`.
 * After the pass the device cache is cleared (accepted loss: rows that failed
 * to update, and cache keys with no matching link).
 */
export async function importLeftoverMediaCache<
  T extends { id?: string; metadata?: MediaMetadata | null },
>(links: T[]): Promise<T[]> {
  const cache = await loadCache();
  const entries = Object.entries(cache).filter(([, meta]) => !!meta);
  if (entries.length === 0) {
    await clearMediaCache();
    return links;
  }

  const byId = new Map(entries);
  const next = links.map((link) => ({ ...link }));

  for (const link of next) {
    if (!link.id || link.metadata) {
      byId.delete(link.id || '');
      continue;
    }
    const cached = byId.get(link.id);
    if (!cached) continue;

    const { error } = await supabase
      .from('links')
      .update({ metadata: cached })
      .eq('id', link.id);

    if (error) {
      console.warn('Failed to import cached metadata for', link.id, error);
      continue;
    }

    link.metadata = cached;
    byId.delete(link.id);
  }

  // Drop leftovers (deleted links, failed-or-not) so AsyncStorage is not SoT.
  await clearMediaCache();
  return next;
}
