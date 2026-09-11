import { saveToStorage, loadFromStorage } from '@/utils/storage';
import { clearMediaCache, importLeftoverMediaCache, MEDIA_CACHE_KEY } from '@/utils/mediaCache';
import { MediaMetadata } from '@/types';
import { supabase } from '@/lib/supabase';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const itunesMeta: MediaMetadata = {
  source: 'itunes',
  sourceId: '1',
  artistName: 'From cache',
};

const dbMeta: MediaMetadata = {
  source: 'tmdb',
  sourceId: '27205',
  artistName: 'From database',
};

function mockUpdate(error: unknown = null) {
  const eq = jest.fn().mockResolvedValue({ error });
  const update = jest.fn().mockReturnValue({ eq });
  (supabase.from as jest.Mock).mockReturnValue({ update });
  return { update, eq };
}

beforeEach(async () => {
  await saveToStorage(MEDIA_CACHE_KEY, {});
  (supabase.from as jest.Mock).mockReset();
});

test('imports cache into Postgres then clears device storage', async () => {
  await saveToStorage(MEDIA_CACHE_KEY, { 'link-2': itunesMeta });
  mockUpdate(null);

  const [row] = await importLeftoverMediaCache([{ id: 'link-2', metadata: null }]);

  expect(row.metadata).toEqual(itunesMeta);
  expect(supabase.from).toHaveBeenCalledWith('links');
  expect(await loadFromStorage(MEDIA_CACHE_KEY)).toBeNull();
});

test('does not overwrite metadata that already lives in the database', async () => {
  await saveToStorage(MEDIA_CACHE_KEY, { 'link-1': itunesMeta });
  mockUpdate(null);

  const [row] = await importLeftoverMediaCache([{ id: 'link-1', metadata: dbMeta }]);

  expect(row.metadata).toEqual(dbMeta);
  expect(supabase.from).not.toHaveBeenCalled();
  expect(await loadFromStorage(MEDIA_CACHE_KEY)).toBeNull();
});

test('clears an empty cache without touching Postgres', async () => {
  const [row] = await importLeftoverMediaCache([{ id: 'link-3', metadata: null }]);
  expect(row.metadata).toBeNull();
  expect(supabase.from).not.toHaveBeenCalled();
});

test('clearMediaCache removes the leftover key', async () => {
  await saveToStorage(MEDIA_CACHE_KEY, { 'link-1': itunesMeta });
  await clearMediaCache();
  expect(await loadFromStorage(MEDIA_CACHE_KEY)).toBeNull();
});
