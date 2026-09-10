import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
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

type SearchScope = 'saved' | 'music' | 'movie';

export default function SearchScreen() {
  const { colors } = useTheme();
  const { links, addLink } = useLinkStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [scope, setScope] = useState<SearchScope>('saved');
  const [savedResults, setSavedResults] = useState<Link[]>([]);
  const [mediaResults, setMediaResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  useEffect(() => {
    if (scope !== 'saved') return;

    if (searchQuery.trim() === '') {
      setSavedResults([]);
      return;
    }

    const q = searchQuery.toLowerCase();
    const filteredByText = links.filter(
      (link) =>
        link.title.toLowerCase().includes(q) ||
        link.url.toLowerCase().includes(q) ||
        (link.description && link.description.toLowerCase().includes(q)) ||
        (link.metadata?.artistName && link.metadata.artistName.toLowerCase().includes(q))
    );

    setSavedResults(filteredByText);
  }, [searchQuery, links, scope]);

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
          setMediaError(items.length === 0 ? 'Nenhum resultado real encontrado para essa busca.' : null);
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
      } catch {
        Alert.alert('Erro', 'Não foi possível salvar. Faça login e tente de novo.');
      } finally {
        setSavingId(null);
      }
    },
    [addLink, links, router]
  );

  const clearSearch = () => {
    setSearchQuery('');
  };

  const placeholder =
    scope === 'music'
      ? 'Buscar faixas e álbuns reais...'
      : scope === 'movie'
        ? 'Buscar filmes reais...'
        : 'Buscar links salvos...';

  const renderSaved = ({ item }: { item: Link }) => <LinkCard link={item} />;

  const emptySaved =
    searchQuery.length > 0 ? (
      <EmptyState
        title="Nenhum resultado"
        description={`Nenhum link salvo corresponde a "${searchQuery}"`}
        icon="Search"
      />
    ) : (
      <EmptyState
        title="Buscar nos seus Savvys"
        description="Digite para filtrar links salvos, ou troque para Música / Filmes para consultar a API."
        icon="Search"
      />
    );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SearchIcon size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={placeholder}
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

      <FilterBar
        options={[
          { id: 'saved', label: 'Salvos' },
          { id: 'music', label: 'Música' },
          { id: 'movie', label: 'Filmes' },
        ]}
        activeFilter={scope}
        onFilterChange={(id) => setScope(id as SearchScope)}
      />

      {scope === 'saved' ? (
        searchQuery.length === 0 || savedResults.length === 0 ? (
          emptySaved
        ) : (
          <FlatList
            data={savedResults}
            renderItem={renderSaved}
            keyExtractor={(item) => item.id || item.url}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )
      ) : loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Consultando catálogo público...
          </Text>
        </View>
      ) : mediaError ? (
        <EmptyState title="Sem resultados" description={mediaError} icon="Search" />
      ) : searchQuery.trim().length < 2 ? (
        <EmptyState
          title={scope === 'music' ? 'Buscar música' : 'Buscar filmes'}
          description={
            scope === 'music'
              ? 'Digite o nome da faixa, artista ou álbum. Os resultados vêm da iTunes Search API (com fallback Deezer).'
              : 'Digite o nome do filme. Os resultados vêm da Wikipédia (e da iTunes, quando houver). Com EXPO_PUBLIC_TMDB_API_KEY a busca usa o TMDB.'
          }
          icon="Search"
        />
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
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
    marginBottom: 8,
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
  loadingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 13,
  },
});
