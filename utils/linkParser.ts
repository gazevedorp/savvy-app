import { LinkType } from '@/types';

interface LinkMetadata {
  title?: string;
  description?: string;
  thumbnail?: string;
}

// Detect link type based on URL patterns
export const detectLinkType = async (url: string): Promise<LinkType> => {
  try {
    const urlLower = url.toLowerCase();
    
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
    
    // Podcast platforms
    if (
      urlLower.includes('spotify.com/episode') ||
      urlLower.includes('podcasts.apple.com') ||
      urlLower.includes('soundcloud.com') ||
      urlLower.includes('anchor.fm')
    ) {
      return 'podcast';
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
    
    // Document formats
    if (
      urlLower.includes('docs.google.com') ||
      urlLower.includes('dropbox.com') ||
      urlLower.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx)(\?.*)?$/)
    ) {
      return 'document';
    }
    
    // Default to article for most web pages
    return 'article';
  } catch (error) {
    console.error('Error detecting link type:', error);
    return 'other';
  }
};

// Extract metadata from a URL (title, description, etc.)
export const extractMetadata = async (url: string): Promise<LinkMetadata> => {
  // In a real implementation, this would use OpenGraph or server-side scraping
  // For this demo, we'll return a simplified implementation
  try {
    // This is a placeholder for actual metadata extraction
    // In a real app, you would:
    // 1. Use a server-side API to fetch the page
    // 2. Parse the HTML to extract meta tags
    // 3. Return the structured data
    
    // For demo purposes, we're returning dummy metadata based on the URL
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return {
        title: 'YouTube Video',
        description: 'A video from YouTube',
        thumbnail: 'https://via.placeholder.com/300x200?text=YouTube',
      };
    }
    
    return {
      title: url.split('/').pop() || 'Untitled',
      description: 'No description available',
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {};
  }
};