import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { X, Check } from 'lucide-react-native';
import { Category } from '@/types';

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { name: string; color: string; icon?: string }) => void; // Generic save handler
  categoryToEdit?: Category | null;
}

export default function AddCategoryModal({ visible, onClose, onSave, categoryToEdit }: AddCategoryModalProps) {
  const { colors } = useTheme();
  
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#0A84FF');
  const [isEditing, setIsEditing] = useState(false);
  
  const colorOptions = [
    '#0A84FF', // Blue
    '#FF2D55', // Red
    '#5856D6', // Purple
    '#34C759', // Green
    '#FF9500', // Orange
    '#FF6B6B', // Coral
    '#5AC8FA', // Light Blue
    '#AF52DE', // Magenta
  ];

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setSelectedColor(categoryToEdit.color || '#0A84FF');
      setIsEditing(true);
    } else {
      setName('');
      setSelectedColor('#0A84FF'); // Reset to default for new category
      setIsEditing(false);
    }
  }, [categoryToEdit, visible]); // Re-run when categoryToEdit changes or modal becomes visible

  const handleSave = async () => {
    if (name.trim() === '') return;
    
    onSave({ // Call the onSave prop passed from parent
      name: name.trim(),
      color: selectedColor,
      // icon: "some-icon" // If you add icon selection in the future
    });
    
    // Parent (CategoriesScreen) will handle closing and resetting its own state.
    // No need to call onClose() directly here if parent does it after save.
    // However, if onSave is async and parent doesn't close immediately,
    // you might want to keep onClose() or let parent handle it.
    // For now, assuming parent handles close via its onSave implementation.
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              {isEditing ? 'Edit Category' : 'New Category'}
            </Text>
            <TouchableOpacity 
              onPress={handleSave} 
              style={styles.saveButton}
              disabled={name.trim() === ''}
            >
              <Check size={24} color={name.trim() === '' ? colors.textSecondary : colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.inputContainer, { borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Category name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              maxLength={30}
            />
          </View>
          
          <Text style={[styles.colorLabel, { color: colors.textSecondary }]}>
            Choose a color
          </Text>
          
          <View style={styles.colorGrid}>
            {colorOptions.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColor,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {selectedColor === color && (
                  <Check size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  input: {
    height: 40,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  colorLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});