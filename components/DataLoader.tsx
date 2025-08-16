import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLinkStore } from '@/store/linkStore';
import { useCategoryStore } from '@/store/categoryStore';

export default function DataLoader({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const { fetchLinks } = useLinkStore();
  const { fetchCategories } = useCategoryStore();

  useEffect(() => {
    if (session?.user) {
      // Carregar dados quando usuário estiver autenticado
      const loadData = async () => {
        try {
          await Promise.all([
            fetchCategories(),
            fetchLinks(),
          ]);
        } catch (error) {
          console.error('Error loading data:', error);
        }
      };

      loadData();
    }
  }, [session?.user, fetchLinks, fetchCategories]);

  return <>{children}</>;
}
