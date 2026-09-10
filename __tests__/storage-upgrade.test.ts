import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearStorage, loadFromStorage, saveToStorage } from '@/utils/storage';
import { detectLinkType } from '@/utils/linkParser';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('loads theme saved before the SDK 57 upgrade', async () => {
  await AsyncStorage.setItem('@savvy_theme', JSON.stringify('dark'));
  await expect(loadFromStorage('theme')).resolves.toBe('dark');
});

test('clears only Savvy keys from storage', async () => {
  await saveToStorage('theme', 'dark');
  await AsyncStorage.setItem('another-app', 'keep');
  await clearStorage();
  expect(await loadFromStorage('theme')).toBeNull();
  expect(await AsyncStorage.getItem('another-app')).toBe('keep');
});

test.each([
  ['https://youtube.com/watch?v=123', 'video'],
  ['https://example.com/photo.png', 'image'],
  ['https://soundcloud.com/artist/song', 'music'],
  ['https://www.imdb.com/title/tt1375666/', 'movie'],
  ['https://docs.google.com/document/123', 'other'],
  ['https://example.com/article', 'link'],
])('detects %s as %s', async (url, type) => {
  await expect(detectLinkType(url)).resolves.toBe(type);
});
