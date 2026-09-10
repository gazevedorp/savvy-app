// Link Types
export type LinkType = 'link' | 'video' | 'image' | 'music' | 'movie' | 'other';

export type MediaSource = 'itunes' | 'deezer' | 'tmdb' | 'wikipedia';

export interface MediaMetadata {
  source: MediaSource;
  sourceId: string;
  artistName?: string;
  collectionName?: string;
  releaseDate?: string;
  releaseYear?: string;
  genres?: string[];
  artworkUrl?: string;
  previewUrl?: string;
  durationMs?: number;
  contentAdvisory?: string;
  kind?: string;
}

export interface Link {
  id?: string; // Optional because Supabase will auto-generate
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  type: LinkType;
  categoryIds?: string[]; // Optional, will be handled through link_categories table
  user_id?: string; // Optional because it will be set automatically
  created_at?: string; // Database field name (instead of createdAt)
  is_read?: boolean; // Database field name (instead of isRead)
  read_at?: string; // Database field name (instead of readAt)
  progress?: number; // For tracking reading/watching progress (0-100)
  metadata?: MediaMetadata | null;
}

// Category Types
export interface Category {
  id?: string; // Optional because Supabase will auto-generate
  name: string;
  color: string;
  icon?: string;
  user_id?: string; // Optional because it will be set automatically
  created_at?: string; // Database field name (instead of createdAt)
}

// Link-Category Relationship
export interface LinkCategory {
  id?: string; // Optional because Supabase will auto-generate
  link_id: string;
  category_id: string;
  user_id?: string; // Optional because it will be set automatically
  created_at?: string; // Optional because it will be set automatically
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
  onPrimary: string;
  overlay: string;
}

export interface ThemeSpacing {
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
}

export interface ThemeRadius {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ThemeElevationLevel {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface ThemeElevation {
  none: ThemeElevationLevel;
  sm: ThemeElevationLevel;
  md: ThemeElevationLevel;
  lg: ThemeElevationLevel;
}

export interface ThemeTypeStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export interface ThemeTypography {
  hero: ThemeTypeStyle;
  title: ThemeTypeStyle;
  heading: ThemeTypeStyle;
  subtitle: ThemeTypeStyle;
  body: ThemeTypeStyle;
  label: ThemeTypeStyle;
  caption: ThemeTypeStyle;
  overline: ThemeTypeStyle;
  micro: ThemeTypeStyle;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
  confirmPassword?: string;
}
