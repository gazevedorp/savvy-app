import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Linking, Share, Image, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLinkStore } from '@/store/linkStore';
import { useTheme } from '@/context/ThemeContext';
import { ExternalLink, Share2, Edit, Trash2, Check, Clock } from 'lucide-react-native';
import Screen from '@/components/ui/Screen';
import AppHeader from '@/components/ui/AppHeader';
import Card from '@/components/ui/Card';
import Chip from '@/components/ui/Chip';
import { useCategoryStore } from '@/store/categoryStore';
import { formatRelativeTime } from '@/utils/dateUtils';
import WebView from '@/components/WebView';
import { Link } from '@/types';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import MediaDetailView from '@/components/ui/MediaDetailView';
import { getTypeLabel, isMediaType } from '@/utils/media';
import { alertError } from '@/utils/errors';

export default function LinkDetailScreen() {
  const { id } = useLocalSearchParams();
  const { links, updateLink, deleteLink } = useLinkStore();
  const { categories } = useCategoryStore();
  const { colors, spacing, typography } = useTheme();
  const router = useRouter();
  const [link, setLink] = useState<Link | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const foundLink = links.find(item => item.id === id);
      if (foundLink) {
        setLink(foundLink);
      }
    }
  }, [id, links]);

  const handleBack = () => {
    router.back();
  };

  const handleOpenLink = async () => {
    if (link?.url) {
      await Linking.openURL(link.url);
    }
  };

  const handleShareLink = async () => {
    if (!link) return;
    const message = `${link.title} - ${link.url}`;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && 'share' in navigator) {
        await navigator.share({ title: link.title, text: message, url: link.url });
        return;
      }
      await Share.share({
        message,
        url: link.url,
      });
    } catch (error) {
      const cancelled = error instanceof Error && /cancel/i.test(error.message);
      if (cancelled) return;
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        Alert.alert('Link copiado', 'O compartilhamento nativo não está disponível neste navegador.');
        return;
      }
      Alert.alert('Erro', 'Não foi possível compartilhar este item.');
    }
  };

  const handleToggleRead = async () => {
    if (link && link.id) {
      try {
        await updateLink(link.id, { is_read: !link.is_read });
      } catch (error) {
        alertError(error, 'Não foi possível atualizar o item.');
      }
    }
  };

  const handleDeleteLink = async () => {
    if (link && link.id) {
      try {
        await deleteLink(link.id);
        setDeleteModalVisible(false);
        router.back();
      } catch (error) {
        alertError(error, 'Não foi possível excluir o item.');
      }
    }
  };

  const getCategoryNames = () => {
    if (!link?.categoryIds || !link.categoryIds.length) return 'Nenhuma categoria';
    
    return link.categoryIds
      .map(catId => categories.find(cat => cat.id === catId)?.name)
      .filter(Boolean)
      .join(', ');
  };

  if (!link) {
    return (
      <Screen>
        <Text style={[styles.errorText, typography.heading, { color: colors.text }]}>
          Item não encontrado
        </Text>
      </Screen>
    );
  }

  const isLocalImage = link.type === 'image';
  const isMedia = isMediaType(link.type);

  return (
    <Screen>
      <AppHeader
        title={isMedia ? getTypeLabel(link.type) : link.title}
        onBack={handleBack}
      />
      
      <ScrollView style={styles.content}>
        {isMedia ? (
          <MediaDetailView link={link} categoryNames={getCategoryNames()} />
        ) : (
          <>
        <Card style={{ marginBottom: spacing.md }}>
          <Text style={[styles.title, typography.title, { color: colors.text }]}>{link.title}</Text>
          
          {!isLocalImage && link.url && (
            <Text 
              style={[styles.url, { color: colors.primary }]} 
              numberOfLines={1}
              onPress={handleOpenLink}
            >
              {link.url}
            </Text>
          )}
          
          {link.description && (
            <Text style={[styles.description, { color: colors.text }]}>
              {link.description}
            </Text>
          )}
          
          <View style={styles.metaRow}>
            <Chip label={getTypeLabel(link.type)} variant="tag" />
            
            <Text style={[styles.dateText, typography.caption, { color: colors.textSecondary }]}>
              Salvo {formatRelativeTime(link.created_at)}
            </Text>
          </View>
          
          <View style={styles.categoryRow}>
            <Text style={[styles.categoryLabel, typography.caption, { color: colors.textSecondary }]}>
              Categorias:
            </Text>
            <Text style={[styles.categoryText, typography.caption, { color: colors.text, fontFamily: 'Inter-Regular' }]}>
              {getCategoryNames()}
            </Text>
          </View>
        </Card>
        
        {isLocalImage ? (
          <View style={[styles.imagePreviewContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={{ uri: link.url }} style={styles.localImagePreview} resizeMode="contain" />
          </View>
        ) : link.url ? ( // Only show WebView if there's a URL and it's not a local image
          <View style={[styles.previewContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.previewTitle, typography.overline, { color: colors.textSecondary, borderBottomColor: colors.border }]}>
              Prévia
            </Text>
            <WebView // Este é o seu componente customizado de @/components/WebView
              url={link.url}
              style={styles.webView}
            />
          </View>
        ) : (
          // Optionally, show something if there's no URL and it's not an image (e.g., for 'text' type)
          <View style={styles.noPreviewContainer} />
        )}
          </>
        )}
      </ScrollView>
      
      <View style={[styles.actionBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleToggleRead}
        >
          {link.is_read ? (
            <Check size={24} color={colors.success} />
          ) : (
            <Clock size={24} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
        
        {!isLocalImage && link.url && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleOpenLink}
          >
            <ExternalLink size={24} color={colors.primary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShareLink}
        >
          <Share2 size={24} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/link/edit?id=${link.id}`)}
        >
          <Edit size={24} color={colors.text} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setDeleteModalVisible(true)}
        >
          <Trash2 size={24} color={colors.error} />
        </TouchableOpacity>
      </View>
      
      <ConfirmationModal
        visible={deleteModalVisible}
        title="Excluir item"
        message="Tem certeza de que deseja excluir este item? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDeleteLink}
        onCancel={() => setDeleteModalVisible(false)}
        confirmButtonColor={colors.error}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 8,
  },
  url: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginRight: 8,
  },
  categoryText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    flex: 1,
  },
  previewContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 100,
  },
  previewTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    padding: 12,
    borderBottomWidth: 1,
  },
  webView: {
    height: 350, // Adjusted height for webview
  },
  imagePreviewContainer: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 100, // Keep consistent bottom margin
    padding: 8, // Add some padding around the image
  },
  localImagePreview: {
    width: '100%',
    height: 300, // Adjust as needed, or make it dynamic
    borderRadius: 8,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  actionButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
  },
  noPreviewContainer: {
    marginBottom: 100, // To ensure content doesn't hide behind action bar
  }
});