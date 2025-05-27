import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { LinkType } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { FileText, Video, Headphones, Image as ImageIcon, File, HelpCircle } from 'lucide-react-native';

interface TypeSelectorProps {
  selectedType: LinkType;
  onSelectType: (type: LinkType) => void;
}

export default function TypeSelector({ selectedType, onSelectType }: TypeSelectorProps) {
  const { colors } = useTheme();
  
  const types: { type: LinkType; label: string; icon: React.ReactNode; color: string }[] = [
    {
      type: 'article',
      label: 'Article',
      icon: <FileText size={20} color={selectedType === 'article' ? '#fff' : colors.primary} />,
      color: colors.primary,
    },
    {
      type: 'video',
      label: 'Video',
      icon: <Video size={20} color={selectedType === 'video' ? '#fff' : '#FF2D55'} />,
      color: '#FF2D55',
    },
    {
      type: 'podcast',
      label: 'Podcast',
      icon: <Headphones size={20} color={selectedType === 'podcast' ? '#fff' : '#5856D6'} />,
      color: '#5856D6',
    },
    {
      type: 'image',
      label: 'Image',
      icon: <ImageIcon size={20} color={selectedType === 'image' ? '#fff' : '#34C759'} />,
      color: '#34C759',
    },
    {
      type: 'document',
      label: 'Document',
      icon: <File size={20} color={selectedType === 'document' ? '#fff' : '#FF9500'} />,
      color: '#FF9500',
    },
    {
      type: 'other',
      label: 'Other',
      icon: <HelpCircle size={20} color={selectedType === 'other' ? '#fff' : colors.secondary} />,
      color: colors.secondary,
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
            }
          ]}
          onPress={() => onSelectType(item.type)}
        >
          <View style={styles.iconContainer}>
            {item.icon}
          </View>
          <Text 
            style={[
              styles.typeLabel,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 6,
  },
  typeLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});