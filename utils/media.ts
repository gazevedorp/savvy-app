import { Link, LinkType, MediaMetadata } from '@/types';

export const MEDIA_TYPES: LinkType[] = ['music', 'movie'];

export function isMediaType(type: LinkType | string | undefined): type is 'music' | 'movie' {
  return type === 'music' || type === 'movie';
}

export function getTypeLabel(type: LinkType | string | undefined): string {
  switch (type) {
    case 'video':
      return 'Vídeo';
    case 'image':
      return 'Imagem';
    case 'music':
      return 'Música';
    case 'movie':
      return 'Filme';
    case 'other':
      return 'Nota';
    case 'link':
      return 'Link';
    default:
      return type ? String(type).charAt(0).toUpperCase() + String(type).slice(1) : 'Link';
  }
}

export function getTypeColor(type: LinkType | string | undefined, fallback: string): string {
  switch (type) {
    case 'link':
      return fallback;
    case 'video':
      return '#FF2D55';
    case 'image':
      return '#34C759';
    case 'music':
      return '#5856D6';
    case 'movie':
      return '#C9A227';
    case 'other':
      return '#FF9500';
    default:
      return fallback;
  }
}

export function upscaleArtwork(url?: string | null, size = 1000): string | undefined {
  if (!url) return undefined;
  return url
    .replace(/\/\d+x\d+bb/g, `/${size}x${size}bb`)
    .replace(/\/\d+x\d+cc/g, `/${size}x${size}cc`)
    .replace(/100x100bb/g, `${size}x${size}bb`);
}

export function yearFromDate(dateString?: string | null): string | undefined {
  if (!dateString) return undefined;
  const year = new Date(dateString).getFullYear();
  return Number.isFinite(year) && year > 0 ? String(year) : undefined;
}

export function formatDuration(durationMs?: number | null): string | undefined {
  if (!durationMs || durationMs <= 0) return undefined;
  const totalSeconds = Math.round(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function buildMediaDescription(metadata: MediaMetadata, synopsis?: string): string {
  if (synopsis?.trim()) return synopsis.trim();

  return [
    metadata.artistName,
    metadata.collectionName,
    metadata.releaseYear,
    metadata.genres?.filter(Boolean).join(', '),
  ]
    .filter(Boolean)
    .join(' · ');
}

export function resolveMediaMetadata(link: Link): MediaMetadata | null {
  if (link.metadata && (link.metadata.artworkUrl || link.metadata.artistName || link.metadata.sourceId)) {
    return link.metadata;
  }

  if (!isMediaType(link.type)) return null;

  return {
    source: 'itunes',
    sourceId: link.id || link.url,
    artworkUrl: link.thumbnail,
    artistName: undefined,
    genres: [],
  };
}

export function mediaChips(metadata: MediaMetadata | null, type: LinkType): string[] {
  if (!metadata) return [];

  const chips: string[] = [];
  if (metadata.releaseYear) chips.push(metadata.releaseYear);
  if (type === 'music' && metadata.collectionName) chips.push(metadata.collectionName);
  if (metadata.genres?.length) chips.push(...metadata.genres.slice(0, 3));
  if (metadata.contentAdvisory) chips.push(metadata.contentAdvisory);
  const duration = formatDuration(metadata.durationMs);
  if (duration) chips.push(duration);
  return chips;
}
