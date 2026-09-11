import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import {
  ThemeColors,
  ThemeElevation,
  ThemeMode,
  ThemeRadius,
  ThemeSpacing,
  ThemeTypography,
} from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';

/**
 * Savvy palette — warm paper + ink teal.
 * Leaves the generic iOS system blue (#0A84FF) behind.
 * Hierarchy matches MediaDetailView: hero, chips, bordered cards.
 */
export const lightColors: ThemeColors = {
  primary: '#0F6E6A',
  primaryLight: '#D9EFED',
  secondary: '#7A746C',
  accent: '#C45D26',
  background: '#F5F2ED',
  card: '#FFFCF7',
  text: '#1A1916',
  textSecondary: '#6F6A63',
  border: '#E6E0D6',
  success: '#2F8A56',
  error: '#C43D3A',
  warning: '#C98912',
  onPrimary: '#FFFFFF',
  overlay: 'rgba(26, 25, 22, 0.48)',
};

export const darkColors: ThemeColors = {
  primary: '#5BC4BE',
  primaryLight: '#1E3F3D',
  secondary: '#C2BBB2',
  accent: '#E78A55',
  background: '#12110F',
  card: '#2A2622',
  text: '#F7F3ED',
  textSecondary: '#C2BBB2',
  border: '#524A42',
  success: '#5FBF82',
  error: '#F0716C',
  warning: '#E8B44A',
  onPrimary: '#0C1615',
  overlay: 'rgba(0, 0, 0, 0.72)',
};

export const spacing: ThemeSpacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius: ThemeRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const elevation: ThemeElevation = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#1A1916',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A1916',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A1916',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
  },
};

export const typography: ThemeTypography = {
  hero: {
    fontFamily: 'Inter-Bold',
    fontSize: 26,
    lineHeight: 32,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    lineHeight: 24,
  },
  heading: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    lineHeight: 22,
  },
  subtitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 15,
    lineHeight: 20,
  },
  body: {
    fontFamily: 'Inter-Regular',
    fontSize: 15,
    lineHeight: 24,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    lineHeight: 16,
  },
  overline: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  micro: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    lineHeight: 14,
  },
};

export interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  elevation: ThemeElevation;
  typography: ThemeTypography;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: lightColors,
  spacing,
  radius,
  elevation,
  typography,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await loadFromStorage<ThemeMode>('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
          setThemeState(savedTheme);
        } else {
          setThemeState(systemColorScheme === 'dark' ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    saveToStorage('theme', newTheme);
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{ theme, colors, spacing, radius, elevation, typography, toggleTheme, setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
