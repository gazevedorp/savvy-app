import { create } from "zustand";
import { Link } from "@/types";
import { generateId } from "@/utils/idGenerator";
import { loadFromStorage, saveToStorage } from "@/utils/storage";

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
      const storedLinks = await loadFromStorage("links");
      set({ links: storedLinks || [], isLoading: false });
    } catch (error) {
      set({ error: "Failed to load links", isLoading: false });
      console.error("Error loading links:", error);
    }
  },

  addLink: async (linkData: Partial<Link>) => {
    const newLink: Link = {
      id: generateId(),
      url: linkData.url || "",
      title: linkData.title || "",
      description: linkData.description || "",
      thumbnail: linkData.thumbnail,
      type: linkData.type || "article",
      categoryIds: linkData.categoryIds || [],
      createdAt: linkData.createdAt || new Date().toISOString(),
      isRead: linkData.isRead || false,
      readAt: linkData.readAt,
      progress: linkData.progress,
    };

    set((state) => {
      const updatedLinks = [...state.links, newLink];
      saveToStorage("links", updatedLinks);
      return { links: updatedLinks };
    });

    return newLink;
  },

  updateLink: async (id: string, data: Partial<Link>) => {
    set((state) => {
      const updatedLinks = state.links.map((link) =>
        link.id === id ? { ...link, ...data } : link
      );
      saveToStorage("links", updatedLinks);
      return { links: updatedLinks };
    });
  },

  deleteLink: async (id: string) => {
    set((state) => {
      const updatedLinks = state.links.filter((link) => link.id !== id);
      saveToStorage("links", updatedLinks);
      return { links: updatedLinks };
    });
  },

  clearAllLinks: async () => {
    await saveToStorage("links", []);
    set({ links: [] });
  },

  removeCategoryFromAssociatedLinks: async (categoryId: string) => {
    // Your logic to update links (e.g., in AsyncStorage, API call)
    set((state) => {
      const updatedLinks = state.links.map((link) => ({
        ...link,
        categoryIds: link.categoryIds.filter((id) => id !== categoryId),
      }));
      saveToStorage("links", updatedLinks);
      return { links: updatedLinks };
    });
  },

  deleteLinksAssociatedWithCategory: async (categoryId: string) => {
    // Your logic to delete links
    set((state) => {
      const updatedLinks = state.links.filter(
        (link) => !link.categoryIds.includes(categoryId)
      );
      saveToStorage("links", updatedLinks);
      return { links: updatedLinks };
    });
  },
}));
