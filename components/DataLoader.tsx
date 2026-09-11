import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLinkStore } from '@/store/linkStore';
import { useCategoryStore } from '@/store/categoryStore';
import { alertError } from '@/utils/errors';

export default function DataLoader({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const { fetchLinks } = useLinkStore();
  const { fetchCategories } = useCategoryStore();

  useEffect(() => {
    if (session?.user) {
      const loadData = async () => {
        try {
          await Promise.all([
            fetchCategories(),
            fetchLinks(),
          ]);
        } catch (error) {
          alertError(error, 'Não foi possível carregar seus dados.');
        }
      };

      loadData();
    }
  }, [session?.user, fetchLinks, fetchCategories]);

  return <>{children}</>;
}
