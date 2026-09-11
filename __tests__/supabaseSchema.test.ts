import { LINK_TYPES, isLinkType, normalizeLinkType } from '@/types';

describe('LINK_TYPES', () => {
  it('matches the Phase C CHECK constraint', () => {
    expect([...LINK_TYPES]).toEqual(['link', 'video', 'image', 'music', 'movie', 'other']);
  });

  it('normalizes legacy doc values and unknown strings', () => {
    expect(normalizeLinkType('article')).toBe('link');
    expect(normalizeLinkType('document')).toBe('link');
    expect(normalizeLinkType('podcast')).toBe('music');
    expect(normalizeLinkType('movie')).toBe('movie');
    expect(normalizeLinkType('nope')).toBe('other');
    expect(isLinkType('video')).toBe(true);
    expect(isLinkType('article')).toBe(false);
  });
});
