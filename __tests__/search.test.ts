import { Link } from '@/types';
import {
  SEARCH_SCOPE_OPTIONS,
  filterSavedLinks,
  getSearchEmptyCopy,
  getSearchHeaderSubtitle,
  getSearchPlaceholder,
  isSearchScope,
} from '@/utils/search';

function item(overrides: Partial<Link> = {}): Link {
  return {
    id: overrides.id ?? '1',
    url: overrides.url ?? 'https://www.example.com/page',
    title: overrides.title ?? 'Example',
    type: overrides.type ?? 'link',
    description: overrides.description,
    metadata: overrides.metadata,
  };
}

describe('search scopes', () => {
  it('exposes the three pill modes in pt-BR', () => {
    expect(SEARCH_SCOPE_OPTIONS.map((option) => option.label)).toEqual([
      'Salvos',
      'Música',
      'Filmes',
    ]);
    expect(isSearchScope('saved')).toBe(true);
    expect(isSearchScope('podcast')).toBe(false);
  });

  it('uses dense placeholders per scope', () => {
    expect(getSearchPlaceholder('saved')).toMatch(/Savvys/);
    expect(getSearchPlaceholder('music')).toMatch(/Faixa/);
    expect(getSearchPlaceholder('movie')).toMatch(/filme/i);
  });

  it('describes the header by scope and result count', () => {
    expect(getSearchHeaderSubtitle('music')).toBe('Catálogo de música');
    expect(getSearchHeaderSubtitle('movie')).toBe('Catálogo de filmes');
    expect(getSearchHeaderSubtitle('saved')).toBe('Salvos, música e filmes');
    expect(getSearchHeaderSubtitle('saved', 0)).toBe('Nenhum item encontrado');
    expect(getSearchHeaderSubtitle('saved', 1)).toBe('1 item encontrado');
    expect(getSearchHeaderSubtitle('saved', 3)).toBe('3 itens encontrados');
  });
});

describe('filterSavedLinks', () => {
  const links = [
    item({ id: '1', title: 'Receita de bolo', url: 'https://site.com/bolo' }),
    item({
      id: '2',
      title: 'Águas de Março',
      type: 'music',
      metadata: { source: 'itunes', sourceId: '1', artistName: 'Elis Regina' },
    }),
    item({ id: '3', title: 'Pulp Fiction', type: 'movie', description: 'Tarantino' }),
  ];

  it('returns nothing for an empty query', () => {
    expect(filterSavedLinks(links, '   ')).toEqual([]);
  });

  it('matches title, url, description, artist and type label', () => {
    expect(filterSavedLinks(links, 'bolo').map((link) => link.id)).toEqual(['1']);
    expect(filterSavedLinks(links, 'elis').map((link) => link.id)).toEqual(['2']);
    expect(filterSavedLinks(links, 'tarantino').map((link) => link.id)).toEqual(['3']);
    expect(filterSavedLinks(links, 'música').map((link) => link.id)).toEqual(['2']);
  });
});

describe('getSearchEmptyCopy', () => {
  it('prompts to type when saved search is idle', () => {
    const copy = getSearchEmptyCopy({ scope: 'saved', query: '' });
    expect(copy.title).toMatch(/Buscar/);
    expect(copy.description).toMatch(/Música/);
  });

  it('explains a saved miss', () => {
    const copy = getSearchEmptyCopy({ scope: 'saved', query: 'xyz' });
    expect(copy.title).toBe('Nenhum resultado');
    expect(copy.description).toMatch(/xyz/);
  });

  it('uses catalog hints before two characters', () => {
    expect(getSearchEmptyCopy({ scope: 'music', query: 'a' }).title).toBe('Buscar música');
    expect(getSearchEmptyCopy({ scope: 'movie', query: '' }).title).toBe('Buscar filmes');
  });

  it('surfaces API errors', () => {
    expect(
      getSearchEmptyCopy({
        scope: 'movie',
        query: 'matrix',
        error: 'Não foi possível consultar a API agora. Tente novamente.',
      }).description
    ).toMatch(/API/);
  });
});
