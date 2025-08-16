import { create } from "zustand";
import { Category } from "@/types";
import { supabase } from '@/lib/supabase';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (category: Partial<Category>) => Promise<Category>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearAllCategories: () => Promise<void>;
  editCategory: (id: string, name: string, color?: string) => Promise<void>;
}

// Default categories with predefined colors
const DEFAULT_CATEGORIES: Omit<Category, 'user_id'>[] = [
  {
    id: "cat-1",
    name: "Articles",
    color: "#0A84FF",
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-2",
    name: "Technology",
    color: "#FF2D55",
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-3",
    name: "Tutorials",
    color: "#5856D6",
    created_at: new Date().toISOString(),
  },
  {
    id: "cat-4",
    name: "Business",
    color: "#FF9500",
    created_at: new Date().toISOString(),
  },
];

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        set({ isLoading: false });
        return;
      }

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      let categoriesToSet: Category[];

      if (data && data.length > 0) {
        categoriesToSet = data.map(item => ({
          id: item.id,
          name: item.name,
          color: item.color,
          icon: item.icon,
          user_id: item.user_id,
          created_at: item.created_at,
        }));
      } else {
        // Se não há categorias, criar as padrões
        categoriesToSet = [];
        for (const defaultCat of DEFAULT_CATEGORIES) {
          const newCategory = {
            ...defaultCat,
            user_id: session.session.user.id,
            created_at: defaultCat.created_at,
          };

          const { error: insertError } = await supabase
            .from('categories')
            .insert([newCategory]);

          if (!insertError) {
            categoriesToSet.push({
              ...defaultCat,
              user_id: session.session.user.id,
            });
          }
        }
      }

      set({ categories: categoriesToSet, isLoading: false });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ error: 'Erro ao carregar categorias', isLoading: false });
    }
  },

  addCategory: async (categoryData: Partial<Category>) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error('Usuário não autenticado');
      }

      // Remove id since Supabase will auto-generate
      const newCategory = {
        name: categoryData.name || "New Category",
        color: categoryData.color || "#0A84FF",
        icon: categoryData.icon,
        user_id: session.session.user.id,
      };

      const { data, error } = await supabase
        .from('categories')
        .insert([newCategory])
        .select()
        .single();

      if (error) throw error;

      const category: Category = {
        id: data.id,
        name: data.name,
        color: data.color,
        icon: data.icon,
        user_id: data.user_id,
        created_at: data.created_at,
      };

      set(state => ({
        categories: [category, ...state.categories],
        isLoading: false
      }));

      return category;
    } catch (error) {
      console.error('Error adding category:', error);
      set({ error: 'Erro ao adicionar categoria', isLoading: false });
      throw error;
    }
  },

  updateCategory: async (id: string, data: Partial<Category>) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: data.name,
          color: data.color,
          icon: data.icon,
        })
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        categories: state.categories.map(category =>
          category.id === id ? { ...category, ...data } : category
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating category:', error);
      set({ error: 'Erro ao atualizar categoria', isLoading: false });
    }
  },

  editCategory: async (id: string, name: string, color?: string) => {
    const updates: Partial<Category> = { name };
    if (color) updates.color = color;
    await get().updateCategory(id, updates);
  },

  deleteCategory: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        categories: state.categories.filter(category => category.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting category:', error);
      set({ error: 'Erro ao deletar categoria', isLoading: false });
    }
  },

  clearAllCategories: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      set({ categories: [], isLoading: false });
    } catch (error) {
      console.error('Error clearing categories:', error);
      set({ error: 'Erro ao limpar categorias', isLoading: false });
    }
  },
}));
