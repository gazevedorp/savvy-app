import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinkType, Category } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { Link as LinkIcon, Image as ImageIcon } from 'lucide-react-native';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';
import TypeSelector from '@/components/ui/TypeSelector';
import CategorySelector from '@/components/ui/CategorySelector';
import { isMediaType } from '@/utils/media';
import { isUploadableImageUri } from '@/utils/imageUri';
import { canSaveLinkForm, urlPlaceholderForType } from '@/utils/linkForm';

export { canSaveLinkForm, urlPlaceholderForType };

interface LinkFormProps {
  title: string;
  onTitleChange: (value: string) => void;
  url: string;
  onUrlChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  selectedType: LinkType;
  onTypeSelect: (type: LinkType) => void;
  categories: Category[];
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  imageUri?: string | null;
  onPickImage?: () => void;
  mediaSlot?: React.ReactNode;
  saveLabel?: string;
  onSave?: () => void;
  saving?: boolean;
  canSave?: boolean;
}

export default function LinkForm({
  title,
  onTitleChange,
  url,
  onUrlChange,
  description,
  onDescriptionChange,
  selectedType,
  onTypeSelect,
  categories,
  selectedCategories,
  onToggleCategory,
  imageUri,
  onPickImage,
  mediaSlot,
  saveLabel = 'Salvar',
  onSave,
  saving = false,
  canSave = false,
}: LinkFormProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const previewUri = imageUri || (selectedType === 'image' ? url : undefined);
  const showRemoteImageUrl =
    selectedType === 'image' && url && !isUploadableImageUri(url);

  return (
    <View>
      <Text
        style={[
          typography.overline,
          { color: colors.textSecondary, marginBottom: spacing.sm },
        ]}
      >
        Tipo
      </Text>
      <TypeSelector selectedType={selectedType} onSelectType={onTypeSelect} />

      {selectedType === 'image' ? (
        <View style={{ marginBottom: spacing.md }}>
          <Button
            title={previewUri ? 'Trocar imagem' : 'Escolher imagem do dispositivo'}
            onPress={onPickImage || (() => {})}
            variant="outline"
          />
          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={[
                styles.preview,
                { borderRadius: radius.md, marginTop: spacing.sm, borderColor: colors.border },
              ]}
              resizeMode="contain"
            />
          ) : null}
          {showRemoteImageUrl ? (
            <View style={{ marginTop: spacing.md }}>
              <InputField
                label="URL da imagem"
                placeholder="https://exemplo.com/foto.jpg"
                value={url}
                onChangeText={onUrlChange}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                leftIcon={<ImageIcon size={18} color={colors.textSecondary} />}
              />
            </View>
          ) : null}
        </View>
      ) : isMediaType(selectedType) && mediaSlot ? (
        <View style={{ marginBottom: spacing.md }}>{mediaSlot}</View>
      ) : selectedType !== 'other' ? (
        <InputField
          label="URL"
          placeholder={urlPlaceholderForType(selectedType)}
          value={url}
          onChangeText={onUrlChange}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          leftIcon={<LinkIcon size={18} color={colors.textSecondary} />}
        />
      ) : null}

      <InputField
        label="Título"
        placeholder="Título"
        value={title}
        onChangeText={onTitleChange}
        required={selectedType === 'other'}
      />

      <InputField
        label={selectedType === 'other' ? 'Nota' : 'Descrição'}
        placeholder={
          selectedType === 'other' ? 'Escreva sua nota...' : 'Descrição (opcional)'
        }
        value={description}
        onChangeText={onDescriptionChange}
        multiline
      />

      <Text
        style={[
          typography.overline,
          { color: colors.textSecondary, marginBottom: spacing.sm },
        ]}
      >
        Categorias
      </Text>
      <CategorySelector
        categories={categories}
        selectedCategories={selectedCategories}
        onSelectCategory={onToggleCategory}
      />

      {onSave ? (
        <View style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}>
          <Button
            title={saveLabel}
            onPress={onSave}
            loading={saving}
            disabled={!canSave}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    backgroundColor: '#111',
  },
});
