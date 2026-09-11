import {
  canPreviewUrl,
  genericBodyTitle,
  genericDetailChips,
  genericDetailSubtitle,
  getDetailArtwork,
  isLocalImageLink,
  shouldShowDetailHero,
} from '@/utils/detail';

describe('generic detail helpers', () => {
  it('uses thumbnail, then image url, as hero art', () => {
    expect(
      getDetailArtwork({
        type: 'link',
        url: 'https://example.com',
        thumbnail: 'https://cdn.example.com/og.jpg',
      })
    ).toBe('https://cdn.example.com/og.jpg');
    expect(
      getDetailArtwork({
        type: 'image',
        url: 'https://cdn.example.com/photo.jpg',
      })
    ).toBe('https://cdn.example.com/photo.jpg');
    expect(getDetailArtwork({ type: 'other', url: '' })).toBeUndefined();
  });

  it('shows a hero for media and for items with artwork', () => {
    expect(
      shouldShowDetailHero({ type: 'music', url: 'https://music.apple.com/x', thumbnail: undefined })
    ).toBe(true);
    expect(
      shouldShowDetailHero({
        type: 'link',
        url: 'https://example.com',
        thumbnail: 'https://cdn.example.com/og.jpg',
      })
    ).toBe(true);
    expect(shouldShowDetailHero({ type: 'other', url: '' })).toBe(false);
  });

  it('builds chips and subtitle from type + host', () => {
    expect(
      genericDetailChips({ type: 'video', url: 'https://www.youtube.com/watch?v=1' })
    ).toEqual(['Vídeo', 'youtube.com']);
    expect(genericDetailChips({ type: 'other', url: '' })).toEqual(['Nota']);
    expect(genericDetailSubtitle({ type: 'link', url: 'https://www.nytimes.com/a' })).toBe(
      'nytimes.com'
    );
    expect(genericDetailSubtitle({ type: 'other', url: '', description: 'lista' })).toBeUndefined();
    expect(
      genericDetailSubtitle({ type: 'image', url: 'file://photo.jpg' })
    ).toBe('Imagem do dispositivo');
  });

  it('decides when a web preview makes sense', () => {
    expect(canPreviewUrl({ type: 'link', url: 'https://example.com' })).toBe(true);
    expect(canPreviewUrl({ type: 'other', url: 'https://example.com' })).toBe(false);
    expect(canPreviewUrl({ type: 'image', url: 'file://x.jpg' })).toBe(false);
    expect(isLocalImageLink({ type: 'image', url: 'file://x.jpg' })).toBe(true);
    expect(genericBodyTitle('other')).toBe('Nota');
    expect(genericBodyTitle('video')).toBe('Sobre o vídeo');
  });
});
