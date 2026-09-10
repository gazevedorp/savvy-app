import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinkType } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { Link as LinkIconLucide, Video, Headphones, FileText, Film } from 'lucide-react-native';

interface TypeSelectorProps {
  selectedType: LinkType;
  onSelectType: (type: LinkType) => void;
}

export default function TypeSelector({ selectedType, onSelectType }: TypeSelectorProps) {
  const { colors, spacing, radius, typography } = useTheme();

  const types: { type: LinkType; label: string; icon: React.ReactNode; color: string }[] = [
    {
      type: 'link',
      label: 'Link',
      icon: <LinkIconLucide size={20} color={selectedType === 'link' ? '#fff' : colors.primary} />,
      color: colors.primary,
    },
    {
      type: 'video',
      label: 'Vídeo',
      icon: <Video size={20} color={selectedType === 'video' ? '#fff' : '#FF2D55'} />,
      color: '#FF2D55',
    },
    // {
    //   type: 'image',
    //   label: 'Image',
    //   icon: <ImageIcon size={20} color={selectedType === 'image' ? '#fff' : '#34C759'} />,
    //   color: '#34C759',
    // },
    {
      type: 'music',
      label: 'Música',
      icon: <Headphones size={20} color={selectedType === 'music' ? '#fff' : '#5856D6'} />,
      color: '#5856D6',
    },
    {
      type: 'movie',
      label: 'Filme',
      icon: <Film size={20} color={selectedType === 'movie' ? '#fff' : '#C9A227'} />,
      color: '#C9A227',
    },
    {
      type: 'other',
      label: 'Nota',
      icon: <FileText size={20} color={selectedType === 'other' ? '#fff' : '#FF9500'} />,
      color: '#FF9500',
    },
  ];

  return (
    <View style={styles.container}>
      {types.map((item) => (
        <TouchableOpacity
          key={item.type}
          style={[
            styles.typeOption,
            {
              backgroundColor: selectedType === item.type ? item.color : colors.card,
              borderColor: item.color,
              borderRadius: radius.lg,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xxs + 2,
              marginRight: spacing.xs,
              marginBottom: spacing.xs,
            }
          ]}
          onPress={() => onSelectType(item.type)}
        >
          <View style={styles.iconContainer}>
            {item.icon}
          </View>
          <Text
            style={[
              typography.caption,
              { color: selectedType === item.type ? '#fff' : item.color }
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 6,
  },
});