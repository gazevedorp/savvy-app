import {
  CATEGORY_ICON_IDS,
  contrastOnColor,
  countLinksInCategory,
  formatCategoryCount,
  isCategoryIconId,
  normalizeCategoryIcon,
} from '@/utils/categories';

describe('category helpers', () => {
  it('formats item counts in pt-BR', () => {
    expect(formatCategoryCount(0)).toBe('0 itens');
    expect(formatCategoryCount(1)).toBe('1 item');
    expect(formatCategoryCount(4)).toBe('4 itens');
  });

  it('counts links associated with a category', () => {
    const links = [
      { categoryIds: ['a', 'b'] },
      { categoryIds: ['b'] },
      { categoryIds: [] },
      {},
    ];
    expect(countLinksInCategory(links, 'a')).toBe(1);
    expect(countLinksInCategory(links, 'b')).toBe(2);
    expect(countLinksInCategory(links, 'missing')).toBe(0);
  });

  it('normalizes known icons and falls back to folder', () => {
    expect(isCategoryIconId('film')).toBe(true);
    expect(isCategoryIconId('spaceship')).toBe(false);
    expect(normalizeCategoryIcon('headphones')).toBe('headphones');
    expect(normalizeCategoryIcon('nope')).toBe('folder');
    expect(normalizeCategoryIcon(undefined)).toBe('folder');
    expect(CATEGORY_ICON_IDS).toContain('bookmark');
  });

  it('picks black or white ink for category swatches', () => {
    expect(contrastOnColor('#F5F2ED')).toBe('#000000');
    expect(contrastOnColor('#0F6E6A')).toBe('#FFFFFF');
    expect(contrastOnColor('#FFF')).toBe('#000000');
    expect(contrastOnColor('not-a-color')).toBe('#FFFFFF');
  });
});
