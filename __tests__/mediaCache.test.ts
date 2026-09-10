import { mergeCachedMetadata, saveCachedMediaMetadata } from '@/utils/mediaCache';
import { saveToStorage } from '@/utils/storage';
import { MediaMetadata } from '@/types';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

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

beforeEach(async () => {
  await saveToStorage('media_metadata', {});
});

test('keeps Supabase metadata and does not overwrite with AsyncStorage', async () => {
  await saveCachedMediaMetadata('link-1', itunesMeta);

  const [row] = await mergeCachedMetadata([
    { id: 'link-1', metadata: dbMeta },
  ]);

  expect(row.metadata).toEqual(dbMeta);
});

test('fills metadata from cache only when the DB column is empty', async () => {
  await saveCachedMediaMetadata('link-2', itunesMeta);

  const [row] = await mergeCachedMetadata([
    { id: 'link-2', metadata: null },
  ]);

  expect(row.metadata).toEqual(itunesMeta);
});

test('leaves rows without a cache entry unchanged', async () => {
  const [row] = await mergeCachedMetadata([{ id: 'link-3', metadata: null }]);
  expect(row.metadata).toBeNull();
});
