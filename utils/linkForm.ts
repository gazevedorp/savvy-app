import { LinkType } from '@/types';

export function urlPlaceholderForType(type: LinkType): string {
  switch (type) {
    case 'video':
      return 'URL do vídeo';
    case 'music':
      return 'URL da música';
    case 'movie':
      return 'URL do filme';
    case 'image':
      return 'URL da imagem';
    default:
      return 'https://exemplo.com';
  }
}

export function canSaveLinkForm(values: {
  type: LinkType;
  title: string;
  url: string;
  saving?: boolean;
}): boolean {
  if (values.saving) return false;
  if (values.type === 'other') return !!values.title.trim();
  return !!values.url.trim() && !!values.title.trim();
}
