import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useCategoryStore } from '@/store/categoryStore';
import { useLinkStore } from '@/store/linkStore';
import { useTheme } from '@/context/ThemeContext';
import CategoryCard from '@/components/ui/CategoryCard';
import EmptyState from '@/components/ui/EmptyState';
import { Plus } from 'lucide-react-native';
import AddCategoryModal from '@/components/modals/AddCategoryModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const { categories, fetchCategories } = useCategoryStore();
  const { links } = useLinkStore();
  const [modalVisible, setModalVisible] = useState(false);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const numColumns = width > 768 ? 3 : 2;
  const cardWidth = (width - (32 + ((numColumns - 1) * 16))) / numColumns;

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Count links per category
  const getCategoryLinkCount = (categoryId: string) => {
    return links.filter(link => link.categoryIds.includes(categoryId)).length;
  };

  const renderItem = ({ item }) => (
    <CategoryCard 
      category={item} 
      linkCount={getCategoryLinkCount(item.id)}
      width={cardWidth}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {categories.length > 0 ? (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 }
          ]}
          numColumns={numColumns}
          columnWrapperStyle={styles.columnWrapper}
        />
      ) : (
        <EmptyState
          title="No categories yet"
          description="Create categories to organize your saved links."
          icon="FolderPlus"
        />
      )}

      <TouchableOpacity 
        style={[
          styles.addButton,
          {
            backgroundColor: colors.primary,
            bottom: 12 + insets.bottom
          }
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      <AddCategoryModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
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
    justifyContent: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});