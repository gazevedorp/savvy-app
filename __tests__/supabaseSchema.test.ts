import { isMissingMetadataColumn } from '@/utils/supabaseSchema';
import { LINK_TYPES, isLinkType, normalizeLinkType } from '@/types';

describe('isMissingMetadataColumn', () => {
  it('detects PostgREST schema-cache and Postgres undefined-column codes', () => {
    expect(isMissingMetadataColumn({ code: 'PGRST204' })).toBe(true);
    expect(isMissingMetadataColumn({ code: '42703' })).toBe(true);
    expect(
      isMissingMetadataColumn({
        message: "Could not find the 'metadata' column of 'links' in the schema cache",
      })
    ).toBe(true);
  });

  it('does not treat unrelated metadata errors as a missing column', () => {
    expect(isMissingMetadataColumn(null)).toBe(false);
    expect(isMissingMetadataColumn({ message: 'invalid metadata payload' })).toBe(false);
    expect(isMissingMetadataColumn({ code: '42501', message: 'permission denied' })).toBe(false);
  });
});

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
