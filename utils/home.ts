import { Link, LinkType } from '@/types';

export type ReadStatusFilter = 'all' | 'read' | 'unread';

export const TYPE_FILTER_OPTIONS = [
  { id: 'all', label: 'Todos' },
  { id: 'link', label: 'Links' },
  { id: 'video', label: 'Vídeos' },
  { id: 'music', label: 'Música' },
  { id: 'movie', label: 'Filmes' },
  { id: 'other', label: 'Notas' },
] as const;

export const READ_STATUS_OPTIONS = [
  { id: 'unread', label: 'A fazer' },
  { id: 'read', label: 'Feito' },
  { id: 'all', label: 'Todos' },
] as const;

export const CREATE_TYPES: LinkType[] = [
  'link',
  'other',
  'music',
  'movie',
  'video',
  'image',
];

export const ADD_TYPE_OPTIONS: {
  type: LinkType;
  label: string;
  description: string;
}[] = [
  { type: 'link', label: 'Link', description: 'URL, artigo ou página' },
  { type: 'other', label: 'Nota', description: 'Texto livre para lembrar depois' },
  { type: 'music', label: 'Música', description: 'Buscar faixa ou álbum' },
  { type: 'movie', label: 'Filme', description: 'Buscar no catálogo' },
];

export function resolveCreateType(value?: string | string[] | null): LinkType | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  return CREATE_TYPES.includes(raw as LinkType) ? (raw as LinkType) : null;
}

export function filterLinks(
  links: Link[],
  opts: {
    type?: string;
    status?: ReadStatusFilter;
    categoryId?: string | null;
  }
): Link[] {
  const type = opts.type ?? 'all';
  const status = opts.status ?? 'all';

  return links.filter((link) => {
    if (opts.categoryId && !link.categoryIds?.includes(opts.categoryId)) {
      return false;
    }
    if (type !== 'all' && link.type !== type) {
      return false;
    }
    if (status === 'read') return !!link.is_read;
    if (status === 'unread') return !link.is_read;
    return true;
  });
}

function typeNoun(typeId: string, count: number): string {
  const map: Record<string, [string, string]> = {
    all: ['item', 'itens'],
    link: ['link', 'links'],
    video: ['vídeo', 'vídeos'],
    music: ['música', 'músicas'],
    movie: ['filme', 'filmes'],
    other: ['nota', 'notas'],
    image: ['imagem', 'imagens'],
  };
  const [one, many] = map[typeId] ?? map.all;
  return count === 1 ? one : many;
}

export function formatHomeCount(
  count: number,
  status: ReadStatusFilter,
  typeId = 'all',
  categoryName?: string | null
): string {
  const noun = typeNoun(typeId, count);
  let phrase: string;

  if (status === 'unread') {
    phrase = count === 0 ? `Nada a fazer` : `${count} ${noun} a fazer`;
  } else if (status === 'read') {
    phrase = count === 0 ? 'Nada feito ainda' : `${count} ${count === 1 ? 'feito' : 'feitos'}`;
  } else {
    phrase = count === 0 ? 'Nenhum item salvo' : `${count} ${noun}`;
  }

  if (categoryName) {
    return `${categoryName} · ${phrase.toLowerCase()}`;
  }
  return phrase;
}

export type HomeEmptyIcon = 'BookmarkPlus' | 'CheckCircle' | 'Inbox' | 'Filter';

export interface HomeEmptyCopy {
  title: string;
  description: string;
  icon: HomeEmptyIcon;
  action: 'add' | 'clear' | null;
}

export function getHomeEmptyState(opts: {
  totalCount: number;
  status: ReadStatusFilter;
  typeId: string;
  categoryName?: string | null;
}): HomeEmptyCopy {
  const { totalCount, status, typeId, categoryName } = opts;
  const hasTypeOrCategory = typeId !== 'all' || !!categoryName;

  if (totalCount === 0) {
    return {
      title: 'Nada salvo ainda',
      description: 'Toque no + para adicionar um link, nota, música ou filme.',
      icon: 'BookmarkPlus',
      action: 'add',
    };
  }

  if (hasTypeOrCategory) {
    const focus = categoryName || typeNoun(typeId, 2);
    return {
      title: 'Nenhum resultado',
      description: `Nenhum item em ${focus} corresponde aos filtros. Tente outro tipo ou status.`,
      icon: 'Filter',
      action: 'clear',
    };
  }

  if (status === 'unread') {
    return {
      title: 'Tudo em dia',
      description: 'Você não tem itens a fazer. Quando salvar algo novo, ele aparece aqui.',
      icon: 'CheckCircle',
      action: null,
    };
  }

  if (status === 'read') {
    return {
      title: 'Nada marcado como feito',
      description: 'Quando terminar, toque em Feito no card para mover o item para cá.',
      icon: 'Inbox',
      action: null,
    };
  }

  return {
    title: 'Nenhum Savvy corresponde aos filtros',
    description: 'Tente ajustar os filtros de tipo ou status.',
    icon: 'Filter',
    action: 'clear',
  };
}
