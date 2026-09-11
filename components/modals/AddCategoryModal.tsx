import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Check, X } from 'lucide-react-native';
import { Category } from '@/types';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';
import CategoryIcon from '@/components/ui/CategoryIcon';
import {
  CATEGORY_COLOR_OPTIONS,
  CATEGORY_ICON_IDS,
  normalizeCategoryIcon,
} from '@/utils/categories';

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { name: string; color: string; icon?: string }) => void;
  categoryToEdit?: Category | null;
}

export default function AddCategoryModal({
  visible,
  onClose,
  onSave,
  categoryToEdit,
}: AddCategoryModalProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#0F6E6A');
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const isEditing = !!categoryToEdit;

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setSelectedColor(categoryToEdit.color || '#0F6E6A');
      setSelectedIcon(normalizeCategoryIcon(categoryToEdit.icon));
    } else {
      setName('');
      setSelectedColor('#0F6E6A');
      setSelectedIcon('folder');
    }
  }, [categoryToEdit, visible]);

  const handleSave = () => {
    if (name.trim() === '') return;
    onSave({
      name: name.trim(),
      color: selectedColor,
      icon: selectedIcon,
    });
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={[styles.centeredView, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.modalView,
            {
              backgroundColor: colors.card,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              padding: spacing.xl,
            },
          ]}
        >
          <View style={[styles.header, { marginBottom: spacing.lg }]}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.iconButton}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[typography.heading, { color: colors.text }]}>
              {isEditing ? 'Editar categoria' : 'Nova categoria'}
            </Text>
            <TouchableOpacity
              onPress={handleSave}
              style={styles.iconButton}
              disabled={name.trim() === ''}
              accessibilityRole="button"
              accessibilityLabel="Salvar categoria"
            >
              <Check
                size={24}
                color={name.trim() === '' ? colors.textSecondary : colors.primary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <InputField
              label="Nome"
              placeholder="Nome da categoria"
              value={name}
              onChangeText={setName}
              maxLength={30}
              required
            />

            <Text
              style={[
                typography.overline,
                { color: colors.textSecondary, marginBottom: spacing.sm },
              ]}
            >
              Cor
            </Text>
            <View style={[styles.grid, { marginBottom: spacing.lg, gap: spacing.sm }]}>
              {CATEGORY_COLOR_OPTIONS.map((color) => {
                const selected = selectedColor === color;
                return (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      {
                        backgroundColor: color,
                        borderRadius: radius.full,
                        borderWidth: selected ? 2 : 0,
                        borderColor: colors.text,
                      },
                    ]}
                    onPress={() => setSelectedColor(color)}
                    accessibilityRole="button"
                    accessibilityLabel={`Cor ${color}`}
                    accessibilityState={{ selected }}
                  >
                    {selected ? <Check size={18} color="#FFFFFF" /> : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text
              style={[
                typography.overline,
                { color: colors.textSecondary, marginBottom: spacing.sm },
              ]}
            >
              Ícone
            </Text>
            <View style={[styles.grid, { marginBottom: spacing.lg, gap: spacing.sm }]}>
              {CATEGORY_ICON_IDS.map((icon) => {
                const selected = selectedIcon === icon;
                return (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      {
                        backgroundColor: selected ? selectedColor : colors.background,
                        borderColor: selected ? selectedColor : colors.border,
                        borderRadius: radius.md,
                      },
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                    accessibilityRole="button"
                    accessibilityLabel={`Ícone ${icon}`}
                    accessibilityState={{ selected }}
                  >
                    <CategoryIcon
                      name={icon}
                      color={selected ? '#FFFFFF' : selectedColor}
                      size={20}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button
              title={isEditing ? 'Salvar alterações' : 'Criar categoria'}
              onPress={handleSave}
              disabled={name.trim() === ''}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalView: {
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOption: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});
