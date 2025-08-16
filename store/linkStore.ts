import { create } from "zustand";
import { Link } from "@/types";
import { supabase } from '@/lib/supabase';

interface LinkState {
  links: Link[];
  isLoading: boolean;
  error: string | null;
  fetchLinks: () => Promise<void>;
  addLink: (link: Partial<Link>) => Promise<Link>;
  updateLink: (id: string, data: Partial<Link>) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  clearAllLinks: () => Promise<void>;
  removeCategoryFromAssociatedLinks: (categoryId: string) => Promise<void>;
  deleteLinksAssociatedWithCategory: (categoryId: string) => Promise<void>;
}

export const useLinkStore = create<LinkState>((set, get) => ({
  links: [],
  isLoading: false,
  error: null,

  fetchLinks: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        set({ links: [], isLoading: false });
        return;
      }

      // Buscar links
      const { data: linksData, error: linksError } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });

      if (linksError) throw linksError;

      // Buscar relacionamentos link-categoria
      const { data: linkCategoriesData, error: linkCategoriesError } = await supabase
        .from('link_categories')
        .select('link_id, category_id');

      if (linkCategoriesError) throw linkCategoriesError;

      // Mapear links com suas categorias
      const linksWithCategories: Link[] = (linksData || []).map(linkData => {
        const categoryIds = (linkCategoriesData || [])
          .filter(lc => lc.link_id === linkData.id)
          .map(lc => lc.category_id);

        return {
          id: linkData.id,
          url: linkData.url,
          title: linkData.title,
          description: linkData.description,
          thumbnail: linkData.thumbnail,
          type: linkData.type as any,
          categoryIds,
          user_id: linkData.user_id,
          created_at: linkData.created_at,
          is_read: linkData.is_read,
          read_at: linkData.read_at,
          progress: linkData.progress,
        };
      });

      set({ links: linksWithCategories, isLoading: false });
    } catch (error) {
      console.error('Error fetching links:', error);
      set({ error: 'Erro ao carregar links', isLoading: false });
    }
  },

  addLink: async (linkData: Partial<Link>) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error('Usuário não autenticado');
      }

      // Remove id since Supabase will auto-generate
      const newLinkData = {
        url: linkData.url || "",
        title: linkData.title || "",
        description: linkData.description || "",
        thumbnail: linkData.thumbnail,
        type: linkData.type || "article",
        user_id: session.session.user.id,
        is_read: linkData.is_read || false,
        read_at: linkData.read_at,
        progress: linkData.progress || 0,
      };

      // Inserir link
      const { data: insertedLink, error: linkError } = await supabase
        .from('links')
        .insert([newLinkData])
        .select()
        .single();

      if (linkError) throw linkError;

      // Inserir relacionamentos com categorias se existirem
      if (linkData.categoryIds && linkData.categoryIds.length > 0) {
        const linkCategoryInserts = linkData.categoryIds.map(categoryId => ({
          link_id: insertedLink.id,
          category_id: categoryId,
          user_id: session.session.user.id,
        }));

        const { error: linkCategoriesError } = await supabase
          .from('link_categories')
          .insert(linkCategoryInserts);

        if (linkCategoriesError) throw linkCategoriesError;
      }

      const newLink: Link = {
        id: insertedLink.id,
        url: insertedLink.url,
        title: insertedLink.title,
        description: insertedLink.description,
        thumbnail: insertedLink.thumbnail,
        type: insertedLink.type,
        categoryIds: linkData.categoryIds || [],
        user_id: insertedLink.user_id,
        created_at: insertedLink.created_at,
        is_read: insertedLink.is_read,
        read_at: insertedLink.read_at,
        progress: insertedLink.progress,
      };

      set(state => ({
        links: [newLink, ...state.links],
        isLoading: false
      }));

      return newLink;
    } catch (error) {
      console.error('Error adding link:', error);
      set({ error: 'Erro ao adicionar link', isLoading: false });
      throw error;
    }
  },

  updateLink: async (id: string, data: Partial<Link>) => {
    set({ isLoading: true, error: null });
    
    try {
      // Atualizar dados do link
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.is_read !== undefined) updateData.is_read = data.is_read;
      if (data.read_at !== undefined) updateData.read_at = data.read_at;
      if (data.progress !== undefined) updateData.progress = data.progress;

      if (Object.keys(updateData).length > 0) {
        const { error: linkError } = await supabase
          .from('links')
          .update(updateData)
          .eq('id', id);

        if (linkError) throw linkError;
      }

      // Atualizar categorias se fornecidas
      if (data.categoryIds !== undefined) {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session?.user) {
          throw new Error('Usuário não autenticado');
        }

        // Remover relacionamentos existentes
        const { error: deleteError } = await supabase
          .from('link_categories')
          .delete()
          .eq('link_id', id);

        if (deleteError) throw deleteError;

        // Adicionar novos relacionamentos
        if (data.categoryIds.length > 0) {
          const linkCategoryInserts = data.categoryIds.map(categoryId => ({
            link_id: id,
            category_id: categoryId,
            user_id: session.session.user.id,
          }));

          const { error: insertError } = await supabase
            .from('link_categories')
            .insert(linkCategoryInserts);

          if (insertError) throw insertError;
        }
      }

      set(state => ({
        links: state.links.map(link =>
          link.id === id ? { ...link, ...data } : link
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating link:', error);
      set({ error: 'Erro ao atualizar link', isLoading: false });
    }
  },

  deleteLink: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        links: state.links.filter(link => link.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting link:', error);
      set({ error: 'Erro ao deletar link', isLoading: false });
    }
  },

  clearAllLinks: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('links')
        .delete()
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      set({ links: [], isLoading: false });
    } catch (error) {
      console.error('Error clearing links:', error);
      set({ error: 'Erro ao limpar links', isLoading: false });
    }
  },

  removeCategoryFromAssociatedLinks: async (categoryId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Remover relacionamentos da categoria
      const { error } = await supabase
        .from('link_categories')
        .delete()
        .eq('category_id', categoryId);

      if (error) throw error;

      // Atualizar estado local
      set(state => ({
        links: state.links.map(link => ({
          ...link,
          categoryIds: link.categoryIds?.filter(id => id !== categoryId) || [],
        })),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error removing category from links:', error);
      set({ error: 'Erro ao remover categoria dos links', isLoading: false });
    }
  },

  deleteLinksAssociatedWithCategory: async (categoryId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Buscar links associados à categoria
      const { data: linkCategories, error: fetchError } = await supabase
        .from('link_categories')
        .select('link_id')
        .eq('category_id', categoryId);

      if (fetchError) throw fetchError;

      if (linkCategories && linkCategories.length > 0) {
        const linkIds = linkCategories.map(lc => lc.link_id);
        
        // Deletar os links
        const { error: deleteError } = await supabase
          .from('links')
          .delete()
          .in('id', linkIds);

        if (deleteError) throw deleteError;
      }

      // Atualizar estado local
      set(state => ({
        links: state.links.filter(link => !link.categoryIds?.includes(categoryId)),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting links associated with category:', error);
      set({ error: 'Erro ao deletar links da categoria', isLoading: false });
    }
  },
}));
