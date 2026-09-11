import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Search as SearchIcon } from 'lucide-react-native';
import { MediaItem, MediaKind, searchMedia } from '@/utils/itunes';
import MediaSearchResultCard from '@/components/ui/MediaSearchResultCard';
import InputField from '@/components/ui/InputField';

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
  const { colors, spacing, typography } = useTheme();
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
      } catch {
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
      <InputField
        label={kind === 'movie' ? 'Buscar filme' : 'Buscar música'}
        placeholder={placeholder}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
        leftIcon={<SearchIcon size={18} color={colors.textSecondary} />}
      />

      {selectedTitle ? (
        <Text style={[typography.caption, { color: colors.success, marginBottom: spacing.sm }]}>
          Selecionado: {selectedTitle}
        </Text>
      ) : (
        <Text
          style={[
            typography.caption,
            { color: colors.textSecondary, fontFamily: 'Inter-Regular', marginBottom: spacing.sm },
          ]}
        >
          Resultados reais da {kind === 'movie' ? 'Wikipédia / iTunes (filmes)' : 'iTunes / Deezer'}.
          Toque para preencher.
        </Text>
      )}

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : error && query.trim().length >= 2 ? (
        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
          {error}
        </Text>
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
    marginBottom: 8,
  },
  loader: {
    marginVertical: 16,
  },
});
