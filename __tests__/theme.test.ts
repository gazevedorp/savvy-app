jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import {
  darkColors,
  elevation,
  lightColors,
  radius,
  spacing,
  typography,
} from '@/context/ThemeContext';

function channel(hex: string, offset: number): number {
  const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
}

function contrast(a: string, b: string): number {
  const first = luminance(a);
  const second = luminance(b);
  const [hi, lo] = first > second ? [first, second] : [second, first];
  return (hi + 0.05) / (lo + 0.05);
}

describe('Savvy theme tokens', () => {
  it('uses an own palette instead of iOS system blue', () => {
    expect(lightColors.primary.toUpperCase()).not.toBe('#0A84FF');
    expect(darkColors.primary.toUpperCase()).not.toBe('#0A84FF');
    expect(lightColors.primary).toBe('#0F6E6A');
    expect(darkColors.primary).toBe('#5BC4BE');
  });

  it('exposes spacing, radius, elevation and typography scales', () => {
    expect(spacing.md).toBe(16);
    expect(radius.md).toBe(12);
    expect(radius.lg).toBe(16);
    expect(elevation.md.elevation).toBe(4);
    expect(typography.hero.fontSize).toBe(26);
    expect(typography.overline.textTransform).toBe('uppercase');
    expect(lightColors.onPrimary).toBe('#FFFFFF');
  });

  it('keeps dark mode text and surfaces readable', () => {
    expect(contrast(darkColors.text, darkColors.background)).toBeGreaterThan(12);
    expect(contrast(darkColors.text, darkColors.card)).toBeGreaterThan(10);
    expect(contrast(darkColors.textSecondary, darkColors.background)).toBeGreaterThan(7);
    expect(contrast(darkColors.textSecondary, darkColors.card)).toBeGreaterThan(6);
    expect(contrast(darkColors.primary, darkColors.background)).toBeGreaterThan(7);
    expect(contrast(darkColors.onPrimary, darkColors.primary)).toBeGreaterThan(7);
    expect(luminance(darkColors.card)).toBeGreaterThan(luminance(darkColors.background));
    expect(luminance(darkColors.border)).toBeGreaterThan(luminance(darkColors.card));
  });
});
