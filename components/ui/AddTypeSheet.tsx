import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { FileText, Film, Headphones, Link as LinkIcon, X } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { LinkType } from '@/types';
import { ADD_TYPE_OPTIONS } from '@/utils/home';
import ListRow from '@/components/ui/ListRow';

interface AddTypeSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: LinkType) => void;
}

function TypeIcon({ type, color }: { type: LinkType; color: string }) {
  switch (type) {
    case 'other':
      return <FileText size={22} color={color} />;
    case 'music':
      return <Headphones size={22} color={color} />;
    case 'movie':
      return <Film size={22} color={color} />;
    default:
      return <LinkIcon size={22} color={color} />;
  }
}

export default function AddTypeSheet({ visible, onClose, onSelect }: AddTypeSheetProps) {
  const { colors, spacing, radius, typography, elevation } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable
          style={[styles.backdrop, { backgroundColor: colors.overlay }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingBottom: spacing.xxl,
            },
            elevation.lg,
          ]}
        >
          <View
            style={[
              styles.handle,
              { backgroundColor: colors.border, marginTop: spacing.sm },
            ]}
          />
          <View
            style={[
              styles.header,
              {
                paddingHorizontal: spacing.md,
                paddingTop: spacing.md,
                paddingBottom: spacing.xs,
              },
            ]}
          >
            <Text style={[typography.title, { color: colors.text, flex: 1 }]}>
              Adicionar
            </Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              style={[styles.close, { marginLeft: spacing.sm }]}
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
            Escolha o tipo para abrir o fluxo de criação.
          </Text>
          {ADD_TYPE_OPTIONS.map((option, index) => (
            <ListRow
              key={option.type}
              icon={<TypeIcon type={option.type} color={colors.primary} />}
              title={option.label}
              description={option.description}
              onPress={() => onSelect(option.type)}
              divider={index < ADD_TYPE_OPTIONS.length - 1}
            />
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    width: '100%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  close: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
