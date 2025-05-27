import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useLinkStore } from '@/store/linkStore';
import { useCategoryStore } from '@/store/categoryStore';
import { useTheme } from '@/context/ThemeContext';
import { ArrowLeft, Check } from 'lucide-react-native';
import { Link, LinkType } from '@/types';
import CategorySelector from '@/components/ui/CategorySelector';
import TypeSelector from '@/components/ui/TypeSelector';

export default function EditLinkScreen() {
  const { id } = useLocalSearchParams();
  const { links, updateLink } = useLinkStore();
  const { categories } = useCategoryStore();
  const { colors } = useTheme();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState<LinkType>('article');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const link = links.find(item => item.id === id);
      if (link) {
        setTitle(link.title);
        setUrl(link.url);
        setDescription(link.description || '');
        setSelectedType(link.type);
        setSelectedCategories(link.categoryIds);
      }
    }
  }, [id, links]);

  const handleSave = () => {
    if (id && typeof id === 'string') {
      updateLink(id, {
        title,
        url,
        description,
        type: selectedType,
        categoryIds: selectedCategories,
      });
      router.back();
    }
  };

  const handleBack = () => {
    router.back();
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
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Check size={24} color={colors.primary} />
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
        
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="URL"
            placeholderTextColor={colors.textSecondary}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
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
            numberOfLines={4}
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
    </View>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
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
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  input: {
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