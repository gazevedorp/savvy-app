import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput, Text } from 'react-native';
import { useLinkStore } from '@/store/linkStore';
import LinkCard from '@/components/ui/LinkCard';
import { useTheme } from '@/context/ThemeContext';
import { Search as SearchIcon, X } from 'lucide-react-native';
import EmptyState from '@/components/ui/EmptyState';
import { Link } from '@/types';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native';

export default function SearchScreen() {
  const { colors } = useTheme();
  const { links } = useLinkStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Link[]>([]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setResults([]);
      return;
    }

    const filteredByText = links.filter(
      link =>
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (link.description && link.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setResults(filteredByText);
  }, [searchQuery, links]);

  const renderItem = ({ item }: { item: Link }) => (
    <LinkCard link={item} />
  );

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SearchIcon size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search links..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {searchQuery.length > 0 && results.length === 0 ? (
        <EmptyState
          title="No results found"
          description={`No links matching "${searchQuery}"`}
          icon="Search"
        />
      ) : searchQuery.length === 0 ? (
        <EmptyState
          title="Search for links"
          description="Enter keywords to find your saved links"
          icon="Search"
        />
      ) : (
        <Animated.FlatList
          entering={FadeIn}
          exiting={FadeOut}
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: 36,
    marginLeft: 6,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
});