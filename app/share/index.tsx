import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useLinkStore } from "@/store/linkStore";
import { useCategoryStore } from "@/store/categoryStore";
import {
  Link as LinkIcon,
  Check,
  Image as ImageIconLucide,
} from "lucide-react-native";
import AppHeader from "@/components/ui/AppHeader";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Link, LinkType } from "@/types";
import CategorySelector from "@/components/ui/CategorySelector";
import TypeSelector from "@/components/ui/TypeSelector";
import { detectLinkType, extractMetadata } from "@/utils/linkParser";
import Animated, { FadeIn } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import MediaSearchPicker from "@/components/ui/MediaSearchPicker";
import { MediaItem, mediaItemToLink } from "@/utils/itunes";
import { isMediaType } from "@/utils/media";
import { MediaMetadata } from "@/types";
import { resolveCreateType } from "@/utils/home";
import { alertError } from "@/utils/errors";
import { deleteStoredImage, ensureRemoteImageUrl, isUploadableImageUri } from "@/utils/imageUpload";

export default function ShareScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { addLink } = useLinkStore();
  const { categories, fetchCategories: fetchCategoriesFromStore } =
    useCategoryStore(); // Renamed to avoid conflict
  const params = useLocalSearchParams();

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState<LinkType>(
    () => resolveCreateType(params.type as string | string[] | undefined) ?? "link"
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMetadataFetched, setIsMetadataFetched] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null); // For image preview
  const [mediaMetadata, setMediaMetadata] = useState<MediaMetadata | null>(null);
  const [thumbnail, setThumbnail] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Fetch categories when the screen mounts
    fetchCategoriesFromStore();
  }, [fetchCategoriesFromStore]);

  useEffect(() => {
    const initialType = resolveCreateType(params.type as string | string[] | undefined);
    if (initialType) {
      setSelectedType(initialType);
    }
  }, [params.type]);

  useEffect(() => {
    // Handle shared URL from other apps
    if (params.url) {
      const sharedUrl = String(params.url);
      setUrl(sharedUrl);

      if (sharedUrl.startsWith("file://") || isUploadableImageUri(sharedUrl)) {
        // If it's a local file URI, assume it's an image
        setSelectedType("image");
        setSelectedType("image");
        setImageUri(sharedUrl);
        setTitle((prevTitle) => prevTitle || "Shared Image");
        setIsMetadataFetched(true); // No web metadata to fetch for local files
      } else {
        // It's a web URL, but don't auto-fetch metadata
        setIsMetadataFetched(true);
      }
    }
  }, [params]);

  const fetchLinkMetadata = async (linkUrl: string) => {
    // Skip for local file URIs, or if already fetched/no URL
    if (isUploadableImageUri(linkUrl)) {
      setIsMetadataFetched(true);
      return;
    }
    if (!linkUrl || isMetadataFetched) {
      return;
    }

    setIsLoading(true);
    try {
      // Auto-detect link type for web URLs
      const detectedType = await detectLinkType(linkUrl);
      const validTypes: LinkType[] = [
        "link",
        "video",
        "image",
        "music",
        "movie",
      ];
      if (validTypes.includes(detectedType) && detectedType !== "image") {
        // Don't auto-switch to image from web URL detection
        setSelectedType(detectedType);
      } else if (
        !validTypes.includes(selectedType) ||
        selectedType === "image"
      ) {
        // If current type is invalid or 'image' (but we have a web URL), default to 'link'
        setSelectedType("link");
      }

      const metadata = await extractMetadata(linkUrl);
      if (metadata.title) setTitle(metadata.title);
      if (metadata.description) setDescription(metadata.description);
      if (metadata.thumbnail) setThumbnail(metadata.thumbnail);
      if (metadata.metadata) setMediaMetadata(metadata.metadata);
      if (metadata.type && (metadata.type === "music" || metadata.type === "movie")) {
        setSelectedType(metadata.type);
      }

      setIsMetadataFetched(true);
    } catch (error) {
      console.error("Error fetching metadata:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("É preciso permitir o acesso às fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      // aspect: [4, 3], // Removido para permitir corte livre
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const pickedUri = result.assets[0].uri;
      setUrl(pickedUri); // Store the local URI in the 'url' field for images
      setImageUri(pickedUri);
      setTitle((prevTitle) => prevTitle || "Minha imagem");
      setDescription(""); // Clear description for new image
      setIsMetadataFetched(true); // Local image, no further metadata fetching
    }
  };

  const handleSave = async () => {
    if (isLoading) return;
    if (selectedType === "other" && !title.trim()) {
      Alert.alert("Erro", "Informe um título para a nota.");
      return;
    }
    if (selectedType !== "other" && !url.trim()) {
      Alert.alert(
        "Erro",
        selectedType === "image"
          ? "Escolha uma imagem."
          : "Informe um URL."
      );
      return;
    }
    if (!title.trim() && selectedType !== "other") {
      Alert.alert("Erro", "Informe um título.");
      return;
    }

    setIsLoading(true);
    let uploadedUrl: string | null = null;

    try {
      let finalUrl = url;
      let finalThumbnail = thumbnail || null;
      const localImage = imageUri || url;

      if (selectedType === "image" && isUploadableImageUri(localImage)) {
        uploadedUrl = await ensureRemoteImageUrl(localImage);
        finalUrl = uploadedUrl;
        finalThumbnail = finalUrl;
      }

      let savvyTitle = title.trim();
      if (!savvyTitle) {
        if (selectedType === "image") savvyTitle = "Imagem salva";
        else if (selectedType === "other") savvyTitle = "Nota sem título";
        else if (url)
          savvyTitle = url;
        else savvyTitle = "Link sem título";
      }

      const newLink: Partial<Link> = {
        url: finalUrl,
        title: savvyTitle,
        description: description,
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
      alertError(error, "Não foi possível salvar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMedia = (item: MediaItem) => {
    const mapped = mediaItemToLink(item);
    setUrl(mapped.url || "");
    setTitle(mapped.title || "");
    setDescription(mapped.description || "");
    setThumbnail(mapped.thumbnail);
    setMediaMetadata(mapped.metadata || null);
    setSelectedType(item.kind);
    setIsMetadataFetched(true);
  };

  const handleCancel = () => {
    router.back();
  };

  const onTypeSelect = (newType: LinkType) => {
    const oldType = selectedType;
    setSelectedType(newType);

    // Reset fields when type changes significantly
    if (oldType !== newType) {
      setIsMetadataFetched(false); // Allow re-fetching or new state
      setMediaMetadata(null);
      setThumbnail(undefined);

      // If changing away from 'image' and URL was a local file
      if (oldType === "image" && isUploadableImageUri(url)) {
        setUrl("");
        setImageUri(null);
        if (title === "My Image" || title === "Shared Image") setTitle(""); // Clear default image titles
        // setDescription(''); // Keep description if user entered it
      }
      // If changing to 'image' and URL was a web URL
      else if (newType === "image" && url && !isUploadableImageUri(url)) {
        setUrl(""); // Clear web URL to prompt for picking
        setImageUri(null);
        setTitle(""); // Clear title from web metadata
        setDescription("");
      }
      // If changing to 'other' (text type)
      else if (newType === "other") {
        setUrl("");
        setImageUri(null);
        // Keep title/description if user might want to convert a link to a note
      }

      // If new type is URL-based and a web URL exists, try fetching metadata
      if (
        newType !== "other" &&
        newType !== "image" &&
        !isMediaType(newType) &&
        url &&
        !isUploadableImageUri(url)
      ) {
        fetchLinkMetadata(url);
      }
    }
  };

  const canSave = () => {
    if (isLoading) return false;
    if (selectedType === "other") return !!title.trim();
    return !!url.trim() && !!title.trim();
  };

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: colors.background }]}
      entering={FadeIn.duration(300)}
    >
      <AppHeader
        title="Novo Savvy"
        onBack={handleCancel}
        backIcon="close"
        right={
          <TouchableOpacity
            onPress={handleSave}
            disabled={!canSave()}
            accessibilityLabel="Salvar"
          >
            <Check
              size={24}
              color={canSave() ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Tipo
        </Text>
        <TypeSelector selectedType={selectedType} onSelectType={onTypeSelect} />

        {selectedType === "image" ? (
          <>
            <TouchableOpacity
              style={[
                styles.pickImageButton,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={handlePickImage}
            >
              <ImageIconLucide
                size={20}
                color={colors.primary}
                style={styles.inputIcon}
              />
              <Text
                style={[styles.pickImageButtonText, { color: colors.primary }]}
              >
                {imageUri ? "Trocar imagem" : "Escolher imagem do dispositivo"}
              </Text>
            </TouchableOpacity>
            {imageUri && (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.imagePreview}
                  resizeMode="contain"
                />
              </View>
            )}
          </>
        ) : isMediaType(selectedType) ? (
          <>
            <MediaSearchPicker
              kind={selectedType}
              onSelect={handleSelectMedia}
              selectedTitle={title || undefined}
            />
            {thumbnail ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: thumbnail }}
                  style={styles.imagePreview}
                  resizeMode="contain"
                />
              </View>
            ) : null}
          </>
        ) : selectedType !== "other" ? (
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <LinkIcon
              size={20}
              color={colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder={
                selectedType === "video"
                  ? "URL do vídeo"
                  : "https://exemplo.com"
              }
              placeholderTextColor={colors.textSecondary}
              value={url}
              onChangeText={(text) => {
                setUrl(text);
                setIsMetadataFetched(false);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>
        ) : null}

        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Título"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View
          style={[
            styles.textAreaContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TextInput
            style={[styles.textArea, { color: colors.text }]}
            placeholder={
              selectedType === "other"
                ? "Comece a escrever sua nota..."
                : "Descrição (opcional)"
            }
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={Platform.OS === "ios" ? 0 : 4}
            textAlignVertical="top"
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Categorias
        </Text>
        <CategorySelector
          categories={categories}
          selectedCategories={selectedCategories}
          onSelectCategory={(categoryId) => {
            if (selectedCategories.includes(categoryId)) {
              setSelectedCategories(
                selectedCategories.filter((id) => id !== categoryId)
              );
            } else {
              setSelectedCategories([...selectedCategories, categoryId]);
            }
          }}
        />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40, // Add padding to bottom for scroll
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: 40,
    fontFamily: "Inter-Regular",
    fontSize: 14,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 24,
    padding: 8,
  },
  textArea: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    minHeight: 80,
  },
  sectionTitle: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    marginBottom: 12,
  },
  pickImageButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: "center",
  },
  pickImageButtonText: {
    fontFamily: "Inter-Medium",
    fontSize: 14,
    marginLeft: 8,
  },
  imagePreviewContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
});
