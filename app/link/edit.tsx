import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLinkStore } from '@/store/linkStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useTheme } from '@/context/ThemeContext';
import { Check } from 'lucide-react-native';
import Screen from '@/components/ui/Screen';
import AppHeader from '@/components/ui/AppHeader';
import { Link, LinkType } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import { alertError } from '@/utils/errors';
import { deleteStoredImage, ensureRemoteImageUrl, isUploadableImageUri } from '@/utils/imageUpload';
import LinkForm from '@/components/ui/LinkForm';
import { canSaveLinkForm } from '@/utils/linkForm';
import MediaSearchPicker from '@/components/ui/MediaSearchPicker';
import { MediaItem, mediaItemToLink } from '@/utils/itunes';
import { isMediaType } from '@/utils/media';
import { MediaMetadata } from '@/types';

export default function EditLinkScreen() {
  const { id } = useLocalSearchParams();
  const { links, updateLink } = useLinkStore();
  const { categories } = useCategoryStore();
  const { colors, spacing } = useTheme();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<LinkType>('link');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaMetadata, setMediaMetadata] = useState<MediaMetadata | null>(null);
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const currentLink = links.find((item) => item.id === id);
      if (currentLink) {
        setTitle(currentLink.title);
        setUrl(currentLink.url);
        setDescription(currentLink.description || '');
        setSelectedType(currentLink.type);
        setSelectedCategories(currentLink.categoryIds || []);
        setMediaMetadata(currentLink.metadata || null);
        setThumbnail(currentLink.thumbnail);
        if (currentLink.type === 'image') {
          setImageUri(currentLink.url);
        }
      }
    }
  }, [id, links]);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permissão', 'É preciso permitir o acesso às fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const pickedUri = result.assets[0].uri;
      setUrl(pickedUri);
      setImageUri(pickedUri);
    }
  };

  const handleSelectMedia = (item: MediaItem) => {
    const mapped = mediaItemToLink(item);
    setUrl(mapped.url || '');
    setTitle(mapped.title || '');
    setDescription(mapped.description || '');
    setThumbnail(mapped.thumbnail);
    setMediaMetadata(mapped.metadata || null);
    setSelectedType(item.kind);
  };

  const handleSave = async () => {
    if (isLoading || !id || typeof id !== 'string') return;
    if (!canSaveLinkForm({ type: selectedType, title, url })) {
      Alert.alert(
        'Erro',
        selectedType === 'other' ? 'Informe um título para a nota.' : 'Informe um título e um URL.'
      );
      return;
    }

    let savvyTitle = title.trim();
    if (!savvyTitle) {
      if (selectedType === 'image' && isUploadableImageUri(url)) savvyTitle = 'Imagem editada';
      else if (selectedType !== 'other') savvyTitle = url;
      else savvyTitle = 'Nota sem título';
    }

    setIsLoading(true);
    let uploadedUrl: string | null = null;
    try {
      let finalUrl = url;
      let nextThumbnail = thumbnail;
      if (selectedType === 'image' && isUploadableImageUri(url)) {
        uploadedUrl = await ensureRemoteImageUrl(url);
        finalUrl = uploadedUrl;
        nextThumbnail = finalUrl;
      }

      const payload: Partial<Link> = {
        title: savvyTitle,
        url: finalUrl,
        description,
        type: selectedType,
        categoryIds: selectedCategories,
      };
      if (nextThumbnail) payload.thumbnail = nextThumbnail;
      if (isMediaType(selectedType)) {
        payload.metadata = mediaMetadata;
      } else {
        payload.metadata = null;
      }

      await updateLink(id, payload);
      router.back();
    } catch (error) {
      if (uploadedUrl) {
        await deleteStoredImage(uploadedUrl);
      }
      alertError(error, 'Não foi possível salvar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const onTypeSelect = (newType: LinkType) => {
    const oldType = selectedType;
    setSelectedType(newType);
    if (oldType === newType) return;

    if (newType === 'image' && url && !isUploadableImageUri(url)) {
      setUrl('');
      setImageUri(null);
    } else if (newType === 'other') {
      setImageUri(null);
    }
    if (!isMediaType(newType)) {
      setMediaMetadata(null);
    }
  };

  const readyToSave = canSaveLinkForm({
    type: selectedType,
    title,
    url,
    saving: isLoading,
  });

  return (
    <Screen>
      <AppHeader
        title="Editar item"
        onBack={() => router.back()}
        right={
          <TouchableOpacity
            onPress={handleSave}
            disabled={!readyToSave}
            accessibilityLabel="Salvar"
          >
            <Check size={24} color={readyToSave ? colors.primary : colors.textSecondary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LinkForm
          title={title}
          onTitleChange={setTitle}
          url={url}
          onUrlChange={setUrl}
          description={description}
          onDescriptionChange={setDescription}
          selectedType={selectedType}
          onTypeSelect={onTypeSelect}
          categories={categories}
          selectedCategories={selectedCategories}
          onToggleCategory={(categoryId) => {
            setSelectedCategories((current) =>
              current.includes(categoryId)
                ? current.filter((id) => id !== categoryId)
                : [...current, categoryId]
            );
          }}
          imageUri={imageUri}
          onPickImage={handlePickImage}
          mediaSlot={
            isMediaType(selectedType) ? (
              <MediaSearchPicker
                kind={selectedType}
                onSelect={handleSelectMedia}
                selectedTitle={title || undefined}
              />
            ) : null
          }
          saveLabel="Salvar alterações"
          onSave={handleSave}
          saving={isLoading}
          canSave={readyToSave}
        />
      </ScrollView>
    </Screen>
  );
}
