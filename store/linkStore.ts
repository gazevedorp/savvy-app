import { create } from "zustand";
import { Link } from "@/types";
import { supabase } from '@/lib/supabase';
import { failWithUserMessage } from '@/utils/errors';
import { deleteStoredImage, deleteStoredImages } from '@/utils/imageUpload';
import { importLeftoverMediaCache } from '@/utils/mediaCache';
import { SAVE_LINK_RPC, buildSaveLinkPayload, mapLinkRecord } from '@/utils/saveLink';

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

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const userId = data.session?.user?.id;
  if (!userId) {
    throw new Error('Usuário não autenticado');
  }
  return userId;
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
        set({ links: [], isLoading: false, error: null });
        return;
      }

      const { data: linksData, error: linksError } = await supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });

      if (linksError) throw linksError;

      const { data: linkCategoriesData, error: linkCategoriesError } = await supabase
        .from('link_categories')
        .select('link_id, category_id');

      if (linkCategoriesError) throw linkCategoriesError;

      const linksWithCategories: Link[] = (linksData || []).map((linkData) => {
        const categoryIds = (linkCategoriesData || [])
          .filter((lc) => lc.link_id === linkData.id)
          .map((lc) => lc.category_id);

        return mapLinkRecord(linkData, categoryIds);
      });

      const links = await importLeftoverMediaCache(linksWithCategories);
      set({ links, isLoading: false, error: null });
    } catch (error) {
      const appError = failWithUserMessage(error, 'Não foi possível carregar os itens.');
      set({ error: appError.userMessage, isLoading: false });
      throw appError;
    }
  },

  addLink: async (linkData: Partial<Link>) => {
    set({ isLoading: true, error: null });

    try {
      await requireUserId();
      const payload = buildSaveLinkPayload(linkData, { replaceCategories: true });
      const { data, error } = await supabase.rpc(SAVE_LINK_RPC, { p_payload: payload });
      if (error) throw error;
      if (!data) throw new Error('empty_save_result');

      const newLink = mapLinkRecord(data, linkData.categoryIds ?? []);

      set((state) => ({
        links: [newLink, ...state.links],
        isLoading: false,
        error: null,
      }));

      return newLink;
    } catch (error) {
      const appError = failWithUserMessage(error, 'Não foi possível salvar o item.');
      set({ error: appError.userMessage, isLoading: false });
      throw appError;
    }
  },

  updateLink: async (id: string, data: Partial<Link>) => {
    set({ isLoading: true, error: null });

    try {
      const previous = get().links.find((link) => link.id === id);
      const replaceCategories = data.categoryIds !== undefined;
      const payload = buildSaveLinkPayload(data, { id, replaceCategories });

      if (Object.keys(payload).length <= 1) {
        set({ isLoading: false });
        return;
      }

      const { data: row, error } = await supabase.rpc(SAVE_LINK_RPC, { p_payload: payload });
      if (error) throw error;
      if (!row) throw new Error('empty_save_result');

      const updated = mapLinkRecord(row, replaceCategories ? data.categoryIds : previous?.categoryIds);

      set((state) => ({
        links: state.links.map((link) => (link.id === id ? { ...link, ...updated } : link)),
        isLoading: false,
        error: null,
      }));

      if (data.url && previous?.url && data.url !== previous.url) {
        await deleteStoredImage(previous.url);
      }
    } catch (error) {
      const appError = failWithUserMessage(error, 'Não foi possível atualizar o item.');
      set({ error: appError.userMessage, isLoading: false });
      throw appError;
    }
  },

  deleteLink: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const previous = get().links.find((link) => link.id === id);

      const { error } = await supabase.from('links').delete().eq('id', id);
      if (error) throw error;

      set((state) => ({
        links: state.links.filter((link) => link.id !== id),
        isLoading: false,
        error: null,
      }));

      await deleteStoredImage(previous?.url);
      await deleteStoredImage(previous?.thumbnail);
    } catch (error) {
      const appError = failWithUserMessage(error, 'Não foi possível excluir o item.');
      set({ error: appError.userMessage, isLoading: false });
      throw appError;
    }
  },

  clearAllLinks: async () => {
    set({ isLoading: true, error: null });

    try {
      const userId = await requireUserId();
      const urls = get().links.flatMap((link) => [link.url, link.thumbnail]);

      const { error } = await supabase.from('links').delete().eq('user_id', userId);
      if (error) throw error;

      set({ links: [], isLoading: false, error: null });
      await deleteStoredImages(urls);
    } catch (error) {
      const appError = failWithUserMessage(error, 'Não foi possível limpar os itens.');
      set({ error: appError.userMessage, isLoading: false });
      throw appError;
    }
  },

  removeCategoryFromAssociatedLinks: async (categoryId: string) => {
    // Joins cascade when the category row is deleted. This only updates local state.
    set((state) => ({
      links: state.links.map((link) => ({
        ...link,
        categoryIds: link.categoryIds?.filter((id) => id !== categoryId) || [],
      })),
    }));
  },

  deleteLinksAssociatedWithCategory: async (categoryId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data: linkCategories, error: fetchError } = await supabase
        .from('link_categories')
        .select('link_id')
        .eq('category_id', categoryId);

      if (fetchError) throw fetchError;

      const linkIds = (linkCategories || []).map((lc) => lc.link_id);
      const urls = get()
        .links.filter((link) => link.id && linkIds.includes(link.id))
        .flatMap((link) => [link.url, link.thumbnail]);

      if (linkIds.length > 0) {
        const { error: deleteError } = await supabase.from('links').delete().in('id', linkIds);
        if (deleteError) throw deleteError;
      }

      set((state) => ({
        links: state.links.filter((link) => !link.categoryIds?.includes(categoryId)),
        isLoading: false,
        error: null,
      }));

      await deleteStoredImages(urls);
    } catch (error) {
      const appError = failWithUserMessage(error, 'Não foi possível excluir os itens da categoria.');
      set({ error: appError.userMessage, isLoading: false });
      throw appError;
    }
  },
}));
