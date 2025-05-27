import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useLinkStore } from '@/store/linkStore';
import { useCategoryStore } from '@/store/categoryStore';
import { X, Link as LinkIcon, Check } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Link, LinkType } from '@/types';
import CategorySelector from '@/components/ui/CategorySelector';
import TypeSelector from '@/components/ui/TypeSelector';
import { detectLinkType, extractMetadata } from '@/utils/linkParser';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function ShareScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { addLink } = useLinkStore();
  const { categories } = useCategoryStore();
  const params = useLocalSearchParams();
  
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<LinkType>('article');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMetadataFetched, setIsMetadataFetched] = useState(false);

  useEffect(() => {
    // Handle shared URL from other apps
    if (params.url) {
      const sharedUrl = String(params.url);
      setUrl(sharedUrl);
      
      // Auto-detect link type and fetch metadata
      fetchLinkMetadata(sharedUrl);
    }
  }, [params]);

  const fetchLinkMetadata = async (linkUrl: string) => {
    if (!linkUrl || isMetadataFetched) return;
    
    setIsLoading(true);
    try {
      // Detect link type
      const detectedType = await detectLinkType(linkUrl);
      setSelectedType(detectedType);
      
      // Extract metadata (title, description, etc.)
      const metadata = await extractMetadata(linkUrl);
      if (metadata.title) setTitle(metadata.title);
      if (metadata.description) setDescription(metadata.description);
      
      setIsMetadataFetched(true);
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!url) return;
    
    const newLink: Partial<Link> = {
      url,
      title: title || url,
      description,
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

  return (
    <Animated.View 
      style={[styles.container, { backgroundColor: colors.background }]}
      entering={FadeIn.duration(300)}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Save Link</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={styles.headerButton}
          disabled={!url}
        >
          <Check size={24} color={url ? colors.primary : colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <LinkIcon size={20} color={colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="https://example.com"
            placeholderTextColor={colors.textSecondary}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>
        
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Title"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </View>
        
        <View style={[styles.textAreaContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.textArea, { color: colors.text }]}
            placeholder="Description (optional)"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={Platform.OS === 'ios' ? 0 : 4}
            textAlignVertical="top"
          />
        </View>
        
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Type</Text>
        <TypeSelector 
          selectedType={selectedType}
          onSelectType={setSelectedType}
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 24,
    padding: 12,
  },
  textArea: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    minHeight: 100,
  },
  sectionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 12,
  },
});