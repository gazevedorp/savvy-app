import { Link, MediaMetadata } from '@/types';
import { buildMediaDescription, upscaleArtwork, yearFromDate } from '@/utils/media';

const ITUNES_SEARCH = 'https://itunes.apple.com/search';
const ITUNES_LOOKUP = 'https://itunes.apple.com/lookup';

export type MediaKind = 'music' | 'movie';

export interface MediaItem {
  source: MediaMetadata['source'];
  sourceId: string;
  kind: MediaKind;
  title: string;
  subtitle: string;
  collectionName?: string;
  description?: string;
  artworkUrl?: string;
  previewUrl?: string;
  externalUrl: string;
  releaseDate?: string;
  releaseYear?: string;
  genres: string[];
  durationMs?: number;
  contentAdvisory?: string;
  itunesKind?: string;
}

interface ItunesResult {
  wrapperType?: string;
  collectionType?: string;
  kind?: string;
  trackId?: number;
  collectionId?: number;
  artistId?: number;
  artistName?: string;
  trackName?: string;
  collectionName?: string;
  trackViewUrl?: string;
  collectionViewUrl?: string;
  previewUrl?: string;
  artworkUrl100?: string;
  artworkUrl60?: string;
  releaseDate?: string;
  primaryGenreName?: string;
  longDescription?: string;
  shortDescription?: string;
  description?: string;
  contentAdvisoryRating?: string;
  trackTimeMillis?: number;
}

interface ItunesResponse {
  resultCount?: number;
  results?: ItunesResult[];
}

interface DeezerTrack {
  id: number;
  title?: string;
  duration?: number;
  preview?: string;
  link?: string;
  artist?: { name?: string };
  album?: { title?: string; cover_xl?: string; cover_medium?: string; cover_big?: string };
}

interface DeezerResponse {
  data?: DeezerTrack[];
}

interface TmdbMovie {
  id: number;
  title?: string;
  original_title?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  genre_ids?: number[];
}

interface TmdbResponse {
  results?: TmdbMovie[];
}

const DEFAULT_COUNTRY = process.env.EXPO_PUBLIC_ITUNES_COUNTRY || 'BR';
const TMDB_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;

function itunesCountry(): string {
  return (process.env.EXPO_PUBLIC_ITUNES_COUNTRY || DEFAULT_COUNTRY).toUpperCase();
}

export function extractItunesId(url: string): string | null {
  const iParam = url.match(/[?&]i=(\d+)/);
  if (iParam) return iParam[1];
  const idPath = url.match(/\/id(\d+)/i);
  if (idPath) return idPath[1];
  const appleAlbum = url.match(/apple\.com\/[^/]+\/(?:album|song|movie)\/[^/]+\/(\d+)/i);
  if (appleAlbum) return appleAlbum[1];
  return null;
}

export function mapItunesResult(item: ItunesResult, fallbackKind?: MediaKind): MediaItem | null {
  const isMovie = item.kind === 'feature-movie' || fallbackKind === 'movie';
  const isAlbum = item.wrapperType === 'collection' || item.collectionType === 'Album';
  const kind: MediaKind = isMovie ? 'movie' : 'music';

  const title = isAlbum
    ? item.collectionName
    : item.trackName || item.collectionName;
  const externalUrl = item.trackViewUrl || item.collectionViewUrl;
  if (!title || !externalUrl) return null;

  const sourceId = String(item.trackId || item.collectionId || item.artistId || title);
  const artwork = upscaleArtwork(item.artworkUrl100 || item.artworkUrl60);
  const synopsis = item.longDescription || item.shortDescription || item.description;
  const genres = item.primaryGenreName ? [item.primaryGenreName] : [];

  return {
    source: 'itunes',
    sourceId,
    kind,
    title,
    subtitle: item.artistName || (isMovie ? 'Filme' : 'Artista desconhecido'),
    collectionName: isAlbum ? undefined : item.collectionName,
    description: synopsis,
    artworkUrl: artwork,
    previewUrl: item.previewUrl,
    externalUrl,
    releaseDate: item.releaseDate,
    releaseYear: yearFromDate(item.releaseDate),
    genres,
    durationMs: item.trackTimeMillis,
    contentAdvisory: item.contentAdvisoryRating,
    itunesKind: item.kind || item.wrapperType,
  };
}

export function mediaItemToMetadata(item: MediaItem): MediaMetadata {
  return {
    source: item.source,
    sourceId: item.sourceId,
    artistName: item.subtitle,
    collectionName: item.collectionName,
    releaseDate: item.releaseDate,
    releaseYear: item.releaseYear,
    genres: item.genres,
    artworkUrl: item.artworkUrl,
    previewUrl: item.previewUrl,
    durationMs: item.durationMs,
    contentAdvisory: item.contentAdvisory,
    kind: item.itunesKind || item.kind,
  };
}

export function mediaItemToLink(item: MediaItem): Partial<Link> {
  const metadata = mediaItemToMetadata(item);
  return {
    url: item.externalUrl,
    title: item.title,
    description: buildMediaDescription(metadata, item.description),
    thumbnail: item.artworkUrl,
    type: item.kind,
    metadata,
    is_read: false,
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'SavvyApp/1.0 (media search)',
      'Api-User-Agent': 'SavvyApp/1.0 (media search)',
    },
  });
  if (!response.ok) {
    throw new Error(`Falha ao consultar mídia (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function lookupItunesById(id: string): Promise<MediaItem | null> {
  const url =
    `${ITUNES_LOOKUP}?id=${encodeURIComponent(id)}` +
    `&country=${encodeURIComponent(itunesCountry())}` +
    `&lang=pt_br`;
  const data = await fetchJson<ItunesResponse>(url);
  const first = data.results?.[0];
  if (!first) return null;
  return mapItunesResult(first);
}

async function searchItunes(term: string, kind: MediaKind, entity: string, limit: number): Promise<MediaItem[]> {
  const params = new URLSearchParams({
    term,
    media: kind === 'movie' ? 'movie' : 'music',
    entity,
    limit: String(limit),
    country: itunesCountry(),
    lang: 'pt_br',
  });
  const data = await fetchJson<ItunesResponse>(`${ITUNES_SEARCH}?${params.toString()}`);
  const items = (data.results || [])
    .map((result) => mapItunesResult(result, kind))
    .filter((item): item is MediaItem => Boolean(item));
  return items;
}

function mapDeezerTrack(track: DeezerTrack): MediaItem | null {
  if (!track.title || !track.link) return null;
  return {
    source: 'deezer',
    sourceId: String(track.id),
    kind: 'music',
    title: track.title,
    subtitle: track.artist?.name || 'Artista desconhecido',
    collectionName: track.album?.title,
    artworkUrl: track.album?.cover_xl || track.album?.cover_big || track.album?.cover_medium,
    previewUrl: track.preview,
    externalUrl: track.link,
    genres: [],
    durationMs: track.duration ? track.duration * 1000 : undefined,
  };
}

async function searchDeezerMusic(term: string): Promise<MediaItem[]> {
  const url = `https://api.deezer.com/search?q=${encodeURIComponent(term)}&limit=20`;
  const data = await fetchJson<DeezerResponse>(url);
  return (data.data || [])
    .map(mapDeezerTrack)
    .filter((item): item is MediaItem => Boolean(item));
}

function mapTmdbMovie(movie: TmdbMovie): MediaItem | null {
  const title = movie.title || movie.original_title;
  if (!title) return null;
  const poster = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
      : undefined;
  return {
    source: 'tmdb',
    sourceId: String(movie.id),
    kind: 'movie',
    title,
    subtitle: 'Filme',
    description: movie.overview,
    artworkUrl: poster,
    externalUrl: `https://www.themoviedb.org/movie/${movie.id}`,
    releaseDate: movie.release_date,
    releaseYear: yearFromDate(movie.release_date),
    genres: [],
  };
}

interface WikiSearchResponse {
  pages?: Array<{
    id?: number;
    key?: string;
    title?: string;
    description?: string;
    thumbnail?: { url?: string };
  }>;
}

interface WikiSummary {
  type?: string;
  title?: string;
  description?: string;
  extract?: string;
  thumbnail?: { source?: string };
  originalimage?: { source?: string };
  content_urls?: { desktop?: { page?: string } };
}

function yearFromText(text?: string): string | undefined {
  const match = text?.match(/\b(19|20)\d{2}\b/);
  return match?.[0];
}

function upscaleWikiThumb(url?: string): string | undefined {
  if (!url) return undefined;
  const withProtocol = url.startsWith('//') ? `https:${url}` : url;
  return withProtocol.replace(/\/\d+px-/, '/800px-');
}

function looksLikeFilm(title: string, description?: string): boolean {
  const haystack = `${title} ${description || ''}`.toLowerCase();
  if (
    haystack.includes('desambiguação') ||
    haystack.includes('disambiguation') ||
    haystack.includes('álbum') ||
    haystack.includes('trilha sonora') ||
    haystack.includes('canção') ||
    haystack.includes('soundtrack')
  ) {
    return false;
  }
  return (
    haystack.includes('filme') ||
    haystack.includes('film') ||
    haystack.includes('cinema') ||
    /\(\s*filme\s*\)/i.test(title)
  );
}

function mapWikiSummary(summary: WikiSummary, fallbackId: string): MediaItem | null {
  const title = summary.title;
  const pageUrl = summary.content_urls?.desktop?.page;
  if (!title || !pageUrl || summary.type === 'disambiguation') return null;
  if (!looksLikeFilm(title, summary.description || summary.extract)) return null;

  const artwork = upscaleWikiThumb(summary.originalimage?.source || summary.thumbnail?.source);
  return {
    source: 'wikipedia',
    sourceId: fallbackId,
    kind: 'movie',
    title: title.replace(/\s*\(filme\)\s*$/i, '').trim(),
    subtitle: summary.description || 'Filme',
    description: summary.extract,
    artworkUrl: artwork,
    externalUrl: pageUrl,
    releaseYear: yearFromText(summary.description) || yearFromText(summary.extract),
    genres: [],
  };
}

async function searchWikipediaMovies(term: string): Promise<MediaItem[]> {
  const query = /filme|film/i.test(term) ? term : `${term} filme`;
  const searchUrl =
    `https://pt.wikipedia.org/w/rest.php/v1/search/page?q=${encodeURIComponent(query)}&limit=12`;
  const data = await fetchJson<WikiSearchResponse>(searchUrl);
  const pages = (data.pages || []).slice(0, 8);

  const summaries = await Promise.all(
    pages.map(async (page) => {
      const title = page.key || page.title;
      if (!title) return null;
      try {
        const summary = await fetchJson<WikiSummary>(
          `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
        );
        return mapWikiSummary(summary, String(page.id || title));
      } catch {
        return null;
      }
    })
  );

  return summaries.filter((item): item is MediaItem => Boolean(item));
}

async function searchItunesMoviesLoose(term: string): Promise<MediaItem[]> {
  const params = new URLSearchParams({
    term,
    limit: '25',
    country: itunesCountry(),
    lang: 'pt_br',
  });
  const data = await fetchJson<ItunesResponse>(`${ITUNES_SEARCH}?${params.toString()}`);
  return (data.results || [])
    .filter((result) => result.kind === 'feature-movie')
    .map((result) => mapItunesResult(result, 'movie'))
    .filter((item): item is MediaItem => Boolean(item));
}

async function searchTmdbMovies(term: string): Promise<MediaItem[]> {
  if (!TMDB_KEY) return [];
  const params = new URLSearchParams({
    api_key: TMDB_KEY,
    query: term,
    language: 'pt-BR',
    include_adult: 'false',
  });
  const data = await fetchJson<TmdbResponse>(`https://api.themoviedb.org/3/search/movie?${params.toString()}`);
  return (data.results || [])
    .map(mapTmdbMovie)
    .filter((item): item is MediaItem => Boolean(item));
}

function dedupeMedia(items: MediaItem[]): MediaItem[] {
  const seen = new Set<string>();
  const unique: MediaItem[] = [];
  for (const item of items) {
    const key = `${item.kind}:${item.source}:${item.sourceId}:${item.title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }
  return unique;
}

export async function searchMedia(kind: MediaKind, term: string): Promise<MediaItem[]> {
  const query = term.trim();
  if (!query) return [];

  if (kind === 'music') {
    try {
      const [songs, albums] = await Promise.all([
        searchItunes(query, 'music', 'song', 18),
        searchItunes(query, 'music', 'album', 8),
      ]);
      const itunesResults = dedupeMedia([...songs, ...albums]);
      if (itunesResults.length > 0) return itunesResults;
    } catch (error) {
      console.warn('iTunes music search failed, trying Deezer:', error);
    }
    return searchDeezerMusic(query);
  }

  if (TMDB_KEY) {
    try {
      const tmdb = await searchTmdbMovies(query);
      if (tmdb.length > 0) return tmdb;
    } catch (error) {
      console.warn('TMDB movie search failed:', error);
    }
  }

  const collected: MediaItem[] = [];
  try {
    collected.push(...(await searchWikipediaMovies(query)));
  } catch (error) {
    console.warn('Wikipedia movie search failed:', error);
  }
  try {
    collected.push(...(await searchItunesMoviesLoose(query)));
  } catch (error) {
    console.warn('iTunes movie search failed:', error);
  }
  return dedupeMedia(collected);
}

export async function lookupMediaFromUrl(url: string): Promise<MediaItem | null> {
  const itunesId = extractItunesId(url);
  if (itunesId) {
    try {
      return await lookupItunesById(itunesId);
    } catch (error) {
      console.warn('iTunes lookup failed:', error);
    }
  }
  return null;
}
