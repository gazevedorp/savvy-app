import { buildSaveLinkPayload, mapLinkRecord, SAVE_LINK_RPC } from '@/utils/saveLink';
import { MediaMetadata } from '@/types';

const metadata: MediaMetadata = {
  source: 'itunes',
  sourceId: '1',
  artistName: 'Gal Costa',
};

describe('buildSaveLinkPayload', () => {
  it('always includes category_ids on create so joins are written atomically', () => {
    const payload = buildSaveLinkPayload(
      {
        url: 'https://music.apple.com/song',
        title: 'Baby',
        type: 'music',
        metadata,
        categoryIds: ['cat-a'],
      },
      { replaceCategories: true }
    );

    expect(payload).toEqual({
      url: 'https://music.apple.com/song',
      title: 'Baby',
      type: 'music',
      metadata,
      category_ids: ['cat-a'],
    });
  });

  it('sends an empty category_ids array to clear joins', () => {
    const payload = buildSaveLinkPayload({ categoryIds: [] }, { id: 'link-1', replaceCategories: true });
    expect(payload).toEqual({ id: 'link-1', category_ids: [] });
  });

  it('omits category_ids when joins should stay unchanged', () => {
    const payload = buildSaveLinkPayload({ is_read: true }, { id: 'link-1', replaceCategories: false });
    expect(payload).toEqual({ id: 'link-1', is_read: true });
    expect(payload).not.toHaveProperty('category_ids');
  });

  it('persists metadata null when the caller clears it', () => {
    const payload = buildSaveLinkPayload({ metadata: null }, { id: 'link-1', replaceCategories: false });
    expect(payload.metadata).toBeNull();
  });
});

describe('mapLinkRecord', () => {
  it('prefers category_ids from the RPC result', () => {
    const link = mapLinkRecord({
      id: '1',
      url: 'https://example.com',
      title: 'Example',
      type: 'link',
      metadata: null,
      category_ids: ['a', 'b'],
    });
    expect(link.categoryIds).toEqual(['a', 'b']);
    expect(link.metadata).toBeNull();
    expect(SAVE_LINK_RPC).toBe('save_link_with_categories');
  });

  it('normalizes legacy types', () => {
    expect(mapLinkRecord({ title: 'x', url: '', type: 'podcast' }).type).toBe('music');
  });
});
