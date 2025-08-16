import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Linking, Share, Image, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLinkStore } from '@/store/linkStore';
import { useTheme } from '@/context/ThemeContext';
import { ArrowLeft, ExternalLink, Share2, Edit, Trash2, Check, Clock } from 'lucide-react-native';
import { useCategoryStore } from '@/store/categoryStore';
import { formatRelativeTime } from '@/utils/dateUtils';
import WebView from '@/components/WebView';
import { Link } from '@/types';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

export default function LinkDetailScreen() {
  const { id } = useLocalSearchParams();
  const { links, updateLink, deleteLink } = useLinkStore();
  const { categories } = useCategoryStore();
  const { colors } = useTheme();
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
    if (link) {
      await Share.share({
        message: `${link.title} - ${link.url}`,
        url: link.url,
      });
    }
  };

  const handleToggleRead = () => {
    if (link && link.id) {
      updateLink(link.id, { is_read: !link.is_read });
    }
  };

  const handleDeleteLink = () => {
    if (link && link.id) {
      deleteLink(link.id);
      router.back();
    }
  };

  const getCategoryNames = () => {
    if (!link?.categoryIds || !link.categoryIds.length) return 'No categories';
    
    return link.categoryIds
      .map(catId => categories.find(cat => cat.id === catId)?.name)
      .filter(Boolean)
      .join(', ');
  };

  if (!link) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Link not found</Text>
      </View>
    );
  }

  const isLocalImage = link.type === 'image' && link.url.startsWith('file://');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {link.title}
        </Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={[styles.linkCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>{link.title}</Text>
          
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
            <View style={[styles.typeTag, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.typeText, { color: colors.primary }]}>
                {link.type === "other" ? "Note" : link.type.charAt(0).toUpperCase() + link.type.slice(1)}
              </Text>
            </View>
            
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              Saved {formatRelativeTime(link.created_at)}
            </Text>
          </View>
          
          <View style={styles.categoryRow}>
            <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
              Categories:
            </Text>
            <Text style={[styles.categoryText, { color: colors.text }]}>
              {getCategoryNames()}
            </Text>
          </View>
        </View>
        
        {isLocalImage ? (
          <View style={[styles.imagePreviewContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={{ uri: link.url }} style={styles.localImagePreview} resizeMode="contain" />
          </View>
        ) : link.url ? ( // Only show WebView if there's a URL and it's not a local image
          <View style={[styles.previewContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.previewTitle, { color: colors.textSecondary, borderBottomColor: colors.border }]}>
              Preview
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
        title="Delete Link"
        message="Are you sure you want to delete this link? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteLink}
        onCancel={() => setDeleteModalVisible(false)}
        confirmButtonColor={colors.error}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  linkCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
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
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  typeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
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