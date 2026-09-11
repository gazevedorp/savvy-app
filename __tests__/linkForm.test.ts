import { canSaveLinkForm, urlPlaceholderForType } from '@/utils/linkForm';

describe('link form helpers', () => {
  it('requires a title for notes and title+url otherwise', () => {
    expect(canSaveLinkForm({ type: 'other', title: '  ', url: '' })).toBe(false);
    expect(canSaveLinkForm({ type: 'other', title: 'Lista', url: '' })).toBe(true);
    expect(canSaveLinkForm({ type: 'link', title: 'Artigo', url: '' })).toBe(false);
    expect(canSaveLinkForm({ type: 'link', title: 'Artigo', url: 'https://x.com' })).toBe(true);
    expect(canSaveLinkForm({ type: 'link', title: 'Artigo', url: 'https://x.com', saving: true })).toBe(
      false
    );
  });

  it('uses pt-BR URL placeholders', () => {
    expect(urlPlaceholderForType('video')).toBe('URL do vídeo');
    expect(urlPlaceholderForType('link')).toBe('https://exemplo.com');
  });
});
