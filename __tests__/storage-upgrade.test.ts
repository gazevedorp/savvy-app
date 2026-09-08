import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLinkStore } from '../store/linkStore';
import { useCategoryStore } from '../store/categoryStore';
import { clearStorage, loadFromStorage, saveToStorage } from '../utils/storage';
import { detectLinkType } from '../utils/linkParser';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

beforeEach(async () => {
  await AsyncStorage.clear();
  useLinkStore.setState({ links: [], isLoading: false, error: null });
  useCategoryStore.setState({ categories: [], isLoading: false, error: null });
});

test('loads the saved data format from SDK 53 without losing links, categories or theme', async () => {
  const category = { id: 'cat-existing', name: 'Work', color: '#0A84FF', createdAt: '2025-05-01T00:00:00.000Z' };
  const link = { id: 'existing', title: 'Saved article', url: 'https://example.com/article', type: 'link', categoryIds: [category.id], createdAt: '2025-05-01T00:00:00.000Z', isRead: true };
  await AsyncStorage.multiSet([
    ['@savvy_links', JSON.stringify([link])],
    ['@savvy_categories', JSON.stringify([category])],
    ['@savvy_theme', JSON.stringify('dark')],
  ]);
  await useLinkStore.getState().fetchLinks();
  await useCategoryStore.getState().fetchCategories();
  expect(useLinkStore.getState().links).toEqual([link]);
  expect(useCategoryStore.getState().categories).toEqual([category]);
  expect(await loadFromStorage('theme')).toBe('dark');
});

test('creates, edits, reloads and deletes a note with the upgraded stores', async () => {
  const note = await useLinkStore.getState().addLink({ title: 'Upgrade check', type: 'text', description: 'Saved locally' });
  await useLinkStore.getState().updateLink(note.id, { isRead: true, title: 'Updated note' });
  useLinkStore.setState({ links: [] });
  await useLinkStore.getState().fetchLinks();
  expect(useLinkStore.getState().links).toEqual([expect.objectContaining({ id: note.id, type: 'text', title: 'Updated note', description: 'Saved locally', isRead: true })]);
  await useLinkStore.getState().deleteLink(note.id);
  await useLinkStore.getState().fetchLinks();
  expect(useLinkStore.getState().links).toEqual([]);
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
  ['https://docs.google.com/document/123', 'link'],
  ['https://example.com/article', 'link'],
])('detects %s as a supported content type', async (url, type) => {
  await expect(detectLinkType(url)).resolves.toBe(type);
});
