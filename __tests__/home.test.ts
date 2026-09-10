import { Link } from '@/types';
import {
  ADD_TYPE_OPTIONS,
  filterLinks,
  formatHomeCount,
  getHomeEmptyState,
  resolveCreateType,
} from '@/utils/home';
import { getLinkHostname, getLinkSubtitle } from '@/utils/media';

function item(overrides: Partial<Link> = {}): Link {
  return {
    id: overrides.id ?? '1',
    url: overrides.url ?? 'https://www.example.com/page',
    title: overrides.title ?? 'Example',
    type: overrides.type ?? 'link',
    is_read: overrides.is_read ?? false,
    categoryIds: overrides.categoryIds,
    description: overrides.description,
    metadata: overrides.metadata,
    thumbnail: overrides.thumbnail,
  };
}

describe('resolveCreateType', () => {
  it('accepts FAB type sheet values', () => {
    expect(resolveCreateType('link')).toBe('link');
    expect(resolveCreateType('other')).toBe('other');
    expect(resolveCreateType('music')).toBe('music');
    expect(resolveCreateType('movie')).toBe('movie');
    expect(resolveCreateType(['video'])).toBe('video');
  });

  it('rejects unknown values', () => {
    expect(resolveCreateType('podcast')).toBeNull();
    expect(resolveCreateType(undefined)).toBeNull();
    expect(resolveCreateType('')).toBeNull();
  });
});

describe('ADD_TYPE_OPTIONS', () => {
  it('offers Link, Nota, Música and Filme', () => {
    expect(ADD_TYPE_OPTIONS.map((option) => option.label)).toEqual([
      'Link',
      'Nota',
      'Música',
      'Filme',
    ]);
  });
});

describe('filterLinks', () => {
  const links = [
    item({ id: '1', type: 'link', is_read: false, categoryIds: ['a'] }),
    item({ id: '2', type: 'movie', is_read: true, categoryIds: ['a'] }),
    item({ id: '3', type: 'music', is_read: false, categoryIds: ['b'] }),
  ];

  it('defaults to unread To Do items when status is unread', () => {
    expect(filterLinks(links, { status: 'unread' }).map((link) => link.id)).toEqual([
      '1',
      '3',
    ]);
  });

  it('filters by type, status and category together', () => {
    expect(
      filterLinks(links, { type: 'movie', status: 'read', categoryId: 'a' }).map(
        (link) => link.id
      )
    ).toEqual(['2']);
    expect(filterLinks(links, { type: 'music', status: 'read' })).toEqual([]);
  });
});

describe('formatHomeCount', () => {
  it('describes to-do, done and all counts in pt-BR', () => {
    expect(formatHomeCount(3, 'unread')).toBe('3 itens a fazer');
    expect(formatHomeCount(1, 'unread')).toBe('1 item a fazer');
    expect(formatHomeCount(0, 'unread')).toBe('Nada a fazer');
    expect(formatHomeCount(2, 'read')).toBe('2 feitos');
    expect(formatHomeCount(1, 'read')).toBe('1 feito');
    expect(formatHomeCount(5, 'all')).toBe('5 itens');
  });

  it('uses the type noun and optional category', () => {
    expect(formatHomeCount(2, 'unread', 'movie')).toBe('2 filmes a fazer');
    expect(formatHomeCount(1, 'all', 'other')).toBe('1 nota');
    expect(formatHomeCount(2, 'unread', 'all', 'Cinema')).toBe(
      'Cinema · 2 itens a fazer'
    );
  });
});

describe('getHomeEmptyState', () => {
  it('uses a library empty state when nothing is saved', () => {
    const empty = getHomeEmptyState({
      totalCount: 0,
      status: 'unread',
      typeId: 'all',
    });
    expect(empty.icon).toBe('BookmarkPlus');
    expect(empty.action).toBe('add');
    expect(empty.title).toMatch(/Nada salvo/);
  });

  it('uses a done-up empty state for an empty To Do list', () => {
    const empty = getHomeEmptyState({
      totalCount: 4,
      status: 'unread',
      typeId: 'all',
    });
    expect(empty.icon).toBe('CheckCircle');
    expect(empty.action).toBeNull();
    expect(empty.title).toBe('Tudo em dia');
  });

  it('uses a done-filter empty state when nothing is marked Feito', () => {
    const empty = getHomeEmptyState({
      totalCount: 4,
      status: 'read',
      typeId: 'all',
    });
    expect(empty.icon).toBe('Inbox');
    expect(empty.title).toMatch(/feito/i);
  });

  it('uses a filter empty state with a clear action', () => {
    const empty = getHomeEmptyState({
      totalCount: 4,
      status: 'unread',
      typeId: 'movie',
      categoryName: 'Cinema',
    });
    expect(empty.icon).toBe('Filter');
    expect(empty.action).toBe('clear');
    expect(empty.description).toMatch(/Cinema/);
  });
});

describe('getLinkSubtitle', () => {
  it('prefers media artist and year, then hostname', () => {
    expect(
      getLinkSubtitle(
        item({
          type: 'music',
          metadata: {
            source: 'itunes',
            sourceId: '1',
            artistName: 'Gal Costa',
            releaseYear: '1969',
          },
        })
      )
    ).toBe('Gal Costa · 1969');
    expect(getLinkHostname('https://www.nytimes.com/article')).toBe('nytimes.com');
    expect(getLinkSubtitle(item({ url: 'https://www.nytimes.com/article' }))).toBe(
      'nytimes.com'
    );
    expect(
      getLinkSubtitle(item({ type: 'other', description: 'Lista de compras' }))
    ).toBe('Lista de compras');
    expect(
      getLinkSubtitle(item({ type: 'image', url: 'file://photo.jpg' }))
    ).toBe('Imagem do dispositivo');
  });
});
