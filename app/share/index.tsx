import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLinkStore } from '@/store/linkStore';
import { useCategoryStore } from '@/store/categoryStore';
import { Check } from 'lucide-react-native';
import AppHeader from '@/components/ui/AppHeader';
import Screen from '@/components/ui/Screen';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Link, LinkType, MediaMetadata } from '@/types';
import { detectLinkType, extractMetadata } from '@/utils/linkParser';
import * as ImagePicker from 'expo-image-picker';
import MediaSearchPicker from '@/components/ui/MediaSearchPicker';
import { MediaItem, mediaItemToLink } from '@/utils/itunes';
import { isMediaType } from '@/utils/media';
import { resolveCreateType } from '@/utils/home';
import { alertError } from '@/utils/errors';
import { deleteStoredImage, ensureRemoteImageUrl, isUploadableImageUri } from '@/utils/imageUpload';
import LinkForm from '@/components/ui/LinkForm';
import { canSaveLinkForm } from '@/utils/linkForm';

export default function ShareScreen() {
  const { colors, spacing, radius } = useTheme();
  const router = useRouter();
  const { addLink } = useLinkStore();
  const { categories, fetchCategories } = useCategoryStore();
  const params = useLocalSearchParams();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<LinkType>(
    () => resolveCreateType(params.type as string | string[] | undefined) ?? 'link'
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMetadataFetched, setIsMetadataFetched] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [mediaMetadata, setMediaMetadata] = useState<MediaMetadata | null>(null);
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const initialType = resolveCreateType(params.type as string | string[] | undefined);
    if (initialType) {
      setSelectedType(initialType);
    }
  }, [params.type]);

  useEffect(() => {
    if (params.url) {
      const sharedUrl = String(params.url);
      setUrl(sharedUrl);

      if (isUploadableImageUri(sharedUrl)) {
        setSelectedType('image');
        setImageUri(sharedUrl);
        setTitle((prevTitle) => prevTitle || 'Imagem compartilhada');
        setIsMetadataFetched(true);
      } else {
        setIsMetadataFetched(true);
      }
    }
  }, [params]);

  const fetchLinkMetadata = async (linkUrl: string) => {
    if (isUploadableImageUri(linkUrl)) {
      setIsMetadataFetched(true);
      return;
    }
    if (!linkUrl || isMetadataFetched) {
      return;
    }

    setIsLoading(true);
    try {
      const detectedType = await detectLinkType(linkUrl);
      const validTypes: LinkType[] = ['link', 'video', 'image', 'music', 'movie'];
      if (validTypes.includes(detectedType) && detectedType !== 'image') {
        setSelectedType(detectedType);
      } else if (!validTypes.includes(selectedType) || selectedType === 'image') {
        setSelectedType('link');
      }

      const metadata = await extractMetadata(linkUrl);
      if (metadata.title) setTitle(metadata.title);
      if (metadata.description) setDescription(metadata.description);
      if (metadata.thumbnail) setThumbnail(metadata.thumbnail);
      if (metadata.metadata) setMediaMetadata(metadata.metadata);
      if (metadata.type && (metadata.type === 'music' || metadata.type === 'movie')) {
        setSelectedType(metadata.type);
      }

      setIsMetadataFetched(true);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      setTitle((prevTitle) => prevTitle || 'Minha imagem');
      setDescription('');
      setIsMetadataFetched(true);
    }
  };

  const handleSave = async () => {
    if (isLoading) return;
    if (!canSaveLinkForm({ type: selectedType, title, url })) {
      Alert.alert(
        'Erro',
        selectedType === 'other'
          ? 'Informe um título para a nota.'
          : selectedType === 'image'
            ? 'Escolha uma imagem e informe um título.'
            : 'Informe um título e um URL.'
      );
      return;
    }

    setIsLoading(true);
    let uploadedUrl: string | null = null;

    try {
      let finalUrl = url;
      let finalThumbnail = thumbnail || null;
      const localImage = imageUri || url;

      if (selectedType === 'image' && isUploadableImageUri(localImage)) {
        uploadedUrl = await ensureRemoteImageUrl(localImage);
        finalUrl = uploadedUrl;
        finalThumbnail = finalUrl;
      }

      let savvyTitle = title.trim();
      if (!savvyTitle) {
        if (selectedType === 'image') savvyTitle = 'Imagem salva';
        else if (selectedType === 'other') savvyTitle = 'Nota sem título';
        else if (url) savvyTitle = url;
        else savvyTitle = 'Link sem título';
      }

      const newLink: Partial<Link> = {
        url: finalUrl,
        title: savvyTitle,
        description,
        thumbnail: finalThumbnail || undefined,
        type: selectedType,
        categoryIds: selectedCategories,
        created_at: new Date().toISOString(),
        is_read: false,
        metadata: isMediaType(selectedType) ? mediaMetadata : null,
      };

      await addLink(newLink);
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

  const handleSelectMedia = (item: MediaItem) => {
    const mapped = mediaItemToLink(item);
    setUrl(mapped.url || '');
    setTitle(mapped.title || '');
    setDescription(mapped.description || '');
    setThumbnail(mapped.thumbnail);
    setMediaMetadata(mapped.metadata || null);
    setSelectedType(item.kind);
    setIsMetadataFetched(true);
  };

  const onTypeSelect = (newType: LinkType) => {
    const oldType = selectedType;
    setSelectedType(newType);

    if (oldType !== newType) {
      setIsMetadataFetched(false);
      setMediaMetadata(null);
      setThumbnail(undefined);

      if (oldType === 'image' && isUploadableImageUri(url)) {
        setUrl('');
        setImageUri(null);
        if (title === 'Minha imagem' || title === 'Imagem compartilhada' || title === 'Shared Image') {
          setTitle('');
        }
      } else if (newType === 'image' && url && !isUploadableImageUri(url)) {
        setUrl('');
        setImageUri(null);
        setTitle('');
        setDescription('');
      } else if (newType === 'other') {
        setUrl('');
        setImageUri(null);
      }

      if (
        newType !== 'other' &&
        newType !== 'image' &&
        !isMediaType(newType) &&
        url &&
        !isUploadableImageUri(url)
      ) {
        fetchLinkMetadata(url);
      }
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
        title="Novo Savvy"
        onBack={() => router.back()}
        backIcon="close"
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
          onUrlChange={(text) => {
            setUrl(text);
            setIsMetadataFetched(false);
          }}
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
              <>
                <MediaSearchPicker
                  kind={selectedType}
                  onSelect={handleSelectMedia}
                  selectedTitle={title || undefined}
                />
                {thumbnail ? (
                  <Image
                    source={{ uri: thumbnail }}
                    style={{
                      width: '100%',
                      height: 200,
                      borderRadius: radius.md,
                      marginTop: spacing.sm,
                    }}
                    resizeMode="contain"
                  />
                ) : null}
              </>
            ) : null
          }
          saveLabel="Salvar"
          onSave={handleSave}
          saving={isLoading}
          canSave={readyToSave}
        />
      </ScrollView>
    </Screen>
  );
}
