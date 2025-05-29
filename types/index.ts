// Link Types
export type LinkType = 'link' | 'video' | 'image' | 'music' | 'text';

export interface Link {
  id: string;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  type: LinkType;
  categoryIds: string[];
  createdAt: string;
  isRead: boolean;
  readAt?: string;
  progress?: number; // For tracking reading/watching progress (0-100)
}

// Category Types
export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: string;
}

// Theme Types
export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
}