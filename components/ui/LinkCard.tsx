import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  type GestureResponderEvent,
} from "react-native";
import { Link } from "@/types";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { Check, ExternalLink, Clock } from "lucide-react-native";
import { formatRelativeTime } from "@/utils/dateUtils";
import Animated, { FadeIn } from "react-native-reanimated";
import { useLinkStore } from "@/store/linkStore";
import { getTypeColor, getTypeLabel, isMediaType } from "@/utils/media";

interface LinkCardProps {
  link: Link;
}

export default function LinkCard({ link }: LinkCardProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const router = useRouter();
  const { updateLink } = useLinkStore();

  const handlePress = () => {
    router.push(`/link/${link.id}`);
  };

  const handleToggleRead = (e: GestureResponderEvent) => {
    e.stopPropagation();
    if (!link.id) return;
    updateLink(link.id, { is_read: !link.is_read });
  };

  const handleOpenLink = async (e: GestureResponderEvent) => {
    e.stopPropagation();
    if (link?.url) {
      await Linking.openURL(link.url);
    }
  };

  const isLocalImage = link.type === "image" && link.url.startsWith("file://");

  const typeLabel = getTypeLabel(link.type);
  const typeColor = getTypeColor(link.type, colors.primary);
  const artwork = link.metadata?.artworkUrl || link.thumbnail;
  const isMedia = isMediaType(link.type);
  const subtitle = isMedia
    ? [link.metadata?.artistName, link.metadata?.releaseYear].filter(Boolean).join(" · ")
    : isLocalImage
      ? "Imagem do dispositivo"
      : link.url;

  return (
    <Animated.View entering={FadeIn.duration(300).delay(100)}>
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing.md,
            marginBottom: spacing.md,
            opacity: link.is_read ? 0.8 : 1,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {artwork ? (
          <Image
            source={{ uri: artwork }}
            style={[styles.artwork, link.type === "movie" ? styles.poster : styles.cover]}
          />
        ) : null}

        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                typography.label,
                {
                  fontFamily: "Inter-Bold",
                  color: colors.text,
                  textDecorationLine: link.is_read ? "line-through" : "none",
                },
              ]}
              numberOfLines={2}
            >
              {link.title}
            </Text>
          </View>

          <Text
            style={[styles.url, typography.micro, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>

          <View style={styles.footer}>
            <View
              style={[
                styles.typeTag,
                { backgroundColor: typeColor + "20", borderRadius: radius.lg },
              ]}
            >
              <Text style={[styles.typeText, { color: typeColor }]}>
                {typeLabel}
              </Text>
            </View>

            <Text style={[styles.time, typography.micro, { color: colors.textSecondary }]}>
              {formatRelativeTime(link.created_at)}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleToggleRead}
          >
            {link.is_read ? (
              <Check size={20} color={colors.success} />
            ) : (
              <Clock size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>

          {!isLocalImage && link.url && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleOpenLink}
            >
              <ExternalLink size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 1,
  },
  contentContainer: {
    flex: 1,
  },
  artwork: {
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#111",
  },
  cover: {
    width: 56,
    height: 56,
  },
  poster: {
    width: 44,
    height: 64,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    marginBottom: 4,
    flex: 1,
  },
  url: {
    marginBottom: 8,
  },
  description: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontFamily: "Inter-Medium",
    fontSize: 10,
  },
  time: {
    fontFamily: "Inter-Regular",
    fontSize: 10,
  },
  actions: {
    justifyContent: "space-between",
    marginLeft: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
