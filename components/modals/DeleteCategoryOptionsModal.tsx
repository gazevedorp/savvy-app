// app/components/modals/DeleteCategoryOptionsModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface DeleteCategoryOptionsModalProps {
  visible: boolean;
  categoryName: string;
  onClose: () => void;
  onDeleteCategoryOnly: () => Promise<void>; // Mark as async if operations are async
  onDeleteCategoryAndLinks: () => Promise<void>; // Mark as async
}

export default function DeleteCategoryOptionsModal({
  visible,
  categoryName,
  onClose,
  onDeleteCategoryOnly,
  onDeleteCategoryAndLinks,
}: DeleteCategoryOptionsModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Delete "{categoryName}"</Text>
          <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
            How would you like to delete this category?
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={async () => {
              await onDeleteCategoryOnly();
              onClose(); // Ensure modal closes after action
            }}
          >
            <Text style={[styles.buttonText, { color: colors.background }]}>Delete Category Only</Text>
          </TouchableOpacity>
          <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
            Links in this category will not be deleted but will no longer be associated with "{categoryName}".
          </Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.error }]}
            onPress={async () => {
              await onDeleteCategoryAndLinks();
              onClose(); // Ensure modal closes after action
            }}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Delete Category & All Its Links</Text>
          </TouchableOpacity>
           <Text style={[styles.optionDescription, { color: colors.textSecondary, marginBottom: 20 }]}>
            This will permanently delete the category and all links currently associated with it.
          </Text>


          <TouchableOpacity
            style={[styles.button, styles.buttonCancel, { borderColor: colors.border }]}
            onPress={onClose}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    margin: 20,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  buttonCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  }
});
