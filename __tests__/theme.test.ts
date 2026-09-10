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

describe('Savvy theme tokens', () => {
  it('uses an own palette instead of iOS system blue', () => {
    expect(lightColors.primary.toUpperCase()).not.toBe('#0A84FF');
    expect(darkColors.primary.toUpperCase()).not.toBe('#0A84FF');
    expect(lightColors.primary).toBe('#0F6E6A');
    expect(darkColors.primary).toBe('#3DAEA8');
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
});
