import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TextInput, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLinkStore } from '@/store/linkStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useTheme } from '@/context/ThemeContext';
import { ArrowLeft, Check, Link as LinkIcon, Image as ImageIconLucide } from 'lucide-react-native';
import { Link, LinkType } from '@/types';
import CategorySelector from '@/components/ui/CategorySelector';
import TypeSelector from '@/components/ui/TypeSelector';
import * as ImagePicker from 'expo-image-picker';

export default function EditLinkScreen() {
  const { id } = useLocalSearchParams();
  const { links, updateLink } = useLinkStore();
  const { categories } = useCategoryStore();
  const { colors } = useTheme();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<LinkType>('link');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [imageUri, setImageUri] = useState<string | null>(null); // For image preview
  const [isLoading, setIsLoading] = useState(false); // Added for consistency, though not heavily used here yet

  useEffect(() => {
    if (id && typeof id === 'string') {
      const currentLink = links.find(item => item.id === id);
      if (currentLink) {
        setTitle(currentLink.title);
        setUrl(currentLink.url);
        setDescription(currentLink.description || '');
        setSelectedType(currentLink.type);
        setSelectedCategories(currentLink.categoryIds || []);
        if (currentLink.type === 'image' && currentLink.url.startsWith('file://')) {
          setImageUri(currentLink.url);
        }
      }
    }
  }, [id, links]);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const pickedUri = result.assets[0].uri;
      setUrl(pickedUri); // Store the local URI in the 'url' field for images
      setImageUri(pickedUri);
      // Optionally, clear description or update title if needed
    }
  };

  const handleSave = () => {
    if (id && typeof id === 'string') {
      if (selectedType === 'other' && !title.trim()) {
        alert('Please enter a title for the text savvy.');
        return;
      }
      if (selectedType !== 'other' && !url.trim()) {
        alert(selectedType === 'image' ? 'Please choose an image or ensure a URL is present.' : 'Please enter a URL.');
        return;
      }
      if (!title.trim() && selectedType !== 'other') {
          alert('Please enter a title.');
          return;
      }

      let savvyTitle = title.trim();
      if (!savvyTitle) {
        if (selectedType === 'image' && url.startsWith('file://')) savvyTitle = 'Edited Image';
        else if (selectedType !== 'other') savvyTitle = url;
        else savvyTitle = 'Untitled Note';
      }

      updateLink(id, {
        title: savvyTitle,
        url: url,
        description,
        type: selectedType,
        categoryIds: selectedCategories,
        // isRead and createdAt are not typically updated on edit, unless intended
      });
      router.back();
    }
  };

  const onTypeSelect = (newType: LinkType) => {
    const oldType = selectedType;
    setSelectedType(newType);

    if (oldType !== newType) {
      // If changing away from 'image' and URL was a local file
      if (oldType === 'image' && url.startsWith('file://')) {
        // Decide if URL should be cleared or kept if user switches to 'link' for example
        // For now, let's keep it simple and not auto-clear, user can manually change
      }
      // If changing to 'image' and URL was a web URL
      else if (newType === 'image' && url && !url.startsWith('file://')) {
        // If current URL is a web URL, and user switches to image, clear it to prompt picking
        setUrl('');
        setImageUri(null);
      }
      // If changing to 'text'
      else if (newType === 'other') {
        // If switching to text, the URL field is not relevant in the same way
        // setUrl(''); // Optionally clear URL
        setImageUri(null);
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  const canSave = () => {
    if (selectedType === 'other') return !!title.trim();
    return !!url.trim() && !!title.trim();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Edit Link
        </Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={styles.saveButton}
          disabled={!canSave()}>
          <Check size={24} color={canSave() ? colors.primary : colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Title"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>
        
        {selectedType === 'image' ? (
          <>
            <TouchableOpacity
              style={[styles.pickImageButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handlePickImage}
            >
              <ImageIconLucide size={20} color={colors.primary} style={styles.inputIcon} />
              <Text style={[styles.pickImageButtonText, { color: colors.primary }]}>
                {imageUri || url.startsWith('file://') ? 'Change Image' : 'Choose Image from Device'}
              </Text>
            </TouchableOpacity>
            {(imageUri || (selectedType === 'image' && url.startsWith('file://'))) && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri || url }} style={styles.imagePreview} resizeMode="contain" />
              </View>
            )}
            {/* Optionally, show URL input if it's a web image URL */}
            {selectedType === 'image' && url && !url.startsWith('file://') && (
                 <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                   <LinkIcon size={20} color={colors.textSecondary} style={styles.inputIcon} />
                   <TextInput style={[styles.input, { color: colors.text }]} placeholder="Image URL" placeholderTextColor={colors.textSecondary} value={url} onChangeText={setUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url"/>
                 </View>
            )}
          </>
        ) : selectedType !== 'other' && (
          <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <LinkIcon size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput style={[styles.input, { color: colors.text }]} placeholder={selectedType === 'video' ? "Video URL" : "https://example.com"} placeholderTextColor={colors.textSecondary} value={url} onChangeText={setUrl} autoCapitalize="none" autoCorrect={false} keyboardType="url"/>
          </View>
        )}
        
        <View style={[styles.textAreaContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.textArea, { color: colors.text }]}
            placeholder={selectedType === 'other' ? "Your note content..." : "Description (optional)"}
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Type</Text>
        <TypeSelector 
          selectedType={selectedType}
          onSelectType={onTypeSelect}
        />
        
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Categories</Text>
        <CategorySelector
          categories={categories}
          selectedCategories={selectedCategories}
          onSelectCategory={(categoryId) => {
            if (selectedCategories.includes(categoryId)) {
              setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
            } else {
              setSelectedCategories([...selectedCategories, categoryId]);
            }
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  saveButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  inputIcon: { // Added for LinkIcon
    marginRight: 6,
  },
  input: {
    height: 40,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 24,
    padding: 8,
  },
  textArea: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    minHeight: 80,
  },
  sectionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 12,
  },
  pickImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  pickImageButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginLeft: 8,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
});