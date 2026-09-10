import {
  extractItunesId,
  mapItunesResult,
  mediaItemToLink,
  mediaItemToMetadata,
  searchMedia,
} from '@/utils/itunes';
import { detectLinkType } from '@/utils/linkParser';
import {
  buildMediaDescription,
  formatDuration,
  getLinkSubtitle,
  getTypeLabel,
  isMediaType,
  mediaChips,
  upscaleArtwork,
  yearFromDate,
} from '@/utils/media';

describe('iTunes mapping', () => {
  it('maps a real song payload to a music item with artwork and artist', () => {
    const item = mapItunesResult({
      wrapperType: 'track',
      kind: 'song',
      trackId: 120954025,
      collectionId: 120954021,
      artistName: 'Jack Johnson',
      trackName: 'Better Together',
      collectionName: 'Curious George',
      trackViewUrl: 'https://music.apple.com/us/album/better-together/120954021?i=120954025',
      artworkUrl100: 'https://is1-ssl.mzstatic.com/image/thumb/Music/v4/cover/100x100bb.jpg',
      releaseDate: '2006-01-01T12:00:00Z',
      primaryGenreName: 'Rock',
      previewUrl: 'https://audio-ssl.itunes.apple.com/preview.m4a',
      trackTimeMillis: 207200,
    });

    expect(item).toMatchObject({
      source: 'itunes',
      kind: 'music',
      title: 'Better Together',
      subtitle: 'Jack Johnson',
      collectionName: 'Curious George',
      releaseYear: '2006',
      genres: ['Rock'],
    });
    expect(item?.artworkUrl).toContain('1000x1000bb');
    expect(item?.externalUrl).toContain('music.apple.com');
  });

  it('maps an album collection without a track name', () => {
    const item = mapItunesResult({
      wrapperType: 'collection',
      collectionType: 'Album',
      collectionId: 1440818600,
      artistName: 'Daft Punk',
      collectionName: 'Random Access Memories',
      collectionViewUrl: 'https://music.apple.com/br/album/random-access-memories/1440818600',
      artworkUrl100: 'https://example.com/100x100bb.jpg',
      releaseDate: '2013-05-17T07:00:00Z',
      primaryGenreName: 'Pop',
    });

    expect(item?.kind).toBe('music');
    expect(item?.title).toBe('Random Access Memories');
    expect(item?.subtitle).toBe('Daft Punk');
  });

  it('maps a feature movie with synopsis and director', () => {
    const item = mapItunesResult({
      kind: 'feature-movie',
      trackId: 401135204,
      artistName: 'Christopher Nolan',
      trackName: 'A Origem',
      trackViewUrl: 'https://itunes.apple.com/br/movie/a-origem/id401135204',
      artworkUrl100: 'https://example.com/100x100bb.jpg',
      releaseDate: '2010-07-16T07:00:00Z',
      primaryGenreName: 'Ação e aventura',
      longDescription: 'Um ladrão que rouba segredos através dos sonhos.',
      contentAdvisoryRating: '14',
      trackTimeMillis: 8880000,
    });

    expect(item).toMatchObject({
      kind: 'movie',
      title: 'A Origem',
      subtitle: 'Christopher Nolan',
      description: 'Um ladrão que rouba segredos através dos sonhos.',
      releaseYear: '2010',
    });
  });

  it('extracts iTunes ids from Apple Music and iTunes URLs', () => {
    expect(
      extractItunesId('https://music.apple.com/us/album/better-together/120954021?i=120954025')
    ).toBe('120954025');
    expect(extractItunesId('https://itunes.apple.com/us/movie/inception/id401135204')).toBe(
      '401135204'
    );
    expect(extractItunesId('https://music.apple.com/br/album/random-access-memories/1440818600')).toBe(
      '1440818600'
    );
  });

  it('converts a media item into a persistable Link with metadata', () => {
    const item = mapItunesResult({
      kind: 'song',
      trackId: 1,
      artistName: 'Elis Regina',
      trackName: 'Águas de Março',
      collectionName: 'Elis & Tom',
      trackViewUrl: 'https://music.apple.com/song/aguas',
      artworkUrl100: 'https://example.com/100x100bb.jpg',
      releaseDate: '1974-01-01T00:00:00Z',
      primaryGenreName: 'MPB',
    });
    expect(item).not.toBeNull();
    const link = mediaItemToLink(item!);
    expect(link.type).toBe('music');
    expect(link.title).toBe('Águas de Março');
    expect(link.thumbnail).toContain('1000x1000bb');
    expect(link.metadata?.artistName).toBe('Elis Regina');
    expect(link.metadata?.source).toBe('itunes');
    expect(mediaItemToMetadata(item!).genres).toEqual(['MPB']);
  });
});

describe('linkParser', () => {
  it('detects music platforms', async () => {
    await expect(detectLinkType('https://open.spotify.com/track/abc')).resolves.toBe('music');
    await expect(detectLinkType('https://music.apple.com/br/album/x/1')).resolves.toBe('music');
    await expect(detectLinkType('https://www.deezer.com/track/1')).resolves.toBe('music');
  });

  it('detects movies separately from generic videos', async () => {
    await expect(detectLinkType('https://www.imdb.com/title/tt1375666/')).resolves.toBe('movie');
    await expect(detectLinkType('https://www.themoviedb.org/movie/27205')).resolves.toBe('movie');
    await expect(detectLinkType('https://www.youtube.com/watch?v=abc')).resolves.toBe('video');
  });
});

describe('media helpers', () => {
  it('labels and classifies media types', () => {
    expect(isMediaType('music')).toBe(true);
    expect(isMediaType('movie')).toBe(true);
    expect(isMediaType('link')).toBe(false);
    expect(getTypeLabel('music')).toBe('Música');
    expect(getTypeLabel('movie')).toBe('Filme');
    expect(getTypeLabel('other')).toBe('Nota');
    expect(
      getLinkSubtitle({
        url: 'https://www.imdb.com/title/tt0110912',
        title: 'Pulp Fiction',
        type: 'movie',
        metadata: {
          source: 'tmdb',
          sourceId: '680',
          artistName: 'Quentin Tarantino',
          releaseYear: '1994',
        },
      })
    ).toBe('Quentin Tarantino · 1994');
  });

  it('upscales iTunes artwork and formats metadata chips', () => {
    expect(upscaleArtwork('https://cdn/100x100bb.jpg', 600)).toContain('600x600bb');
    expect(yearFromDate('2010-07-16T07:00:00Z')).toBe('2010');
    expect(formatDuration(undefined)).toBeUndefined();
    expect(formatDuration(0)).toBeUndefined();
    expect(formatDuration(207000)).toBe('3:27');
    expect(formatDuration(8880000)).toBe('2h 28min');

    const chips = mediaChips(
      {
        source: 'itunes',
        sourceId: '1',
        collectionName: 'Elis & Tom',
        releaseYear: '1974',
        genres: ['MPB', 'Jazz'],
      },
      'music'
    );
    expect(chips).toEqual(expect.arrayContaining(['1974', 'Elis & Tom', 'MPB']));
    expect(
      buildMediaDescription(
        { source: 'itunes', sourceId: '1', artistName: 'Elis', releaseYear: '1974', genres: ['MPB'] },
        '  Sinopse  '
      )
    ).toBe('Sinopse');
  });
});

describe('searchMedia', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('returns mapped iTunes tracks for a music query', async () => {
    global.fetch = jest.fn(async (input: RequestInfo) => {
      const url = String(input);
      if (url.includes('entity=song')) {
        return {
          ok: true,
          json: async () => ({
            resultCount: 1,
            results: [
              {
                kind: 'song',
                trackId: 99,
                artistName: 'Gal Costa',
                trackName: 'Baby',
                collectionName: 'Gal Costa',
                trackViewUrl: 'https://music.apple.com/br/song/baby/99',
                artworkUrl100: 'https://example.com/100x100bb.jpg',
                releaseDate: '1969-01-01T00:00:00Z',
                primaryGenreName: 'MPB',
              },
            ],
          }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ resultCount: 0, results: [] }),
      } as Response;
    }) as typeof fetch;

    const results = await searchMedia('music', 'Baby Gal Costa');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Baby');
    expect(results[0].subtitle).toBe('Gal Costa');
    expect(results[0].kind).toBe('music');
  });

  it('falls back to Deezer when iTunes music search fails', async () => {
    global.fetch = jest.fn(async (input: RequestInfo) => {
      const url = String(input);
      if (url.includes('itunes.apple.com')) {
        return { ok: false, status: 500, json: async () => ({}) } as Response;
      }
      return {
        ok: true,
        json: async () => ({
          data: [
            {
              id: 1,
              title: 'Show das Poderosas',
              link: 'https://www.deezer.com/track/1',
              duration: 200,
              preview: 'https://cdn.deezer.com/preview.mp3',
              artist: { name: 'Anitta' },
              album: { title: 'Anitta', cover_xl: 'https://cdn.deezer.com/cover.jpg' },
            },
          ],
        }),
      } as Response;
    }) as typeof fetch;

    const results = await searchMedia('music', 'Anitta');
    expect(results[0].source).toBe('deezer');
    expect(results[0].title).toBe('Show das Poderosas');
    expect(results[0].subtitle).toBe('Anitta');
  });

  it('returns Wikipedia film pages for a movie query', async () => {
    global.fetch = jest.fn(async (input: RequestInfo) => {
      const url = String(input);
      if (url.includes('search/page')) {
        return {
          ok: true,
          json: async () => ({
            pages: [
              {
                id: 1,
                key: 'Cidade_de_Deus_(filme)',
                title: 'Cidade de Deus (filme)',
                description: 'filme brasileiro de 2002',
              },
            ],
          }),
        } as Response;
      }
      if (url.includes('page/summary')) {
        return {
          ok: true,
          json: async () => ({
            type: 'standard',
            title: 'Cidade de Deus (filme)',
            description: 'filme brasileiro de 2002',
            extract: 'Cidade de Deus é um filme de ação brasileiro de 2002.',
            originalimage: {
              source:
                'https://thumb.wikimedia.org/wikipedia/pt/thumb/1/10/CidadedeDeus.jpg/330px-CidadedeDeus.jpg',
            },
            content_urls: {
              desktop: { page: 'https://pt.wikipedia.org/wiki/Cidade_de_Deus_(filme)' },
            },
          }),
        } as Response;
      }
      return { ok: true, json: async () => ({ results: [] }) } as Response;
    }) as typeof fetch;

    const results = await searchMedia('movie', 'Cidade de Deus');
    expect(results[0].kind).toBe('movie');
    expect(results[0].title).toBe('Cidade de Deus');
    expect(results[0].source).toBe('wikipedia');
    expect(results[0].releaseYear).toBe('2002');
    expect(results[0].artworkUrl).toContain('800px');
  });
});
