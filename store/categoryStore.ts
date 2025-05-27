import { create } from 'zustand';
import { Category } from '@/types';
import { generateId } from '@/utils/idGenerator';
import { loadFromStorage, saveToStorage } from '@/utils/storage';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (category: Partial<Category>) => Promise<Category>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

// Default categories with predefined colors
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Articles',
    color: '#0A84FF',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-2',
    name: 'Videos',
    color: '#FF2D55',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-3',
    name: 'Tutorials',
    color: '#5856D6',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cat-4',
    name: 'Recipes',
    color: '#FF9500',
    createdAt: new Date().toISOString(),
  },
];

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,
  
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      let storedCategories = await loadFromStorage('categories');
      
      // Initialize with default categories if none exist
      if (!storedCategories || storedCategories.length === 0) {
        storedCategories = DEFAULT_CATEGORIES;
        await saveToStorage('categories', storedCategories);
      }
      
      set({ categories: storedCategories, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load categories', isLoading: false });
      console.error('Error loading categories:', error);
    }
  },
  
  addCategory: async (categoryData: Partial<Category>) => {
    const newCategory: Category = {
      id: generateId(),
      name: categoryData.name || 'New Category',
      color: categoryData.color || '#0A84FF',
      icon: categoryData.icon,
      createdAt: new Date().toISOString(),
    };
    
    set(state => {
      const updatedCategories = [...state.categories, newCategory];
      saveToStorage('categories', updatedCategories);
      return { categories: updatedCategories };
    });
    
    return newCategory;
  },
  
  updateCategory: async (id: string, data: Partial<Category>) => {
    set(state => {
      const updatedCategories = state.categories.map(category => 
        category.id === id ? { ...category, ...data } : category
      );
      saveToStorage('categories', updatedCategories);
      return { categories: updatedCategories };
    });
  },
  
  deleteCategory: async (id: string) => {
    set(state => {
      const updatedCategories = state.categories.filter(category => category.id !== id);
      saveToStorage('categories', updatedCategories);
      return { categories: updatedCategories };
    });
  },
}));