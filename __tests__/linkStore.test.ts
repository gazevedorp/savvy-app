import { supabase } from '@/lib/supabase';
import { useLinkStore } from '@/store/linkStore';
import { SAVE_LINK_RPC } from '@/utils/saveLink';
import { AppError } from '@/utils/errors';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getSession: jest.fn() },
    rpc: jest.fn(),
    from: jest.fn(),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
        remove: jest.fn().mockResolvedValue({ error: null }),
      })),
    },
  },
}));

function session(userId = 'user-1') {
  return { data: { session: { user: { id: userId } } }, error: null };
}

function thenable(result: { data?: unknown; error?: unknown }) {
  const query: Record<string, unknown> = {
    then: (resolve: (value: typeof result) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  };
  const self = () => query;
  query.select = jest.fn(self);
  query.order = jest.fn(self);
  query.insert = jest.fn(self);
  query.update = jest.fn(self);
  query.delete = jest.fn(self);
  query.eq = jest.fn(self);
  query.in = jest.fn(self);
  query.single = jest.fn(() => Promise.resolve(result));
  return query;
}

beforeEach(() => {
  useLinkStore.setState({ links: [], isLoading: false, error: null });
  (supabase.auth.getSession as jest.Mock).mockResolvedValue(session());
  (supabase.rpc as jest.Mock).mockReset();
  (supabase.from as jest.Mock).mockReset();
});

describe('addLink', () => {
  it('saves the link and joins in one RPC call', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: {
        id: 'link-1',
        url: 'https://music.apple.com/song',
        title: 'Baby',
        type: 'music',
        metadata: { source: 'itunes', sourceId: '99', artistName: 'Gal Costa' },
        category_ids: ['cat-1'],
        user_id: 'user-1',
      },
      error: null,
    });

    const saved = await useLinkStore.getState().addLink({
      url: 'https://music.apple.com/song',
      title: 'Baby',
      type: 'music',
      metadata: { source: 'itunes', sourceId: '99', artistName: 'Gal Costa' },
      categoryIds: ['cat-1'],
    });

    expect(supabase.rpc).toHaveBeenCalledWith(SAVE_LINK_RPC, {
      p_payload: expect.objectContaining({
        title: 'Baby',
        metadata: expect.objectContaining({ artistName: 'Gal Costa' }),
        category_ids: ['cat-1'],
      }),
    });
    expect(saved.id).toBe('link-1');
    expect(saved.metadata?.artistName).toBe('Gal Costa');
    expect(useLinkStore.getState().links[0].categoryIds).toEqual(['cat-1']);
    expect(useLinkStore.getState().error).toBeNull();
  });

  it('throws a user-facing error and does not keep a local row', async () => {
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'Could not find the function public.save_link_with_categories' },
    });

    await expect(
      useLinkStore.getState().addLink({ url: 'https://x.com', title: 'X', type: 'link' })
    ).rejects.toBeInstanceOf(AppError);

    expect(useLinkStore.getState().links).toEqual([]);
    expect(useLinkStore.getState().error).toMatch(/Phase D/);
  });
});

describe('updateLink', () => {
  it('omits category_ids when only toggling read', async () => {
    useLinkStore.setState({
      links: [
        {
          id: 'link-1',
          url: 'https://example.com',
          title: 'Example',
          type: 'link',
          categoryIds: ['keep'],
          is_read: false,
        },
      ],
    });
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: {
        id: 'link-1',
        url: 'https://example.com',
        title: 'Example',
        type: 'link',
        is_read: true,
        category_ids: ['keep'],
      },
      error: null,
    });

    await useLinkStore.getState().updateLink('link-1', { is_read: true });

    expect(supabase.rpc).toHaveBeenCalledWith(SAVE_LINK_RPC, {
      p_payload: { id: 'link-1', is_read: true },
    });
    expect(useLinkStore.getState().links[0].is_read).toBe(true);
    expect(useLinkStore.getState().links[0].categoryIds).toEqual(['keep']);
  });

  it('does not apply local changes when the RPC fails', async () => {
    useLinkStore.setState({
      links: [{ id: 'link-1', url: 'https://a.com', title: 'A', type: 'link' }],
    });
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'row-level security' },
    });

    await expect(
      useLinkStore.getState().updateLink('link-1', { title: 'Nope' })
    ).rejects.toBeInstanceOf(AppError);

    expect(useLinkStore.getState().links[0].title).toBe('A');
    expect(useLinkStore.getState().error).toMatch(/permissão/);
  });
});

describe('deleteLink', () => {
  it('removes the row only after a successful delete', async () => {
    useLinkStore.setState({
      links: [{ id: 'link-1', url: 'https://a.com', title: 'A', type: 'link' }],
    });
    (supabase.from as jest.Mock).mockReturnValue(thenable({ error: null }));

    await useLinkStore.getState().deleteLink('link-1');
    expect(useLinkStore.getState().links).toEqual([]);
  });

  it('throws and keeps the row on failure', async () => {
    useLinkStore.setState({
      links: [{ id: 'link-1', url: 'https://a.com', title: 'A', type: 'link' }],
    });
    (supabase.from as jest.Mock).mockReturnValue(thenable({ error: { message: 'permission denied' } }));

    await expect(useLinkStore.getState().deleteLink('link-1')).rejects.toBeInstanceOf(AppError);
    expect(useLinkStore.getState().links).toHaveLength(1);
  });
});

describe('fetchLinks', () => {
  it('uses Postgres metadata and ignores an empty device cache', async () => {
    (supabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'links') {
        return thenable({
          data: [
            {
              id: 'link-1',
              url: 'https://example.com',
              title: 'From DB',
              type: 'movie',
              metadata: { source: 'tmdb', sourceId: '1', artistName: 'Nolan' },
            },
          ],
          error: null,
        });
      }
      return thenable({ data: [{ link_id: 'link-1', category_id: 'c1' }], error: null });
    });

    await useLinkStore.getState().fetchLinks();

    const link = useLinkStore.getState().links[0];
    expect(link.title).toBe('From DB');
    expect(link.metadata?.artistName).toBe('Nolan');
    expect(link.categoryIds).toEqual(['c1']);
  });
});
