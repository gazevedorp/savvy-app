import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
} from "react-native";
import { useLinkStore } from "@/store/linkStore";
import LinkCard from "@/components/ui/LinkCard";
import EmptyState from "@/components/ui/EmptyState";
import { useTheme } from "@/context/ThemeContext";
import FilterBar from "@/components/ui/FilterBar";
import { Link } from "@/types";
import AddLinkButton from "@/components/ui/AddLinkButton";
import { useLocalSearchParams, useRouter } from "expo-router";
import { XCircle } from "lucide-react-native";
import Screen from "@/components/ui/Screen";
import SegmentedControl from "@/components/ui/SegmentedControl";

export default function AllLinksScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const { links, fetchLinks } = useLinkStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [activeTypeFilter, setActiveTypeFilter] = useState("all");
  const [activeReadStatusFilter, setActiveReadStatusFilter] = useState<
    "all" | "read" | "unread"
  >("unread");
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

  useEffect(() => {
    let tempLinks = links;

    if (activeCategoryFilter) {
      tempLinks = tempLinks.filter((link) =>
        link.categoryIds?.includes(activeCategoryFilter.id!)
      );
    }

    if (activeTypeFilter !== "all") {
      tempLinks = tempLinks.filter((link) => link.type === activeTypeFilter);
    }
    if (activeReadStatusFilter === "read") {
      tempLinks = tempLinks.filter((link) => link.is_read);
    } else if (activeReadStatusFilter === "unread") {
      tempLinks = tempLinks.filter((link) => !link.is_read);
    }
    setFilteredLinks(tempLinks);
  }, [links, activeTypeFilter, activeReadStatusFilter, activeCategoryFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLinks();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: Link }) => <LinkCard link={item} />;

  const typeFilterOptions = [
    { id: "all", label: "Todos" },
    { id: "link", label: "Links" },
    { id: "video", label: "Vídeos" },
    { id: "music", label: "Música" },
    { id: "movie", label: "Filmes" },
    { id: "other", label: "Notas" },
  ];

  const readStatusFilterOptions = [
    { id: "unread", label: "A fazer" },
    { id: "read", label: "Feitos" },
    { id: "all", label: "Todos" },
  ];

  const clearCategoryFilter = () => {
    setActiveCategoryFilter(null);
    router.replace("/");
  };

  const hasActiveFilters =
    !!activeCategoryFilter ||
    activeTypeFilter !== "all" ||
    activeReadStatusFilter !== "all";

  return (
    <Screen>
      <FilterBar
        options={typeFilterOptions}
        activeFilter={activeTypeFilter}
        onFilterChange={setActiveTypeFilter}
      />

      {activeCategoryFilter && (
        <View
          style={[
            styles.activeCategoryFilterContainer,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: radius.sm,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              marginHorizontal: spacing.md,
              marginTop: spacing.sm,
            },
          ]}
        >
          <Text
            style={[
              typography.caption,
              { color: colors.text, flex: 1, marginRight: spacing.xs },
            ]}
          >
            Categoria: {activeCategoryFilter.name}
          </Text>
          <TouchableOpacity onPress={clearCategoryFilter} accessibilityLabel="Limpar filtro de categoria">
            <XCircle size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <SegmentedControl
        options={readStatusFilterOptions}
        value={activeReadStatusFilter}
        onChange={(id) =>
          setActiveReadStatusFilter(id as "all" | "read" | "unread")
        }
      />

      {filteredLinks.length > 0 ? (
        <FlatList
          data={filteredLinks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id ?? ""}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
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
            hasActiveFilters
              ? "Nenhum Savvy corresponde aos filtros"
              : "Nenhum Savvy salvo ainda"
          }
          description={
            hasActiveFilters
              ? "Tente ajustar os filtros de tipo ou status."
              : "Salve links, imagens, textos e mais para vê-los aqui."
          }
          icon="BookmarkPlus"
        />
      )}

      <AddLinkButton />
    </Screen>
  );
}

const styles = StyleSheet.create({
  activeCategoryFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
  },
});
