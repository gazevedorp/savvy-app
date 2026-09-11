import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/ui/Button';

interface DeleteCategoryOptionsModalProps {
  visible: boolean;
  categoryName: string;
  onClose: () => void;
  onDeleteCategoryOnly: () => Promise<void>;
  onDeleteCategoryAndLinks: () => Promise<void>;
}

export default function DeleteCategoryOptionsModal({
  visible,
  categoryName,
  onClose,
  onDeleteCategoryOnly,
  onDeleteCategoryAndLinks,
}: DeleteCategoryOptionsModalProps) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={[styles.centeredView, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.modalView,
            {
              backgroundColor: colors.card,
              borderRadius: radius.lg,
              padding: spacing.xl,
            },
          ]}
        >
          <Text style={[typography.heading, styles.title, { color: colors.text }]}>
            Excluir “{categoryName}”
          </Text>
          <Text
            style={[
              typography.body,
              styles.message,
              { color: colors.textSecondary, marginBottom: spacing.lg },
            ]}
          >
            Como você quer excluir esta categoria?
          </Text>

          <Button
            title="Excluir só a categoria"
            onPress={async () => {
              await onDeleteCategoryOnly();
            }}
          />
          <Text
            style={[
              typography.caption,
              {
                color: colors.textSecondary,
                fontFamily: 'Inter-Regular',
                marginTop: spacing.xs,
                marginBottom: spacing.md,
                textAlign: 'center',
              },
            ]}
          >
            Os itens desta categoria não serão apagados, mas deixam de ficar associados a “
            {categoryName}”.
          </Text>

          <Button
            title="Excluir categoria e todos os itens"
            onPress={async () => {
              await onDeleteCategoryAndLinks();
            }}
            variant="destructive"
          />
          <Text
            style={[
              typography.caption,
              {
                color: colors.error,
                fontFamily: 'Inter-Regular',
                marginTop: spacing.xs,
                marginBottom: spacing.lg,
                textAlign: 'center',
              },
            ]}
          >
            Isso apaga permanentemente a categoria e todos os itens associados a ela.
          </Text>

          <Button title="Cancelar" onPress={onClose} variant="outline" />
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
  },
  modalView: {
    width: '90%',
    maxWidth: 400,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
  },
});
