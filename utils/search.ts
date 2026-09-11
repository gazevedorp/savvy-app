import { Link } from '@/types';
import { getTypeLabel } from '@/utils/media';

export type SearchScope = 'saved' | 'music' | 'movie';

export const SEARCH_SCOPE_OPTIONS = [
  { id: 'saved', label: 'Salvos' },
  { id: 'music', label: 'Música' },
  { id: 'movie', label: 'Filmes' },
] as const;

export function isSearchScope(value: unknown): value is SearchScope {
  return value === 'saved' || value === 'music' || value === 'movie';
}

export function getSearchPlaceholder(scope: SearchScope): string {
  switch (scope) {
    case 'music':
      return 'Faixa, artista ou álbum';
    case 'movie':
      return 'Nome do filme';
    default:
      return 'Buscar nos seus Savvys';
  }
}

export function getSearchHeaderSubtitle(scope: SearchScope, savedCount?: number): string {
  if (scope === 'music') return 'Catálogo de música';
  if (scope === 'movie') return 'Catálogo de filmes';
  if (typeof savedCount === 'number') {
    if (savedCount === 0) return 'Nenhum item encontrado';
    if (savedCount === 1) return '1 item encontrado';
    return `${savedCount} itens encontrados`;
  }
  return 'Salvos, música e filmes';
}

export function filterSavedLinks(links: Link[], query: string): Link[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return links.filter((link) => {
    const haystack = [
      link.title,
      link.url,
      link.description,
      link.metadata?.artistName,
      link.metadata?.collectionName,
      getTypeLabel(link.type),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export interface SearchEmptyCopy {
  title: string;
  description: string;
}

export function getSearchEmptyCopy(opts: {
  scope: SearchScope;
  query: string;
  error?: string | null;
}): SearchEmptyCopy {
  const query = opts.query.trim();

  if (opts.scope === 'saved') {
    if (!query) {
      return {
        title: 'Buscar nos seus Savvys',
        description:
          'Digite para filtrar o que você já salvou, ou troque para Música / Filmes para consultar o catálogo.',
      };
    }
    return {
      title: 'Nenhum resultado',
      description: `Nenhum item salvo corresponde a “${query}”.`,
    };
  }

  if (opts.error) {
    return {
      title: 'Sem resultados',
      description: opts.error,
    };
  }

  if (query.length < 2) {
    return opts.scope === 'music'
      ? {
          title: 'Buscar música',
          description:
            'Digite o nome da faixa, artista ou álbum. Os resultados vêm da iTunes Search API (com fallback Deezer).',
        }
      : {
          title: 'Buscar filmes',
          description:
            'Digite o nome do filme. Os resultados vêm da Wikipédia (e da iTunes, quando houver). Com EXPO_PUBLIC_TMDB_API_KEY a busca usa o TMDB.',
        };
  }

  return {
    title: 'Nenhum resultado',
    description: 'Nenhum resultado real encontrado para essa busca.',
  };
}
