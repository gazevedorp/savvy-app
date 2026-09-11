import React from 'react';
import { View, StyleSheet, Text, Switch, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Moon, Sun, Trash2, Info, LogOut, User } from 'lucide-react-native';
import { useLinkStore } from '@/store/linkStore';
import { useCategoryStore } from '@/store/categoryStore';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import { useState } from 'react';
import Screen from '@/components/ui/Screen';
import Card from '@/components/ui/Card';
import ListRow from '@/components/ui/ListRow';
import { alertError } from '@/utils/errors';

export default function SettingsScreen() {
  const { theme, toggleTheme, colors, spacing, typography } = useTheme();
  const { user, signOut } = useAuth();
  const { clearAllLinks } = useLinkStore();
  const { clearAllCategories } = useCategoryStore();
  const [showClearModal, setShowClearModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleClearData = async () => {
    try {
      await clearAllLinks();
      await clearAllCategories();
      setShowClearModal(false);
    } catch (error) {
      alertError(error, 'Não foi possível limpar os dados.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setShowLogoutModal(false);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao sair da conta');
    }
  };

  return (
    <Screen scroll padded>
      <View style={[styles.section, { marginBottom: spacing.xl }]}>
        <Text style={[typography.overline, styles.sectionTitle, { color: colors.textSecondary }]}>
          Conta
        </Text>
        <Card padded={false}>
          <ListRow
            icon={<User size={22} color={colors.primary} />}
            title={user?.full_name || 'Usuário'}
            description={user?.email}
          />
          <ListRow
            icon={<LogOut size={22} color={colors.error} />}
            title="Sair"
            description="Encerrar a sessão desta conta"
            onPress={() => setShowLogoutModal(true)}
            divider={false}
          />
        </Card>
      </View>

      <View style={[styles.section, { marginBottom: spacing.xl }]}>
        <Text style={[typography.overline, styles.sectionTitle, { color: colors.textSecondary }]}>
          Aparência
        </Text>
        <Card padded={false}>
          <ListRow
            icon={
              theme === 'dark' ? (
                <Moon size={22} color={colors.primary} />
              ) : (
                <Sun size={22} color={colors.primary} />
              )
            }
            title="Modo escuro"
            description={theme === 'dark' ? 'Mudar para o modo claro' : 'Mudar para o modo escuro'}
            trailing={
              <Switch
                value={theme === 'dark'}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            }
            divider={false}
          />
        </Card>
      </View>

      <View style={[styles.section, { marginBottom: spacing.xl }]}>
        <Text style={[typography.overline, styles.sectionTitle, { color: colors.textSecondary }]}>
          Dados
        </Text>
        <Card padded={false}>
          <ListRow
            icon={<Trash2 size={22} color={colors.error} />}
            title="Limpar todos os dados"
            description="Apagar todos os itens e categorias salvos"
            onPress={() => setShowClearModal(true)}
            divider={false}
          />
        </Card>
      </View>

      <View style={[styles.section, { marginBottom: spacing.xl }]}>
        <Text style={[typography.overline, styles.sectionTitle, { color: colors.textSecondary }]}>
          Sobre
        </Text>
        <Card padded={false}>
          <ListRow
            icon={<Info size={22} color={colors.primary} />}
            title="Sobre o Savvy"
            description="Versão 1.0.0"
            divider={false}
          />
        </Card>
      </View>

      <Text style={[typography.micro, styles.footerText, { color: colors.textSecondary }]}>
        Innovai Hub © 2025
      </Text>

      <ConfirmationModal
        visible={showClearModal}
        title="Limpar todos os dados"
        message="Isso vai apagar permanentemente todos os seus itens e categorias salvos. Esta ação não pode ser desfeita."
        confirmText="Apagar"
        cancelText="Cancelar"
        onConfirm={handleClearData}
        onCancel={() => setShowClearModal(false)}
        confirmButtonColor={colors.error}
      />

      <ConfirmationModal
        visible={showLogoutModal}
        title="Sair da conta"
        message="Tem certeza de que deseja sair da sua conta?"
        confirmText="Sair"
        cancelText="Cancelar"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        confirmButtonColor={colors.error}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {},
  sectionTitle: {
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  footerText: {
    textAlign: 'center',
  },
});
