import { Tabs } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { Bookmark, Grid3X3, Search, Settings } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DataLoader from '@/components/DataLoader';

export default function TabLayout() {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <DataLoader>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            height: Platform.OS === 'ios' ? 88 : 60 + insets.bottom,
            paddingBottom: Platform.OS === 'ios' ? 28 : insets.bottom,
            paddingTop: spacing.xs,
          },
          tabBarLabelStyle: {
            fontFamily: typography.caption.fontFamily,
            fontSize: typography.caption.fontSize,
          },
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontFamily: typography.heading.fontFamily,
            fontSize: typography.heading.fontSize,
            color: colors.text,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Salvos',
            tabBarLabel: 'Salvos',
            tabBarIcon: ({ color, size }) => (
              <Bookmark size={size} color={color} />
            ),
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            title: 'Categorias',
            tabBarLabel: 'Categorias',
            tabBarIcon: ({ color, size }) => (
              <Grid3X3 size={size} color={color} />
            ),
            headerShown: true,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Buscar',
            tabBarLabel: 'Buscar',
            tabBarIcon: ({ color, size }) => (
              <Search size={size} color={color} />
            ),
            headerShown: true,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Ajustes',
            tabBarLabel: 'Ajustes',
            tabBarIcon: ({ color, size }) => (
              <Settings size={size} color={color} />
            ),
            headerShown: true,
          }}
        />
      </Tabs>
    </DataLoader>
  );
}
