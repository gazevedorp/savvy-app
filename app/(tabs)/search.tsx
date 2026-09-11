import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useLinkStore } from '@/store/linkStore';
import LinkCard from '@/components/ui/LinkCard';
import { useTheme } from '@/context/ThemeContext';
import { Search as SearchIcon, X } from 'lucide-react-native';
import EmptyState from '@/components/ui/EmptyState';
import { Link } from '@/types';
import { TouchableOpacity } from 'react-native';
import { MediaItem, MediaKind, mediaItemToLink, searchMedia } from '@/utils/itunes';
import MediaSearchResultCard from '@/components/ui/MediaSearchResultCard';
import { useRouter } from 'expo-router';
import FilterBar from '@/components/ui/FilterBar';
import Screen from '@/components/ui/Screen';
import HomeHeader from '@/components/ui/HomeHeader';
import {
  SEARCH_SCOPE_OPTIONS,
  SearchScope,
  filterSavedLinks,
  getSearchEmptyCopy,
  getSearchHeaderSubtitle,
  getSearchPlaceholder,
  isSearchScope,
} from '@/utils/search';
import { alertError } from '@/utils/errors';

export default function SearchScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const { links, addLink } = useLinkStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>('saved');
  const [mediaResults, setMediaResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const savedResults = useMemo(
    () => (scope === 'saved' ? filterSavedLinks(links, searchQuery) : []),
    [links, searchQuery, scope]
  );

  useEffect(() => {
    if (scope === 'saved') {
      setMediaResults([]);
      setMediaError(null);
      setLoading(false);
      return;
    }

    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setMediaResults([]);
      setMediaError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const items = await searchMedia(scope as MediaKind, trimmed);
        if (!cancelled) {
          setMediaResults(items);
          setMediaError(
            items.length === 0 ? 'Nenhum resultado real encontrado para essa busca.' : null
          );
        }
      } catch {
        if (!cancelled) {
          setMediaResults([]);
          setMediaError('Não foi possível consultar a API agora. Tente novamente.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchQuery, scope]);

  const handleSaveMedia = useCallback(
    async (item: MediaItem) => {
      const existing = links.find((link) => link.url === item.externalUrl);
      if (existing?.id) {
        router.push(`/link/${existing.id}`);
        return;
      }

      setSavingId(`${item.source}-${item.sourceId}`);
      try {
        const saved = await addLink(mediaItemToLink(item));
        if (saved.id) {
          router.push(`/link/${saved.id}`);
        }
      } catch (error) {
        alertError(error, 'Não foi possível salvar. Faça login e tente de novo.');
      } finally {
        setSavingId(null);
      }
    },
    [addLink, links, router]
  );

  const emptyCopy = getSearchEmptyCopy({
    scope,
    query: searchQuery,
    error: scope === 'saved' ? null : mediaError,
  });

  const headerSubtitle =
    scope === 'saved' && searchQuery.trim()
      ? getSearchHeaderSubtitle('saved', savedResults.length)
      : getSearchHeaderSubtitle(scope);

  const listPadding = { padding: spacing.md, paddingBottom: 100 };

  const renderSaved = ({ item }: { item: Link }) => <LinkCard link={item} />;

  const showSavedEmpty = scope === 'saved' && savedResults.length === 0;
  const showMediaIdle =
    scope !== 'saved' &&
    !loading &&
    (mediaError || searchQuery.trim().length < 2 || mediaResults.length === 0);

  return (
    <Screen>
      <HomeHeader title="Buscar" subtitle={headerSubtitle} />

      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radius.md,
            marginHorizontal: spacing.md,
            marginTop: spacing.xs,
            marginBottom: spacing.xs,
            paddingHorizontal: spacing.sm,
          },
        ]}
      >
        <SearchIcon size={18} color={colors.textSecondary} />
        <TextInput
          style={[
            styles.searchInput,
            typography.label,
            { color: colors.text, fontFamily: 'Inter-Regular' },
          ]}
          placeholder={getSearchPlaceholder(scope)}
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Campo de busca"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} accessibilityLabel="Limpar busca">
            <X size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <FilterBar
        options={[...SEARCH_SCOPE_OPTIONS]}
        activeFilter={scope}
        onFilterChange={(id) => {
          if (isSearchScope(id)) setScope(id);
        }}
      />

      {scope === 'saved' ? (
        showSavedEmpty ? (
          <EmptyState title={emptyCopy.title} description={emptyCopy.description} icon="Search" />
        ) : (
          <FlatList
            data={savedResults}
            renderItem={renderSaved}
            keyExtractor={(item) => item.id || item.url}
            contentContainerStyle={listPadding}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )
      ) : loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[typography.caption, { marginTop: spacing.sm, color: colors.textSecondary }]}>
            Consultando catálogo público...
          </Text>
        </View>
      ) : showMediaIdle ? (
        <EmptyState title={emptyCopy.title} description={emptyCopy.description} icon="Search" />
      ) : (
        <FlatList
          data={mediaResults}
          renderItem={({ item }) => (
            <MediaSearchResultCard
              item={item}
              onPress={handleSaveMedia}
              saving={savingId === `${item.source}-${item.sourceId}`}
            />
          )}
          keyExtractor={(item) => `${item.source}-${item.sourceId}-${item.title}`}
          contentContainerStyle={listPadding}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
  },
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
