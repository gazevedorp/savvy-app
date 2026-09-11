import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, FlatList, useWindowDimensions } from 'react-native';
import { useCategoryStore } from '@/store/categoryStore';
import { useLinkStore } from '@/store/linkStore';
import CategoryCard from '@/components/ui/CategoryCard';
import EmptyState from '@/components/ui/EmptyState';
import AddCategoryModal from '@/components/modals/AddCategoryModal';
import Screen from '@/components/ui/Screen';
import FAB from '@/components/ui/FAB';
import HomeHeader from '@/components/ui/HomeHeader';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Category } from '@/types';
import DeleteCategoryOptionsModal from '@/components/modals/DeleteCategoryOptionsModal';
import CategoryActionsModal from '@/components/modals/CategoryActionsModal';
import { countLinksInCategory, formatCategoryCount } from '@/utils/categories';
import { alertError } from '@/utils/errors';
import { useTheme } from '@/context/ThemeContext';

export default function CategoriesScreen() {
  const {
    categories,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useCategoryStore();
  const {
    links,
    removeCategoryFromAssociatedLinks,
    deleteLinksAssociatedWithCategory,
  } = useLinkStore();
  const { spacing } = useTheme();
  const [isAddEditModalVisible, setIsAddEditModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleteOptionsModalVisible, setIsDeleteOptionsModalVisible] = useState(false);
  const [isActionsModalVisible, setIsActionsModalVisible] = useState(false);
  const [selectedCategoryForAction, setSelectedCategoryForAction] = useState<Category | null>(
    null
  );

  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const numColumns = width > 768 ? 3 : 2;
  const gutter = spacing.md;
  const gap = spacing.sm;
  const cardWidth = (width - (gutter * 2 + (numColumns - 1) * gap)) / numColumns;

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setIsAddEditModalVisible(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsAddEditModalVisible(true);
  };

  const handleCloseAddEditModal = () => {
    setIsAddEditModalVisible(false);
    setEditingCategory(null);
  };

  const handleOpenDeleteModal = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteOptionsModalVisible(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteOptionsModalVisible(false);
    setDeletingCategory(null);
  };

  const handleOpenActions = (category: Category) => {
    setSelectedCategoryForAction(category);
    setIsActionsModalVisible(true);
  };

  const handleCloseActionsModal = () => {
    setIsActionsModalVisible(false);
    setSelectedCategoryForAction(null);
  };

  const handleEditFromActionsModal = () => {
    if (selectedCategoryForAction) {
      handleOpenEditModal(selectedCategoryForAction);
    }
    handleCloseActionsModal();
  };

  const handleDeleteFromActionsModal = () => {
    if (selectedCategoryForAction) {
      handleOpenDeleteModal(selectedCategoryForAction);
    }
    handleCloseActionsModal();
  };

  const handleDeleteCategoryOnly = async () => {
    if (!deletingCategory || !deletingCategory.id) return;
    try {
      await removeCategoryFromAssociatedLinks(deletingCategory.id);
      await deleteCategory(deletingCategory.id);
    } catch (error) {
      alertError(error, 'Não foi possível excluir a categoria.');
    }
    handleCloseDeleteModal();
  };

  const handleDeleteCategoryAndLinks = async () => {
    if (!deletingCategory || !deletingCategory.id) return;
    try {
      await deleteLinksAssociatedWithCategory(deletingCategory.id);
      await deleteCategory(deletingCategory.id);
    } catch (error) {
      alertError(error, 'Não foi possível excluir a categoria e os itens.');
    }
    handleCloseDeleteModal();
  };

  const handleSaveCategory = async (data: {
    name: string;
    color?: string;
    icon?: string;
  }) => {
    try {
      if (editingCategory && editingCategory.id) {
        await updateCategory(editingCategory.id, {
          name: data.name,
          color: data.color,
          icon: data.icon,
        });
      } else {
        await addCategory({
          name: data.name,
          color: data.color,
          icon: data.icon,
        });
      }
    } catch (error) {
      alertError(error, 'Não foi possível salvar a categoria.');
    }
    handleCloseAddEditModal();
  };

  const subtitle = useMemo(() => {
    if (categories.length === 0) return 'Organize seus itens';
    return `${categories.length} ${categories.length === 1 ? 'categoria' : 'categorias'} · ${formatCategoryCount(links.length)}`;
  }, [categories.length, links.length]);

  return (
    <Screen>
      <HomeHeader title="Categorias" subtitle={subtitle} />

      {categories.length > 0 ? (
        <FlatList
          key={numColumns}
          data={categories}
          renderItem={({ item }) => (
            <CategoryCard
              category={item}
              linkCount={countLinksInCategory(links, item.id || '')}
              width={cardWidth}
              onOpenActions={handleOpenActions}
            />
          )}
          keyExtractor={(item, index) => item.id || `category-${index}`}
          contentContainerStyle={[
            styles.listContent,
            {
              padding: gutter,
              paddingBottom: insets.bottom + 100,
            },
          ]}
          numColumns={numColumns}
          columnWrapperStyle={{ gap, marginBottom: gap }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          title="Nenhuma categoria ainda"
          description="Crie categorias para organizar seus itens salvos."
          icon="FolderPlus"
          actionLabel="Nova categoria"
          onAction={handleOpenAddModal}
        />
      )}

      <FAB onPress={handleOpenAddModal} accessibilityLabel="Nova categoria" />

      <AddCategoryModal
        visible={isAddEditModalVisible}
        onClose={handleCloseAddEditModal}
        categoryToEdit={editingCategory}
        onSave={handleSaveCategory}
      />

      {deletingCategory ? (
        <DeleteCategoryOptionsModal
          visible={isDeleteOptionsModalVisible}
          categoryName={deletingCategory.name}
          onClose={handleCloseDeleteModal}
          onDeleteCategoryOnly={handleDeleteCategoryOnly}
          onDeleteCategoryAndLinks={handleDeleteCategoryAndLinks}
        />
      ) : null}

      {selectedCategoryForAction ? (
        <CategoryActionsModal
          visible={isActionsModalVisible}
          onClose={handleCloseActionsModal}
          categoryName={selectedCategoryForAction.name}
          onEdit={handleEditFromActionsModal}
          onDelete={handleDeleteFromActionsModal}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
  },
});
