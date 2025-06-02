import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import { Link } from "@/types";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { Check, ExternalLink, Clock } from "lucide-react-native";
import { formatRelativeTime } from "@/utils/dateUtils";
import Animated, { FadeIn } from "react-native-reanimated";
import { useLinkStore } from "@/store/linkStore";

interface LinkCardProps {
  link: Link;
}

export default function LinkCard({ link }: LinkCardProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { updateLink } = useLinkStore();

  const handlePress = () => {
    router.push(`/link/${link.id}`);
  };

  const handleToggleRead = (e: Event) => {
    e.stopPropagation();
    updateLink(link.id, { isRead: !link.isRead });
  };

  const getTypeLabel = () => {
    return link.type.charAt(0).toUpperCase() + link.type.slice(1);
  };

  const getTypeColor = () => {
    switch (link.type) {
      case "link":
        return colors.primary;
      case "video":
        return "#FF2D55";
      case "image":
        return "#34C759"; // Green
      case "music":
        return "#5856D6"; // Purple
      case "text":
        return "#FF9500"; // Orange
      default:
        return colors.secondary;
    }
  };

  const handleOpenLink = async () => {
    if (link?.url) {
      await Linking.openURL(link.url);
    }
  };

  const isLocalImage = link.type === "image" && link.url.startsWith("file://");

  return (
    <Animated.View entering={FadeIn.duration(300).delay(100)}>
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: link.isRead ? 0.8 : 1,
          },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.contentContainer}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.text,
                  textDecorationLine: link.isRead ? "line-through" : "none",
                },
              ]}
              numberOfLines={2}
            >
              {link.title}
            </Text>
          </View>

          <Text
            style={[styles.url, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {isLocalImage ? "Image from device" : link.url}
          </Text>

          <View style={styles.footer}>
            <View
              style={[
                styles.typeTag,
                { backgroundColor: getTypeColor() + "20" },
              ]}
            >
              <Text style={[styles.typeText, { color: getTypeColor() }]}>
                {getTypeLabel()}
              </Text>
            </View>

            <Text style={[styles.time, { color: colors.textSecondary }]}>
              {formatRelativeTime(link.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleToggleRead}
          >
            {link.isRead ? (
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    borderWidth: 1,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontFamily: "Inter-Bold",
    fontSize: 16,
    marginBottom: 4,
    flex: 1,
  },
  url: {
    fontFamily: "Inter-Regular",
    fontSize: 13,
    marginBottom: 8,
  },
  description: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
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
    fontSize: 12,
  },
  time: {
    fontFamily: "Inter-Regular",
    fontSize: 12,
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
