import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun, Trash2, Share2, Bookmark, Info, ExternalLink, Languages } from 'lucide-react-native';
import { useLinkStore } from '@/store/linkStore';
import { useCategoryStore } from '@/store/categoryStore'; // Import useCategoryStore
import { useRouter } from 'expo-router';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '@/components/ui/LanguageSelector';

export default function SettingsScreen() {
  const { theme, toggleTheme, colors } = useTheme();
  const { t } = useTranslation();
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
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.appearance')}</Text>
        <SettingItem
          icon={theme === 'dark' ? <Moon size={22} color={colors.primary} /> : <Sun size={22} color={colors.primary} />}
          title={t('settings.darkMode')}
          description={t('settings.darkModeDescription', { theme: theme === 'dark' ? 'light' : 'dark' })}
          action={toggleTheme}
          isSwitch={true}
          value={theme === 'dark'}
        />
        <SettingItem
          icon={<Languages size={22} color={colors.primary} />}
          title={t('settings.language')}
          description={t('settings.languageDescription')}
          action={() => {}}
          isSwitch={false}
          value={null}
        />
        <LanguageSelector />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.dataManagement')}</Text>
        <SettingItem
          icon={<Trash2 size={22} color={colors.error} />}
          title={t('settings.clearData')}
          description={t('settings.clearDataDescription')}
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
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{t('settings.about')}</Text>
        <SettingItem
          icon={<Info size={22} color={colors.primary} />}
          title={t('settings.aboutSavvy')}
          description={t('settings.version')}
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
        title={t('settings.clearData')}
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