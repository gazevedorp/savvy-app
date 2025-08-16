import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Edit3, Trash2, X } from 'lucide-react-native';

interface CategoryActionsModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  categoryName: string | undefined;
}

export default function CategoryActionsModal({
  visible,
  onClose,
  onEdit,
  onDelete,
  categoryName,
}: CategoryActionsModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPressOut={onClose} // Close when pressing outside
      >
        <TouchableOpacity 
          activeOpacity={1} 
          style={[styles.modalView, { backgroundColor: colors.card }]}
          onPress={(e) => e.stopPropagation()} // Prevent closing when pressing inside modal content
        >
          <View style={styles.header}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Ações para {categoryName || 'Categoria'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.optionButton, { borderBottomColor: colors.border }]}
            onPress={() => {
              onEdit();
              // onClose(); // Modal will be closed by the parent screen after initiating edit
            }}
          >
            <Edit3 size={20} color={colors.primary} style={styles.optionIcon} />
            <Text style={[styles.optionText, { color: colors.text }]}>Editar Categoria</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              onDelete();
              // onClose(); // Modal will be closed by the parent screen after initiating delete
            }}
          >
            <Trash2 size={20} color={colors.error} style={styles.optionIcon} />
            <Text style={[styles.optionText, { color: colors.error }]}>Excluir Categoria</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end', // Position modal at the bottom
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    margin: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Safe area for bottom
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  closeButton: {
    padding: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});