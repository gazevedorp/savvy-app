import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { useCategoryStore } from "@/store/categoryStore";
import { useLinkStore } from "@/store/linkStore";
import CategoryCard from "@/components/ui/CategoryCard";
import EmptyState from "@/components/ui/EmptyState";
import AddCategoryModal from "@/components/modals/AddCategoryModal";
import Screen from "@/components/ui/Screen";
import FAB from "@/components/ui/FAB";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Category } from "@/types";
import DeleteCategoryOptionsModal from "@/components/modals/DeleteCategoryOptionsModal";
import CategoryActionsModal from "@/components/modals/CategoryActionsModal";
import { alertError } from "@/utils/errors";

export default function CategoriesScreen() {
  const {
    categories,
    fetchCategories,
    addCategory,
    editCategory,
    deleteCategory,
  } = useCategoryStore();
  const {
    links,
    removeCategoryFromAssociatedLinks,
    deleteLinksAssociatedWithCategory,
  } = useLinkStore();
  const [isAddEditModalVisible, setIsAddEditModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );
  const [isDeleteOptionsModalVisible, setIsDeleteOptionsModalVisible] =
    useState(false);

  // State for the new actions modal
  const [isActionsModalVisible, setIsActionsModalVisible] = useState(false);
  const [selectedCategoryForAction, setSelectedCategoryForAction] =
    useState<Category | null>(null);

  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const numColumns = width > 768 ? 3 : 2;
  const cardWidth = (width - (32 + (numColumns - 1) * 16)) / numColumns;

  useEffect(() => {
    fetchCategories().catch(() => {});
  }, [fetchCategories]);

  const getCategoryLinkCount = (categoryId: string) => {
    return links.filter((link) => link.categoryIds?.includes(categoryId)).length;
  };

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

  // Handlers for the new Actions Modal
  const handleLongPressCategory = (category: Category) => {
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
    handleCloseActionsModal(); // Close actions modal after initiating edit
  };

  const handleDeleteFromActionsModal = () => {
    if (selectedCategoryForAction) {
      handleOpenDeleteModal(selectedCategoryForAction);
    }
    handleCloseActionsModal(); // Close actions modal after initiating delete
  };

  const handleDeleteCategoryOnly = async () => {
    if (!deletingCategory || !deletingCategory.id) return;
    try {
      await deleteCategory(deletingCategory.id);
      await removeCategoryFromAssociatedLinks(deletingCategory.id);
      handleCloseDeleteModal();
    } catch (error) {
      alertError(error, "Não foi possível excluir a categoria.");
    }
  };

  const handleDeleteCategoryAndLinks = async () => {
    if (!deletingCategory || !deletingCategory.id) return;
    try {
      await deleteLinksAssociatedWithCategory(deletingCategory.id);
      await deleteCategory(deletingCategory.id);
      handleCloseDeleteModal();
    } catch (error) {
      alertError(error, "Não foi possível excluir a categoria e os itens.");
    }
  };

  const handleSaveCategory = async (data: {
    name: string;
    color?: string;
    icon?: string;
  }) => {
    try {
      if (editingCategory && editingCategory.id) {
        await editCategory(editingCategory.id, data.name, data.color);
      } else {
        await addCategory({
          name: data.name,
          color: data.color,
          icon: data.icon,
        });
      }
      handleCloseAddEditModal();
    } catch (error) {
      alertError(error, "Não foi possível salvar a categoria.");
    }
  };

  const renderItem = ({ item }: { item: Category }) => (
    <CategoryCard
      category={item}
      linkCount={getCategoryLinkCount(item.id || '')}
      width={cardWidth}
      onLongPress={handleLongPressCategory} // Use onLongPress to open actions modal
      // onEdit and onDelete are removed from here
    />
  );

  return (
    <Screen>
      {categories.length > 0 ? (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={(item) => item.id || `category-${Math.random()}`}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
          numColumns={numColumns}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          title="Nenhuma categoria ainda"
          description="Crie categorias para organizar seus itens salvos."
          icon="FolderPlus"
        />
      )}

      <FAB onPress={handleOpenAddModal} accessibilityLabel="Nova categoria" />

      {/* Modal for Adding or Editing a Category */}
      <AddCategoryModal
        visible={isAddEditModalVisible}
        onClose={handleCloseAddEditModal}
        categoryToEdit={editingCategory}
        onSave={handleSaveCategory} // Pass the combined save handler
      />

      {/* Modal for Delete Category Options */}
      {deletingCategory && (
        <DeleteCategoryOptionsModal
          visible={isDeleteOptionsModalVisible}
          categoryName={deletingCategory.name}
          onClose={handleCloseDeleteModal}
          onDeleteCategoryOnly={handleDeleteCategoryOnly}
          onDeleteCategoryAndLinks={handleDeleteCategoryAndLinks}
        />
      )}

      {/* New Actions Modal for Edit/Delete on Long Press */}
      {selectedCategoryForAction && (
        <CategoryActionsModal
          visible={isActionsModalVisible}
          onClose={handleCloseActionsModal}
          categoryName={selectedCategoryForAction.name}
          onEdit={handleEditFromActionsModal}
          onDelete={handleDeleteFromActionsModal}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: "flex-start",
    gap: 16,
    marginBottom: 16,
  },
});
