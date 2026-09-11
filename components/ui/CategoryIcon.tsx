import React from 'react';
import {
  BookOpen,
  Bookmark,
  Briefcase,
  Camera,
  Code,
  Coffee,
  Film,
  Folder,
  Gamepad2,
  Globe,
  Headphones,
  Heart,
  Image as ImageIcon,
  Link as LinkIcon,
  Newspaper,
  Plane,
  ShoppingBag,
  Star,
  type LucideIcon,
} from 'lucide-react-native';
import {
  CATEGORY_ICON_IDS,
  CategoryIconId,
  normalizeCategoryIcon,
} from '@/utils/categories';

const ICONS: Record<CategoryIconId, LucideIcon> = {
  folder: Folder,
  bookmark: Bookmark,
  'book-open': BookOpen,
  newspaper: Newspaper,
  film: Film,
  headphones: Headphones,
  image: ImageIcon,
  link: LinkIcon,
  globe: Globe,
  code: Code,
  briefcase: Briefcase,
  heart: Heart,
  star: Star,
  camera: Camera,
  gamepad: Gamepad2,
  coffee: Coffee,
  plane: Plane,
  'shopping-bag': ShoppingBag,
};

export const CATEGORY_ICON_OPTIONS = CATEGORY_ICON_IDS;

export default function CategoryIcon({
  name,
  color,
  size = 22,
}: {
  name?: string | null;
  color: string;
  size?: number;
}) {
  const Icon = ICONS[normalizeCategoryIcon(name)];
  return <Icon size={size} color={color} />;
}
