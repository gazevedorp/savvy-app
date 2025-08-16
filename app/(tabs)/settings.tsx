import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Moon, Sun, Trash2, Share2, Bookmark, Info, ExternalLink, LogOut, User } from 'lucide-react-native';
import { useLinkStore } from '@/store/linkStore';
import { useCategoryStore } from '@/store/categoryStore'; // Import useCategoryStore
import { useRouter } from 'expo-router';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { useState } from 'react';

export default function SettingsScreen() {
  const { theme, toggleTheme, colors } = useTheme();
  const { user, signOut } = useAuth();
  const { clearAllLinks } = useLinkStore();
  const { clearAllCategories } = useCategoryStore(); // Get clearAllCategories
  const [showClearModal, setShowClearModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  const handleClearData = () => {
    clearAllLinks();
    clearAllCategories(); // Add this line to clear categories
    setShowClearModal(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setShowLogoutModal(false);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao fazer logout');
    }
  };

  interface SettingItemProps {
    icon: React.ReactNode;
    title: string;
    description?: string; // Optional description
    action: () => void;
    isSwitch: boolean;
    value?: boolean; // Optional boolean for switch
  }

  const SettingItem: React.FC<SettingItemProps> = ({ icon, title, description, action, isSwitch, value }) => (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={isSwitch ? undefined : action}
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
          value={value || false}
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
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Conta</Text>
        <SettingItem
          icon={<User size={22} color={colors.primary} />}
          title={user?.full_name || "Usuário"}
          description={user?.email}
          action={() => {}}
          isSwitch={false}
        />
        <SettingItem
          icon={<LogOut size={22} color={colors.error} />}
          title="Sair"
          description="Fazer logout da conta"
          action={() => setShowLogoutModal(true)}
          isSwitch={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Aparência</Text>
        <SettingItem
          icon={theme === 'dark' ? <Moon size={22} color={colors.primary} /> : <Sun size={22} color={colors.primary} />}
          title="Modo Escuro"
          description={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          action={toggleTheme}
          isSwitch={true}
          value={theme === 'dark'}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Dados</Text>
        <SettingItem
          icon={<Trash2 size={22} color={colors.error} />}
          title="Limpar Todos os Dados"
          description="Deletar todos os links e categorias salvos"
          action={() => setShowClearModal(true)}
          isSwitch={false}
        />
        {/* <SettingItem
          icon={<Share2 size={22} color={colors.primary} />}
          title="Export Data"
          description="Export your links and categories"
          action={() => {}}
          isSwitch={false}
        /> */}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Sobre</Text>
        <SettingItem
          icon={<Info size={22} color={colors.primary} />}
          title="Sobre o Savvy"
          description="Versão 1.0.0"
          action={() => {}}
          isSwitch={false}
        />
      </View>

      <Text style={[styles.footerText, { color: colors.textSecondary }]}>
        Innovai Hub © 2025
      </Text>

      <ConfirmationModal
        visible={showClearModal}
        title="Limpar Todos os Dados"
        message="Isso irá deletar permanentemente todos os seus links e categorias salvos. Esta ação não pode ser desfeita."
        confirmText="Deletar"
        cancelText="Cancelar"
        onConfirm={handleClearData}
        onCancel={() => setShowClearModal(false)}
        confirmButtonColor={colors.error}
      />

      <ConfirmationModal
        visible={showLogoutModal}
        title="Sair da Conta"
        message="Tem certeza que deseja sair da sua conta?"
        confirmText="Sair"
        cancelText="Cancelar"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
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
    fontSize: 14,
    marginBottom: 2,
  },
  settingDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
  },
  footerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    textAlign: 'center',
  },
});