import { Link, MediaMetadata, normalizeLinkType } from '@/types';

export const SAVE_LINK_RPC = 'save_link_with_categories';

export type SaveLinkPayload = Record<string, unknown>;

/**
 * JSON payload for public.save_link_with_categories.
 * Include `category_ids` only when joins should be rewritten in the same transaction.
 */
export function buildSaveLinkPayload(
  data: Partial<Link>,
  options: { id?: string; replaceCategories: boolean }
): SaveLinkPayload {
  const payload: SaveLinkPayload = {};

  if (options.id) payload.id = options.id;
  if (data.url !== undefined) payload.url = data.url;
  if (data.title !== undefined) payload.title = data.title;
  if (data.description !== undefined) payload.description = data.description ?? null;
  if (data.thumbnail !== undefined) payload.thumbnail = data.thumbnail ?? null;
  if (data.type !== undefined) payload.type = normalizeLinkType(data.type);
  if (data.metadata !== undefined) payload.metadata = data.metadata ?? null;
  if (data.is_read !== undefined) payload.is_read = data.is_read;
  if (data.read_at !== undefined) payload.read_at = data.read_at ?? null;
  if (data.progress !== undefined) payload.progress = data.progress;

  if (options.replaceCategories) {
    payload.category_ids = data.categoryIds ?? [];
  }

  return payload;
}

type LinkRow = {
  id?: string;
  url?: string;
  title?: string;
  description?: string | null;
  thumbnail?: string | null;
  type?: string;
  user_id?: string;
  created_at?: string;
  is_read?: boolean;
  read_at?: string | null;
  progress?: number;
  metadata?: MediaMetadata | null;
  category_ids?: string[] | null;
  categoryIds?: string[];
  link_categories?: { category_id: string }[] | null;
};

export function categoryIdsFromRow(row: LinkRow, fallback?: string[]): string[] {
  if (Array.isArray(row.category_ids)) return row.category_ids.filter(Boolean);
  if (Array.isArray(row.categoryIds)) return row.categoryIds.filter(Boolean);
  if (Array.isArray(row.link_categories)) {
    return row.link_categories.map((join) => join.category_id).filter(Boolean);
  }
  return fallback ?? [];
}

export function mapLinkRecord(row: LinkRow, categoryIds?: string[]): Link {
  return {
    id: row.id,
    url: row.url || '',
    title: row.title || '',
    description: row.description ?? undefined,
    thumbnail: row.thumbnail ?? undefined,
    type: normalizeLinkType(row.type),
    categoryIds: categoryIdsFromRow(row, categoryIds),
    user_id: row.user_id,
    created_at: row.created_at,
    is_read: row.is_read,
    read_at: row.read_at ?? undefined,
    progress: row.progress,
    metadata: (row.metadata as MediaMetadata | null) || null,
  };
}
