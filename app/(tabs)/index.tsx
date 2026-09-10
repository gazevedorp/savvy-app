import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useLinkStore } from '@/store/linkStore';
import LinkCard from '@/components/ui/LinkCard';
import EmptyState from '@/components/ui/EmptyState';
import { useTheme } from '@/context/ThemeContext';
import FilterBar from '@/components/ui/FilterBar';
import { Link } from '@/types';
import AddLinkButton from '@/components/ui/AddLinkButton';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Screen from '@/components/ui/Screen';
import SegmentedControl from '@/components/ui/SegmentedControl';
import Chip from '@/components/ui/Chip';
import HomeHeader from '@/components/ui/HomeHeader';
import {
  READ_STATUS_OPTIONS,
  TYPE_FILTER_OPTIONS,
  ReadStatusFilter,
  filterLinks,
  formatHomeCount,
  getHomeEmptyState,
} from '@/utils/home';

export default function AllLinksScreen() {
  const { colors, spacing } = useTheme();
  const { links, fetchLinks } = useLinkStore();
  const [refreshing, setRefreshing] = useState(false);
  const [typeSheetOpen, setTypeSheetOpen] = useState(false);
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [activeReadStatusFilter, setActiveReadStatusFilter] =
    useState<ReadStatusFilter>('unread');
  const params = useLocalSearchParams<{
    categoryId?: string;
    categoryName?: string;
  }>();
  const router = useRouter();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  useEffect(() => {
    if (params.categoryId && params.categoryName) {
      setActiveCategoryFilter({
        id: params.categoryId,
        name: params.categoryName,
      });
    }
  }, [params.categoryId, params.categoryName]);

  const filteredLinks = useMemo(
    () =>
      filterLinks(links, {
        type: activeTypeFilter,
        status: activeReadStatusFilter,
        categoryId: activeCategoryFilter?.id,
      }),
    [links, activeTypeFilter, activeReadStatusFilter, activeCategoryFilter]
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLinks();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Link }) => <LinkCard link={item} />;

  const clearCategoryFilter = () => {
    setActiveCategoryFilter(null);
    router.replace('/');
  };

  const clearFilters = () => {
    setActiveTypeFilter('all');
    setActiveReadStatusFilter('unread');
    if (activeCategoryFilter) {
      clearCategoryFilter();
    }
  };

  const empty = getHomeEmptyState({
    totalCount: links.length,
    status: activeReadStatusFilter,
    typeId: activeTypeFilter,
    categoryName: activeCategoryFilter?.name,
  });

  const countLabel = formatHomeCount(
    filteredLinks.length,
    activeReadStatusFilter,
    activeTypeFilter,
    activeCategoryFilter?.name
  );

  return (
    <Screen>
      <HomeHeader title="Salvos" subtitle={countLabel} />

      <View
        style={[
          styles.filters,
          {
            borderBottomColor: colors.border,
            paddingBottom: spacing.xs,
          },
        ]}
      >
        <FilterBar
          options={[...TYPE_FILTER_OPTIONS]}
          activeFilter={activeTypeFilter}
          onFilterChange={setActiveTypeFilter}
        />

        <SegmentedControl
          options={[...READ_STATUS_OPTIONS]}
          value={activeReadStatusFilter}
          onChange={(id) => setActiveReadStatusFilter(id as ReadStatusFilter)}
        />

        {activeCategoryFilter ? (
          <View style={[styles.categoryRow, { paddingHorizontal: spacing.md }]}>
            <Chip
              label={`Categoria: ${activeCategoryFilter.name}`}
              selected
              onClear={clearCategoryFilter}
            />
          </View>
        ) : null}
      </View>

      <FlatList
        data={filteredLinks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id ?? ''}
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: 112,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title={empty.title}
            description={empty.description}
            icon={empty.icon}
            actionLabel={
              empty.action === 'add'
                ? 'Adicionar item'
                : empty.action === 'clear'
                  ? 'Limpar filtros'
                  : undefined
            }
            onAction={
              empty.action === 'add'
                ? () => setTypeSheetOpen(true)
                : empty.action === 'clear'
                  ? clearFilters
                  : undefined
            }
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      />

      <AddLinkButton visible={typeSheetOpen} onVisibleChange={setTypeSheetOpen} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  categoryRow: {
    paddingBottom: 8,
  },
});
