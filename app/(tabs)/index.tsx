import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text, TouchableOpacity } from 'react-native';
import { useLinkStore } from '@/store/linkStore';
import LinkCard from '@/components/ui/LinkCard';
import EmptyState from '@/components/ui/EmptyState';
import { useTheme } from '@/context/ThemeContext';
import FilterBar from '@/components/ui/FilterBar';
import { Link } from '@/types';
import AddLinkButton from '@/components/ui/AddLinkButton';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { XCircle } from 'lucide-react-native';

export default function AllLinksScreen() {
  const { colors } = useTheme();
  const { links, fetchLinks } = useLinkStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [activeTypeFilter, setActiveTypeFilter] = useState('all'); // Default type filter
  const [activeReadStatusFilter, setActiveReadStatusFilter] = useState<'all' | 'read' | 'unread'>('unread'); // Default to 'To Do'
  const params = useLocalSearchParams<{ categoryId?: string; categoryName?: string }>();
  const router = useRouter();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  useEffect(() => {
    if (params.categoryId && params.categoryName) {
      setActiveCategoryFilter({ id: params.categoryId, name: params.categoryName });
      // Optionally, reset other filters when a category is directly selected
      // setActiveTypeFilter('all');
      // setActiveReadStatusFilter('all');
    } else if (!params.categoryId) {
      // If categoryId is removed from params (e.g. by navigating away and back), clear the filter
      // This depends on how you want to persist the filter.
      // For now, let's assume the filter is cleared if params are not present.
      // setActiveCategoryFilter(null); // Or handle this through a clear button only
    }
  }, [params.categoryId, params.categoryName]);

  useEffect(() => {
    let tempLinks = links;

    // Filter by category if active
    if (activeCategoryFilter) {
      tempLinks = tempLinks.filter(link => link.categoryIds.includes(activeCategoryFilter.id));
    }

    // Filter by type
    if (activeTypeFilter !== 'all') {
      tempLinks = tempLinks.filter(link => link.type === activeTypeFilter);
    }
    // Filter by read status
    if (activeReadStatusFilter === 'read') {
      tempLinks = tempLinks.filter(link => link.isRead);
    } else if (activeReadStatusFilter === 'unread') {
      tempLinks = tempLinks.filter(link => !link.isRead);
    }
    setFilteredLinks(tempLinks);
  }, [links, activeTypeFilter, activeReadStatusFilter, activeCategoryFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLinks();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Link }) => (
    <LinkCard link={item} />
  );

  const typeFilterOptions = [
    { id: 'all', label: 'All' },
    { id: 'link', label: 'Links' },
    { id: 'video', label: 'Videos' },
    { id: 'image', label: 'Images' },
    { id: 'music', label: 'Musics' },
    { id: 'text', label: 'Texts' },
  ];

  const readStatusFilterOptions = [
    { id: 'unread', label: 'To Do' },
    { id: 'read', label: 'Done' },
    { id: 'all', label: 'All' },
  ];

  const clearCategoryFilter = () => {
    setActiveCategoryFilter(null);
    // Navigate to the same screen without params to clear them from the URL
    // This helps if the user navigates away and back, the filter won't re-apply from old params.
    router.replace('/'); 
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FilterBar 
        options={typeFilterOptions} 
        activeFilter={activeTypeFilter}
        onFilterChange={setActiveTypeFilter}
      />

      {activeCategoryFilter && (
        <View style={[styles.activeCategoryFilterContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.activeCategoryFilterText, { color: colors.text }]}>
            Category: {activeCategoryFilter.name}
          </Text>
          <TouchableOpacity onPress={clearCategoryFilter}>
            <XCircle size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.segmentedControlContainer, { borderColor: colors.primary }]}>
        {readStatusFilterOptions.map((option, index) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.segmentButton,
              { 
                backgroundColor: activeReadStatusFilter === option.id ? colors.primary : 'transparent',
              },
              activeReadStatusFilter === option.id && { 
                // No specific style for active other than background
              },
              index < readStatusFilterOptions.length - 1 && { borderRightWidth: 1, borderRightColor: colors.primary }
            ]}
            onPress={() => setActiveReadStatusFilter(option.id as 'all' | 'read' | 'unread')}
          >
            <Text
              style={[
                styles.segmentButtonText,
                { 
                  color: activeReadStatusFilter === option.id ? (colors.theme === 'dark' ? colors.background : '#FFFFFF') : colors.primary 
                }
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredLinks.length > 0 ? (
        <FlatList
          data={filteredLinks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      ) : (
        <EmptyState
          title={
            activeCategoryFilter || activeTypeFilter !== 'all' || activeReadStatusFilter !== 'all' 
              ? "No Savvys match your filters" 
              : "No saved Savvys yet"
          }
          description={
            activeCategoryFilter || activeTypeFilter !== 'all' || activeReadStatusFilter !== 'all' 
              ? "Try adjusting your type or status filters." 
              : "Save links, images, texts and more to see them here."}
          icon="BookmarkPlus"
        />
      )}
      
      <AddLinkButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  segmentedControlContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden', // Ensures children adhere to border radius
  },
  segmentButton: {
    flex: 1, // Each button takes equal width
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  segmentButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  activeCategoryFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  activeCategoryFilterText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
});