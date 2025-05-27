import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeColors, ThemeMode } from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';

// Theme color palettes
const lightColors: ThemeColors = {
  primary: '#0A84FF',
  primaryLight: '#E5F1FF',
  secondary: '#8E8D8A',
  accent: '#FF6B6B',
  background: '#F9F9FB',
  card: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#8A8A8E',
  border: '#E5E5EA',
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
};

const darkColors: ThemeColors = {
  primary: '#0A84FF',
  primaryLight: '#1F375F',
  secondary: '#8E8D8A',
  accent: '#FF6B6B',
  background: '#1C1C1E',
  card: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#8A8A8E',
  border: '#38383A',
  success: '#30D158',
  error: '#FF453A',
  warning: '#FF9F0A',
};

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: lightColors,
  toggleTheme: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme on initial render
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await loadFromStorage('theme');
        if (savedTheme) {
          setThemeState(savedTheme);
        } else {
          // Use system preference if no saved theme
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

  // Use appropriate color scheme based on theme
  const colors = theme === 'dark' ? darkColors : lightColors;

  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);