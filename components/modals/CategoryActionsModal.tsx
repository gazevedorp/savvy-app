import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Edit3, Trash2, X } from 'lucide-react-native';
import ListRow from '@/components/ui/ListRow';

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
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <TouchableOpacity
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.modalView,
            {
              backgroundColor: colors.card,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingBottom: spacing.xl,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            style={[
              styles.header,
              {
                paddingHorizontal: spacing.md,
                paddingTop: spacing.md,
                marginBottom: spacing.xs,
              },
            ]}
          >
            <Text style={[typography.title, { color: colors.text, flex: 1 }]} numberOfLines={1}>
              {categoryName || 'Categoria'}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
            >
              <X size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text
            style={[
              typography.caption,
              {
                color: colors.textSecondary,
                paddingHorizontal: spacing.md,
                marginBottom: spacing.sm,
              },
            ]}
          >
            Editar ou excluir esta categoria
          </Text>
          <ListRow
            icon={<Edit3 size={20} color={colors.primary} />}
            title="Editar"
            description="Nome, cor e ícone"
            onPress={onEdit}
          />
          <ListRow
            icon={<Trash2 size={20} color={colors.error} />}
            title="Excluir"
            description="Só a categoria, ou também os itens"
            onPress={onDelete}
            divider={false}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalView: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
