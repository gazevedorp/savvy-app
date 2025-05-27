import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text } from 'react-native';
import { useLinkStore } from '@/store/linkStore';
import LinkCard from '@/components/ui/LinkCard';
import EmptyState from '@/components/ui/EmptyState';
import { useTheme } from '@/context/ThemeContext';
import FilterBar from '@/components/ui/FilterBar';
import { Link } from '@/types';
import AddLinkButton from '@/components/ui/AddLinkButton';

export default function AllLinksScreen() {
  const { colors } = useTheme();
  const { links, fetchLinks } = useLinkStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredLinks(links);
    } else {
      setFilteredLinks(links.filter(link => link.type === activeFilter));
    }
  }, [links, activeFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLinks();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Link }) => (
    <LinkCard link={item} />
  );

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'article', label: 'Articles' },
    { id: 'video', label: 'Videos' },
    { id: 'podcast', label: 'Podcasts' },
    { id: 'other', label: 'Other' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FilterBar 
        options={filterOptions} 
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

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
          title="No saved links yet"
          description="Save links from other apps by using the share button, or add them manually."
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
});