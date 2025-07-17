import { Tabs } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Bookmark, Grid3X3, Search, Settings } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import '@/services/i18n';

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 88 : 60 + insets.bottom,
          paddingBottom: Platform.OS === 'ios' ? 28 : insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          fontFamily: 'Inter-Bold',
          color: colors.text,
        },
        headerSafeAreaInsets: { top: insets.top },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "SAVVY READ LATER",
          tabBarLabel: t('tabs.links'),
          tabBarIcon: ({ color, size }) => (
            <Bookmark size={size} color={color} />
          ),
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: t('tabs.categories'),
          tabBarLabel: t('tabs.categories'),
          tabBarIcon: ({ color, size }) => (
            <Grid3X3 size={size} color={color} />
          ),
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('tabs.search'),
          tabBarLabel: t('tabs.search'),
          tabBarIcon: ({ color, size }) => (
            <Search size={size} color={color} />
          ),
          headerShown: true,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarLabel: t('tabs.settings'),
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
          headerShown: true,
        }}
      />
    </Tabs>
  );
}