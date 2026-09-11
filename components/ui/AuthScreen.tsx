import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import Screen from '@/components/ui/Screen';
import Logo from '@/components/ui/Logo';
import AppHeader from '@/components/ui/AppHeader';

interface AuthScreenProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onBack?: () => void;
  headerTitle?: string;
  logoSize?: 'small' | 'medium' | 'large';
}

export default function AuthScreen({
  title,
  subtitle,
  children,
  footer,
  onBack,
  headerTitle,
  logoSize = 'large',
}: AuthScreenProps) {
  const { colors, spacing, typography } = useTheme();

  return (
    <Screen safe>
      {onBack ? (
        <AppHeader title={headerTitle ?? title} onBack={onBack} insetTop={false} />
      ) : null}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: spacing.xl,
              paddingBottom: spacing.xxl,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.brand,
              {
                marginTop: onBack ? spacing.lg : spacing.xxxl,
                marginBottom: spacing.xl,
              },
            ]}
          >
            <Logo size={logoSize} />
          </View>

          {onBack ? null : (
            <Text
              style={[
                typography.hero,
                styles.heading,
                { color: colors.text, marginBottom: subtitle ? spacing.xs : spacing.xl },
              ]}
            >
              {title}
            </Text>
          )}

          {subtitle ? (
            <Text
              style={[
                typography.body,
                styles.subtitle,
                {
                  color: colors.textSecondary,
                  marginBottom: spacing.xl,
                  marginTop: onBack ? 0 : undefined,
                },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}

          <View style={styles.body}>{children}</View>
          {footer ? <View style={[styles.footer, { marginTop: spacing.xl }]}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  brand: {
    alignItems: 'center',
  },
  heading: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  body: {
    width: '100%',
  },
  footer: {
    width: '100%',
  },
});
