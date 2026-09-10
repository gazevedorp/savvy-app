import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Search as SearchIcon } from 'lucide-react-native';
import { MediaItem, MediaKind, searchMedia } from '@/utils/itunes';
import MediaSearchResultCard from '@/components/ui/MediaSearchResultCard';

interface MediaSearchPickerProps {
  kind: MediaKind;
  onSelect: (item: MediaItem) => void;
  selectedTitle?: string;
}

export default function MediaSearchPicker({
  kind,
  onSelect,
  selectedTitle,
}: MediaSearchPickerProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const items = await searchMedia(kind, trimmed);
        if (!cancelled) {
          setResults(items);
          setError(items.length === 0 ? 'Nenhum resultado encontrado na API.' : null);
        }
      } catch (err) {
        if (!cancelled) {
          setResults([]);
          setError('Não foi possível buscar agora. Tente de novo.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query, kind]);

  const placeholder =
    kind === 'movie' ? 'Buscar filme (ex: Cidade de Deus)' : 'Buscar música (ex: Elis Regina)';

  return (
    <View style={styles.container}>
      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SearchIcon size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {selectedTitle ? (
        <Text style={[styles.selected, { color: colors.success }]}>
          Selecionado: {selectedTitle}
        </Text>
      ) : (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Resultados reais da {kind === 'movie' ? 'Wikipédia / iTunes (filmes)' : 'iTunes / Deezer'}. Toque para preencher.
        </Text>
      )}

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : error && query.trim().length >= 2 ? (
        <Text style={[styles.error, { color: colors.textSecondary }]}>{error}</Text>
      ) : (
        results.map((item) => (
          <MediaSearchResultCard
            key={`${item.source}-${item.sourceId}-${item.title}`}
            item={item}
            onPress={onSelect}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  hint: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginBottom: 12,
  },
  selected: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginBottom: 12,
  },
  loader: {
    marginVertical: 16,
  },
  error: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    marginVertical: 12,
  },
});
