import { LinkType } from '@/types';
import { lookupMediaFromUrl } from '@/utils/itunes';

interface LinkMetadata {
  title?: string;
  description?: string;
  thumbnail?: string;
  type?: LinkType;
  metadata?: import('@/types').MediaMetadata;
}

// Detect link type based on URL patterns
export const detectLinkType = async (url: string): Promise<LinkType> => {
  try {
    const urlLower = url.toLowerCase();

    // Film / movie platforms (before generic video so Apple TV / iTunes movies win)
    if (
      urlLower.includes('imdb.com/title') ||
      urlLower.includes('themoviedb.org/movie') ||
      urlLower.includes('letterboxd.com/film') ||
      urlLower.includes('netflix.com/title') ||
      urlLower.includes('primevideo.com') ||
      urlLower.includes('tv.apple.com') ||
      urlLower.includes('itunes.apple.com') && urlLower.includes('movie') ||
      urlLower.includes('play.google.com/store/movies')
    ) {
      return 'movie';
    }
    
    // Music platforms
    if (
      urlLower.includes('spotify.com/track') ||
      urlLower.includes('spotify.com/album') ||
      urlLower.includes('spotify.com/playlist') ||
      urlLower.includes('music.apple.com') ||
      urlLower.includes('soundcloud.com') ||
      urlLower.includes('bandcamp.com') ||
      urlLower.includes('music.youtube.com') ||
      urlLower.includes('deezer.com')
    ) {
      return 'music';
    }
    
    // Video platforms
    if (
      urlLower.includes('youtube.com') ||
      urlLower.includes('youtu.be') ||
      urlLower.includes('vimeo.com') ||
      urlLower.includes('twitch.tv') ||
      urlLower.includes('dailymotion.com') ||
      urlLower.includes('tiktok.com')
    ) {
      return 'video';
    }
    
    // Podcast platforms (treat as music for now)
    if (
      urlLower.includes('spotify.com/episode') ||
      urlLower.includes('podcasts.apple.com') ||
      urlLower.includes('anchor.fm')
    ) {
      return 'music';
    }
    
    // Image hosting
    if (
      urlLower.includes('flickr.com') ||
      urlLower.includes('imgur.com') ||
      urlLower.includes('instagram.com/p/') ||
      urlLower.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/)
    ) {
      return 'image';
    }
    
    // Document formats (treat as other for now)
    if (
      urlLower.includes('docs.google.com') ||
      urlLower.includes('dropbox.com') ||
      urlLower.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)(\?.*)?$/)
    ) {
      return 'other';
    }
    
    // Default to link for most web pages
    return 'link';
  } catch (error) {
    console.error('Error detecting link type:', error);
    return 'other';
  }
};

// Extract metadata from a URL (title, description, artwork)
export const extractMetadata = async (url: string): Promise<LinkMetadata> => {
  try {
    const media = await lookupMediaFromUrl(url);
    if (media) {
      return {
        title: media.title,
        description: media.description || [media.subtitle, media.collectionName, media.releaseYear].filter(Boolean).join(' · '),
        thumbnail: media.artworkUrl,
        type: media.kind,
        metadata: {
          source: media.source,
          sourceId: media.sourceId,
          artistName: media.subtitle,
          collectionName: media.collectionName,
          releaseDate: media.releaseDate,
          releaseYear: media.releaseYear,
          genres: media.genres,
          artworkUrl: media.artworkUrl,
          previewUrl: media.previewUrl,
          durationMs: media.durationMs,
          contentAdvisory: media.contentAdvisory,
          kind: media.itunesKind || media.kind,
        },
      };
    }

    const detectedType = await detectLinkType(url);
    const pathTitle = decodeURIComponent(url.split('/').filter(Boolean).pop()?.split('?')[0] || '')
      .replace(/[-_]+/g, ' ')
      .trim();

    if (detectedType === 'video' && (url.includes('youtube.com') || url.includes('youtu.be'))) {
      return {
        title: pathTitle || 'Vídeo do YouTube',
        description: 'Vídeo do YouTube',
        type: 'video',
      };
    }

    return {
      title: pathTitle || undefined,
      type: detectedType,
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {};
  }
};
