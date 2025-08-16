import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useCategoryStore } from "@/store/categoryStore";
import { useLinkStore } from "@/store/linkStore";
import { useTheme } from "@/context/ThemeContext";
import CategoryCard from "@/components/ui/CategoryCard";
import EmptyState from "@/components/ui/EmptyState";
import { Plus } from "lucide-react-native";
import AddCategoryModal from "@/components/modals/AddCategoryModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Category } from "@/types";
import DeleteCategoryOptionsModal from "@/components/modals/DeleteCategoryOptionsModal";
import CategoryActionsModal from "@/components/modals/CategoryActionsModal"; // Import the new modal

export default function CategoriesScreen() {
  const { colors } = useTheme();
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
    fetchCategories();
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
      await removeCategoryFromAssociatedLinks(deletingCategory.id);
      await deleteCategory(deletingCategory.id);
      // fetchCategories(); // Store updates should trigger re-render, but explicit fetch can be a fallback
    } catch (error) {
      console.error("Error deleting category only:", error);
    }
    handleCloseDeleteModal();
  };

  const handleDeleteCategoryAndLinks = async () => {
    if (!deletingCategory || !deletingCategory.id) return;
    try {
      await deleteLinksAssociatedWithCategory(deletingCategory.id);
      await deleteCategory(deletingCategory.id);
      // fetchCategories(); // Store updates should trigger re-render
    } catch (error) {
      console.error("Error deleting category and links:", error);
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
        await editCategory(editingCategory.id, data.name, data.color);
      } else {
        await addCategory({
          name: data.name,
          color: data.color,
          icon: data.icon,
        });
      }
      // fetchCategories(); // Store updates should trigger re-render
    } catch (error) {
      console.error("Failed to save category:", error);
      // Optionally, show an error message to the user
    }
    handleCloseAddEditModal();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {categories.length > 0 ? (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={(item) => item.id || `category-${Math.random()}`}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 }, // Ensure space for FAB and tab bar
          ]}
          numColumns={numColumns}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          title="No categories yet"
          description="Create categories to organize your saved links."
          icon="FolderPlus" // Make sure this icon exists in your EmptyState component
        />
      )}

      <TouchableOpacity
        style={[
          styles.addButton,
          {
            backgroundColor: colors.primary,
          },
        ]}
        onPress={handleOpenAddModal} // Corrected: Use the handler to open add/edit modal
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: "flex-start", // Or 'space-between' if you want space distributed
    gap: 16, // Spacing between cards in a row
    marginBottom: 16, // Spacing between rows
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
