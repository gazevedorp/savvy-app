export const CATEGORY_ICON_IDS = [
  'folder',
  'bookmark',
  'book-open',
  'newspaper',
  'film',
  'headphones',
  'image',
  'link',
  'globe',
  'code',
  'briefcase',
  'heart',
  'star',
  'camera',
  'gamepad',
  'coffee',
  'plane',
  'shopping-bag',
] as const;

export type CategoryIconId = (typeof CATEGORY_ICON_IDS)[number];

export const DEFAULT_CATEGORY_ICON: CategoryIconId = 'folder';

export function isCategoryIconId(value: unknown): value is CategoryIconId {
  return typeof value === 'string' && (CATEGORY_ICON_IDS as readonly string[]).includes(value);
}

export function normalizeCategoryIcon(value?: string | null): CategoryIconId {
  return isCategoryIconId(value) ? value : DEFAULT_CATEGORY_ICON;
}

export function formatCategoryCount(count: number): string {
  if (count === 1) return '1 item';
  return `${count} itens`;
}

export function countLinksInCategory(
  links: { categoryIds?: string[] }[],
  categoryId: string
): number {
  if (!categoryId) return 0;
  return links.filter((link) => link.categoryIds?.includes(categoryId)).length;
}

/** Readable ink/paper on a category color swatch. */
export function contrastOnColor(hexColor?: string | null): '#000000' | '#FFFFFF' {
  const hex = (hexColor || '').replace('#', '');
  const normalized =
    hex.length === 3
      ? hex
          .split('')
          .map((ch) => ch + ch)
          .join('')
      : hex;
  if (normalized.length < 6) return '#FFFFFF';
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((channel) => Number.isNaN(channel))) return '#FFFFFF';
  const brightness = Math.round((r * 299 + g * 587 + b * 114) / 1000);
  return brightness > 125 ? '#000000' : '#FFFFFF';
}

export const CATEGORY_COLOR_OPTIONS = [
  '#0F6E6A',
  '#C45D26',
  '#FF2D55',
  '#5856D6',
  '#34C759',
  '#FF9500',
  '#C9A227',
  '#AF52DE',
] as const;
