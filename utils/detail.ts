import { Link } from '@/types';
import { getLinkHostname, getTypeLabel, isMediaType } from '@/utils/media';
import { isUploadableImageUri } from '@/utils/imageUri';

export function isLocalImageLink(link: Pick<Link, 'type' | 'url'>): boolean {
  return link.type === 'image' && isUploadableImageUri(link.url);
}

export function getDetailArtwork(link: Pick<Link, 'type' | 'url' | 'thumbnail' | 'metadata'>): string | undefined {
  const fromMeta = link.metadata?.artworkUrl;
  if (fromMeta) return fromMeta;
  if (link.thumbnail) return link.thumbnail;
  if (link.type === 'image' && link.url) return link.url;
  return undefined;
}

export function shouldShowDetailHero(link: Pick<Link, 'type' | 'url' | 'thumbnail' | 'metadata'>): boolean {
  if (isMediaType(link.type)) return true;
  return !!getDetailArtwork(link);
}

export function genericDetailSubtitle(link: Pick<Link, 'type' | 'url' | 'description'>): string | undefined {
  if (link.type === 'other') {
    return undefined;
  }
  if (link.type === 'image') {
    return getLinkHostname(link.url) || (isUploadableImageUri(link.url) ? 'Imagem do dispositivo' : undefined);
  }
  return getLinkHostname(link.url) || undefined;
}

export function genericDetailChips(link: Pick<Link, 'type' | 'url'>): string[] {
  const chips = [getTypeLabel(link.type)];
  const host = getLinkHostname(link.url);
  if (host && link.type !== 'other') chips.push(host);
  return chips;
}

export function genericBodyTitle(type: Link['type']): string {
  switch (type) {
    case 'other':
      return 'Nota';
    case 'image':
      return 'Sobre';
    case 'video':
      return 'Sobre o vídeo';
    default:
      return 'Sobre';
  }
}

export function canPreviewUrl(link: Pick<Link, 'type' | 'url'>): boolean {
  if (!link.url) return false;
  if (link.type === 'other') return false;
  if (isLocalImageLink(link)) return false;
  return /^https?:\/\//i.test(link.url);
}
