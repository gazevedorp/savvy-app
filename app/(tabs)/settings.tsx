import React, { useState } from 'react';
import { View, StyleSheet, Text, Switch, Alert } from 'react-native';
import Constants from 'expo-constants';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Moon, Sun, Trash2, Info, LogOut } from 'lucide-react-native';
import { useLinkStore } from '@/store/linkStore';
import { useCategoryStore } from '@/store/categoryStore';
import ConfirmationModal from '@/components/modals/ConfirmationModal';
import Screen from '@/components/ui/Screen';
import Card from '@/components/ui/Card';
import ListRow from '@/components/ui/ListRow';
import { alertError } from '@/utils/errors';
import { getUserInitials } from '@/utils/user';

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={{ marginBottom: spacing.xl }}>
      <Text
        style={[
          typography.overline,
          {
            color: colors.textSecondary,
            paddingHorizontal: spacing.xs,
            marginBottom: spacing.xs,
          },
        ]}
      >
        {title}
      </Text>
      <Card padded={false}>{children}</Card>
    </View>
  );
}

function IconWell({
  children,
  tone = 'primary',
}: {
  children: React.ReactNode;
  tone?: 'primary' | 'danger';
}) {
  const { colors, radius } = useTheme();

  return (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: radius.sm,
        backgroundColor: tone === 'danger' ? `${colors.error}22` : colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </View>
  );
}

function UserAvatar({ name, email }: { name?: string; email?: string }) {
  const { colors, typography, radius } = useTheme();
  const initials = getUserInitials(name, email);

  return (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={[typography.caption, { color: colors.onPrimary, fontFamily: 'Inter-Bold' }]}>
        {initials}
      </Text>
    </View>
  );
}

export default function SettingsScreen() {
  const { theme, toggleTheme, colors, typography } = useTheme();
  const { user, signOut } = useAuth();
  const { clearAllLinks } = useLinkStore();
  const { clearAllCategories } = useCategoryStore();
  const [showClearModal, setShowClearModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

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
      <SettingsSection title="Conta">
        <ListRow
          icon={<UserAvatar name={user?.full_name} email={user?.email} />}
          title={user?.full_name || 'Usuário'}
          description={user?.email}
        />
        <ListRow
          icon={
            <IconWell tone="danger">
              <LogOut size={18} color={colors.error} />
            </IconWell>
          }
          title="Sair"
          description="Encerrar a sessão desta conta"
          onPress={() => setShowLogoutModal(true)}
          divider={false}
        />
      </SettingsSection>

      <SettingsSection title="Aparência">
        <ListRow
          icon={
            <IconWell>
              {theme === 'dark' ? (
                <Moon size={18} color={colors.primary} />
              ) : (
                <Sun size={18} color={colors.primary} />
              )}
            </IconWell>
          }
          title="Modo escuro"
          description={theme === 'dark' ? 'Tema escuro ativo' : 'Tema claro ativo'}
          trailing={
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={colors.border}
              accessibilityLabel="Modo escuro"
            />
          }
          divider={false}
        />
      </SettingsSection>

      <SettingsSection title="Dados">
        <ListRow
          icon={
            <IconWell tone="danger">
              <Trash2 size={18} color={colors.error} />
            </IconWell>
          }
          title="Limpar todos os dados"
          description="Apagar todos os itens e categorias salvos"
          onPress={() => setShowClearModal(true)}
          divider={false}
        />
      </SettingsSection>

      <SettingsSection title="Sobre">
        <ListRow
          icon={
            <IconWell>
              <Info size={18} color={colors.primary} />
            </IconWell>
          }
          title="Sobre o Savvy"
          description={`Versão ${appVersion}`}
          divider={false}
        />
      </SettingsSection>

      <Text style={[typography.micro, styles.footerText, { color: colors.textSecondary }]}>
        Innovai Hub © 2026
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
  footerText: {
    textAlign: 'center',
    marginBottom: 8,
  },
});
