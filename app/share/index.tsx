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
} from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useLinkStore } from "@/store/linkStore";
import { useCategoryStore } from "@/store/categoryStore";
import {
  X,
  Link as LinkIcon,
  Check,
  Image as ImageIconLucide,
} from "lucide-react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Link, LinkType } from "@/types";
import CategorySelector from "@/components/ui/CategorySelector";
import TypeSelector from "@/components/ui/TypeSelector";
import { detectLinkType, extractMetadata } from "@/utils/linkParser";
import Animated, { FadeIn } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";

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
  const [selectedType, setSelectedType] = useState<LinkType>("link");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMetadataFetched, setIsMetadataFetched] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null); // For image preview

  useEffect(() => {
    // Fetch categories when the screen mounts
    fetchCategoriesFromStore();
  }, [fetchCategoriesFromStore]);

  useEffect(() => {
    // Handle shared URL from other apps
    if (params.url) {
      const sharedUrl = String(params.url);
      setUrl(sharedUrl);

      if (sharedUrl.startsWith("file://")) {
        // If it's a local file URI, assume it's an image
        setSelectedType("image");
        setImageUri(sharedUrl);
        setTitle((prevTitle) => prevTitle || "Shared Image");
        setIsMetadataFetched(true); // No web metadata to fetch for local files
      } else {
        // It's a web URL, proceed with metadata fetching
        fetchLinkMetadata(sharedUrl);
      }
    }
  }, [params]);

  const fetchLinkMetadata = async (linkUrl: string) => {
    // Skip for text type, local file URIs, or if already fetched/no URL
    if (selectedType === "text" || linkUrl.startsWith("file://")) {
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
        "text",
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
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      // aspect: [4, 3], // Removido para permitir corte livre
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const pickedUri = result.assets[0].uri;
      setUrl(pickedUri); // Store the local URI in the 'url' field for images
      setImageUri(pickedUri);
      setTitle((prevTitle) => prevTitle || "My Image"); // Default title for picked image
      setDescription(""); // Clear description for new image
      setIsMetadataFetched(true); // Local image, no further metadata fetching
    }
  };

  const handleSave = async () => {
    if (isLoading) return;
    if (selectedType === "text" && !title.trim()) {
      alert("Please enter a title for the text savvy.");
      return;
    }
    if (selectedType !== "text" && !url.trim()) {
      alert(
        selectedType === "image"
          ? "Please choose an image."
          : "Please enter a URL."
      );
      return;
    }
    if (!title.trim() && selectedType !== "text") {
      alert("Please enter a title.");
      return;
    }

    let savvyTitle = title.trim();
    if (!savvyTitle) {
      if (selectedType === "image") savvyTitle = "Saved Image";
      else if (selectedType !== "text")
        savvyTitle = url; // Fallback to URL if title empty (not for image)
      else savvyTitle = "Untitled Note";
    }

    const newLink: Partial<Link> = {
      url: selectedType === "text" ? "" : url,
      title: savvyTitle,
      description: description,
      type: selectedType,
      categoryIds: selectedCategories,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    await addLink(newLink);
    router.back();
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

      // If changing away from 'image' and URL was a local file
      if (oldType === "image" && url.startsWith("file://")) {
        setUrl("");
        setImageUri(null);
        if (title === "My Image" || title === "Shared Image") setTitle(""); // Clear default image titles
        // setDescription(''); // Keep description if user entered it
      }
      // If changing to 'image' and URL was a web URL
      else if (newType === "image" && url && !url.startsWith("file://")) {
        setUrl(""); // Clear web URL to prompt for picking
        setImageUri(null);
        setTitle(""); // Clear title from web metadata
        setDescription("");
      }
      // If changing to 'text'
      else if (newType === "text") {
        setUrl("");
        setImageUri(null);
        // Keep title/description if user might want to convert a link to a note
      }

      // If new type is URL-based and a web URL exists, try fetching metadata
      if (
        newType !== "text" &&
        newType !== "image" &&
        url &&
        !url.startsWith("file://")
      ) {
        fetchLinkMetadata(url);
      }
    }
  };

  const canSave = () => {
    if (isLoading) return false;
    if (selectedType === "text") return !!title.trim();
    return !!url.trim() && !!title.trim();
  };

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: colors.background }]}
      entering={FadeIn.duration(300)}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          New Savvy
        </Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.headerButton}
          disabled={!canSave()}
        >
          <Check
            size={24}
            color={canSave() ? colors.primary : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          Type
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
                {imageUri ? "Change Image" : "Choose Image from Device"}
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
        ) : (
          selectedType !== "text" && (
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
                    ? "Video URL"
                    : selectedType === "music"
                    ? "Music URL"
                    : "https://example.com"
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
                onBlur={() => fetchLinkMetadata(url)} // Fetch metadata when user finishes typing URL
              />
            </View>
          )
        )}

        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Title"
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
              selectedType === "text"
                ? "Start writing your note..."
                : "Description (optional)"
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
          Categories
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
    paddingTop: Platform.OS === "android" ? 16 : 0, // Adjust for Android status bar if not handled by SafeAreaView
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: "Inter-Bold",
    fontSize: 18,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
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
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontFamily: "Inter-Regular",
    fontSize: 16,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 24,
    padding: 12,
  },
  textArea: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    minHeight: 100,
  },
  sectionTitle: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
    marginBottom: 12,
  },
  pickImageButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 14,
    justifyContent: "center",
  },
  pickImageButtonText: {
    fontFamily: "Inter-Medium",
    fontSize: 16,
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
