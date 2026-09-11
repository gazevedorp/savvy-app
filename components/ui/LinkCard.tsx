import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  Image,
  Platform,
} from 'react-native';
import { Link } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import {
  Check,
  FileText,
  Film,
  Headphones,
  Image as ImageIcon,
  Link as LinkIcon,
  Video,
} from 'lucide-react-native';
import { formatRelativeTime } from '@/utils/dateUtils';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useLinkStore } from '@/store/linkStore';
import { getLinkSubtitle, getTypeColor, getTypeLabel } from '@/utils/media';
import { alertError } from '@/utils/errors';
import Chip from '@/components/ui/Chip';

interface LinkCardProps {
  link: Link;
}

function TypePlaceholder({
  type,
  color,
  size,
}: {
  type: Link['type'];
  color: string;
  size: number;
}) {
  switch (type) {
    case 'video':
      return <Video size={size} color={color} />;
    case 'image':
      return <ImageIcon size={size} color={color} />;
    case 'music':
      return <Headphones size={size} color={color} />;
    case 'movie':
      return <Film size={size} color={color} />;
    case 'other':
      return <FileText size={size} color={color} />;
    default:
      return <LinkIcon size={size} color={color} />;
  }
}

export default function LinkCard({ link }: LinkCardProps) {
  const { colors, spacing, radius, typography, elevation } = useTheme();
  const router = useRouter();
  const { updateLink } = useLinkStore();
  const [artFailed, setArtFailed] = useState(false);

  const handlePress = () => {
    router.push(`/link/${link.id}`);
  };

  const handleToggleRead = async () => {
    if (!link.id) return;
    try {
      await updateLink(link.id, { is_read: !link.is_read });
    } catch (error) {
      alertError(error, 'Não foi possível atualizar o item.');
    }
  };

  const typeLabel = getTypeLabel(link.type);
  const typeColor = getTypeColor(link.type, colors.primary);
  const artwork = link.metadata?.artworkUrl || link.thumbnail;
  const subtitle = getLinkSubtitle(link);
  const isMovie = link.type === 'movie';
  const done = !!link.is_read;

  const card = (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.sm,
            marginBottom: spacing.sm,
            opacity: done ? 0.78 : 1,
          },
          elevation.sm,
        ]}
      >
        <Pressable
          style={styles.main}
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={link.title}
        >
          {artwork && !artFailed ? (
            <Image
              source={{ uri: artwork }}
              onError={() => setArtFailed(true)}
              style={[
                styles.artwork,
                { borderRadius: radius.sm, marginRight: spacing.sm },
                isMovie ? styles.poster : styles.cover,
              ]}
            />
          ) : (
            <View
              style={[
                styles.artwork,
                styles.placeholder,
                isMovie ? styles.poster : styles.cover,
                {
                  backgroundColor: `${typeColor}22`,
                  borderRadius: radius.sm,
                  marginRight: spacing.sm,
                },
              ]}
            >
              <TypePlaceholder type={link.type} color={typeColor} size={22} />
            </View>
          )}

          <View style={styles.content}>
            <Text
              style={[typography.heading, { color: colors.text }]}
              numberOfLines={2}
            >
              {link.title}
            </Text>
            {subtitle ? (
              <Text
                style={[
                  typography.caption,
                  {
                    color: colors.textSecondary,
                    fontFamily: 'Inter-Regular',
                    marginTop: spacing.xxs,
                  },
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            ) : null}

            <View style={[styles.footer, { marginTop: spacing.xs }]}>
              <Chip label={typeLabel} variant="tag" tint={typeColor} />
              <Text
                style={[
                  typography.micro,
                  { color: colors.textSecondary, marginLeft: spacing.xs },
                ]}
              >
                {formatRelativeTime(link.created_at)}
              </Text>
            </View>
          </View>
        </Pressable>

        <Pressable
          style={[
            styles.doneButton,
            {
              backgroundColor: done ? `${colors.success}22` : colors.primaryLight,
              borderColor: done ? colors.success : colors.border,
              marginLeft: spacing.xs,
            },
          ]}
          onPress={handleToggleRead}
          accessibilityRole="button"
          accessibilityLabel={done ? 'Marcar como a fazer' : 'Marcar como feito'}
          accessibilityState={{ selected: done }}
        >
          <View
            style={[
              styles.doneIcon,
              { backgroundColor: done ? colors.success : 'transparent' },
            ]}
          >
            <Check size={14} color={done ? colors.onPrimary : colors.primary} />
          </View>
          <Text
            style={[
              typography.micro,
              {
                color: done ? colors.success : colors.primary,
                fontFamily: 'Inter-Medium',
                marginTop: 2,
              },
            ]}
          >
            Feito
          </Text>
        </Pressable>
      </View>
  );

  if (Platform.OS === 'web') {
    return card;
  }

  return (
    <Animated.View entering={FadeIn.duration(300).delay(80)}>
      {card}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  artwork: {
    backgroundColor: '#111',
  },
  cover: {
    width: 72,
    height: 72,
  },
  poster: {
    width: 54,
    height: 80,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  doneButton: {
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  doneIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
