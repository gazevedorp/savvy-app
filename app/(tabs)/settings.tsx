import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun, Trash2, Share2, Bookmark, Info, ExternalLink } from 'lucide-react-native';
import { useLinkStore } from '@/store/linkStore';
import { useCategoryStore } from '@/store/categoryStore'; // Import useCategoryStore
import { useRouter } from 'expo-router';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { useState } from 'react';

export default function SettingsScreen() {
  const { theme, toggleTheme, colors } = useTheme();
  const { clearAllLinks } = useLinkStore();
  const { clearAllCategories } = useCategoryStore(); // Get clearAllCategories
  const [showClearModal, setShowClearModal] = useState(false);
  const router = useRouter();

  const handleClearData = () => {
    clearAllLinks();
    clearAllCategories(); // Add this line to clear categories
    setShowClearModal(false);
  };

  interface SettingItemProps {
    icon: React.ReactNode;
    title: string;
    description?: string; // Optional description
    action: () => void;
    isSwitch: boolean;
    value: boolean | null; // Can be boolean for switch or null for others
  }

  const SettingItem: React.FC<SettingItemProps> = ({ icon, title, description, action, isSwitch, value }) => (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={isSwitch ? null : action}
      disabled={isSwitch}
    >
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
        {description && (
          <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      {isSwitch ? (
        <Switch
          value={value}
          onValueChange={action}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      ) : null}
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Appearance</Text>
        <SettingItem
          icon={theme === 'dark' ? <Moon size={22} color={colors.primary} /> : <Sun size={22} color={colors.primary} />}
          title="Dark Mode"
          description={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          action={toggleTheme}
          isSwitch={true}
          value={theme === 'dark'}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Data Management</Text>
        <SettingItem
          icon={<Trash2 size={22} color={colors.error} />}
          title="Clear All Data"
          description="Delete all saved links and categories"
          action={() => setShowClearModal(true)}
          isSwitch={false}
          value={null}
        />
        {/* <SettingItem
          icon={<Share2 size={22} color={colors.primary} />}
          title="Export Data"
          description="Export your links and categories"
          action={() => {}}
          isSwitch={false}
          value={null}
        /> */}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>
        <SettingItem
          icon={<Info size={22} color={colors.primary} />}
          title="About Savvy"
          description="Version 1.0.0"
          action={() => {}}
          isSwitch={false}
          value={null}
        />
      </View>

      <Text style={[styles.footerText, { color: colors.textSecondary }]}>
        Savvy © 2025
      </Text>

      <ConfirmationModal
        visible={showClearModal}
        title="Clear All Data"
        message="This will permanently delete all your saved links and categories. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleClearData}
        onCancel={() => setShowClearModal(false)}
        confirmButtonColor={colors.error}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginBottom: 2,
  },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 48,
  },
});