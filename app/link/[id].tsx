import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Linking, Share, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLinkStore } from '@/store/linkStore';
import { useTheme } from '@/context/ThemeContext';
import { ExternalLink, Share2, Edit, Trash2, Check, Clock } from 'lucide-react-native';
import Screen from '@/components/ui/Screen';
import AppHeader from '@/components/ui/AppHeader';
import { useCategoryStore } from '@/store/categoryStore';
import { Link } from '@/types';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import MediaDetailView from '@/components/ui/MediaDetailView';
import GenericDetailView from '@/components/ui/GenericDetailView';
import { getTypeLabel, isMediaType } from '@/utils/media';
import { isLocalImageLink } from '@/utils/detail';
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
        router.back();
      } catch (error) {
        alertError(error, 'Não foi possível excluir o item.');
      }
    }
  };

  const getCategoryNames = () => {
    if (!link?.categoryIds || !link.categoryIds.length) return [] as string[];
    return link.categoryIds
      .map((catId) => categories.find((cat) => cat.id === catId)?.name)
      .filter((name): name is string => Boolean(name));
  };

  if (!link) {
    return (
      <Screen>
        <AppHeader title="Detalhe" onBack={handleBack} />
        <Text style={[styles.errorText, typography.heading, { color: colors.text }]}>
          Item não encontrado
        </Text>
      </Screen>
    );
  }

  const isLocalImage = isLocalImageLink(link);
  const isMedia = isMediaType(link.type);
  const categoryNames = getCategoryNames();

  return (
    <Screen>
      <AppHeader
        title={getTypeLabel(link.type)}
        onBack={handleBack}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {isMedia ? (
          <MediaDetailView link={link} categoryNames={categoryNames.join(', ') || 'Nenhuma categoria'} />
        ) : (
          <GenericDetailView link={link} categoryNames={categoryNames} />
        )}
      </ScrollView>

      <View
        style={[
          styles.actionBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingVertical: spacing.sm,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleToggleRead}
          accessibilityLabel={link.is_read ? 'Marcar como a fazer' : 'Marcar como feito'}
        >
          {link.is_read ? (
            <Check size={22} color={colors.success} />
          ) : (
            <Clock size={22} color={colors.textSecondary} />
          )}
        </TouchableOpacity>

        {!isLocalImage && link.url ? (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleOpenLink}
            accessibilityLabel="Abrir link"
          >
            <ExternalLink size={22} color={colors.primary} />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShareLink}
          accessibilityLabel="Compartilhar"
        >
          <Share2 size={22} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/link/edit?id=${link.id}`)}
          accessibilityLabel="Editar"
        >
          <Edit size={22} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setDeleteModalVisible(true)}
          accessibilityLabel="Excluir"
        >
          <Trash2 size={22} color={colors.error} />
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
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
    textAlign: 'center',
    marginTop: 24,
  },
});
