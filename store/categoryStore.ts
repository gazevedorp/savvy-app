import { create } from "zustand";
import { Category } from "@/types";
import { supabase } from '@/lib/supabase';
import { failWithUserMessage } from '@/utils/errors';

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

const DEFAULT_CATEGORIES: Pick<Category, 'name' | 'color' | 'icon'>[] = [
  { name: "Artigos", color: "#0F6E6A", icon: "newspaper" },
  { name: "Tecnologia", color: "#FF2D55", icon: "code" },
  { name: "Tutoriais", color: "#5856D6", icon: "book-open" },
  { name: "Negócios", color: "#FF9500", icon: "briefcase" },
];

function mapCategory(item: Category): Category {
  return {
    id: item.id,
    name: item.name,
    color: item.color,
    icon: item.icon,
    user_id: item.user_id,
    created_at: item.created_at,
  };
}

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const userId = data.session?.user?.id;
  if (!userId) {
    throw new Error('Usuário não autenticado');
  }
  return userId;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        set({ categories: [], isLoading: false, error: null });
        return;
      }
      const userId = session.session.user.id;

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      let categoriesToSet: Category[] = (data || []).map(mapCategory);

      if (categoriesToSet.length === 0) {
        const seeded: Category[] = [];
        for (const defaultCat of DEFAULT_CATEGORIES) {
          const { data: inserted, error: insertError } = await supabase
            .from('categories')
            .insert({
              name: defaultCat.name,
              color: defaultCat.color,
              icon: defaultCat.icon,
              user_id: userId,
            })
            .select()
            .single();

          if (insertError) throw insertError;
          if (inserted) seeded.push(mapCategory(inserted));
        }
        categoriesToSet = seeded;
      }

      set({ categories: categoriesToSet, isLoading: false, error: null });
    } catch (error) {
      const appError = failWithUserMessage(error, 'Não foi possível carregar as categorias.');
      set({ error: appError.userMessage, isLoading: false });
      throw appError;
    }
  },

  addCategory: async (categoryData: Partial<Category>) => {
    set({ isLoading: true, error: null });

    try {
      const userId = await requireUserId();

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: categoryData.name || "Nova categoria",
          color: categoryData.color || "#0F6E6A",
          icon: categoryData.icon,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      const category = mapCategory(data);

      set((state) => ({
        categories: [category, ...state.categories],
        isLoading: false,
        error: null,
      }));

      return category;
    } catch (error) {
      const appError = failWithUserMessage(error, 'Não foi possível adicionar a categoria.');
      set({ error: appError.userMessage, isLoading: false });
      throw appError;
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

      set((state) => ({
        categories: state.categories.map((category) =>
          category.id === id ? { ...category, ...data } : category
        ),
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const appError = failWithUserMessage(error, 'Não foi possível atualizar a categoria.');
      set({ error: appError.userMessage, isLoading: false });
      throw appError;
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
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;

      set((state) => ({
        categories: state.categories.filter((category) => category.id !== id),
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      const appError = failWithUserMessage(error, 'Não foi possível excluir a categoria.');
      set({ error: appError.userMessage, isLoading: false });
      throw appError;
    }
  },

  clearAllCategories: async () => {
    set({ isLoading: true, error: null });

    try {
      const userId = await requireUserId();
      const { error } = await supabase.from('categories').delete().eq('user_id', userId);
      if (error) throw error;

      set({ categories: [], isLoading: false, error: null });
    } catch (error) {
      const appError = failWithUserMessage(error, 'Não foi possível limpar as categorias.');
      set({ error: appError.userMessage, isLoading: false });
      throw appError;
    }
  },
}));
