import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';
import AuthScreen from '@/components/ui/AuthScreen';

export default function ForgotPasswordScreen() {
  const { colors, spacing, typography } = useTheme();
  const { resetPassword } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email é obrigatório');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email inválido');
      return false;
    }

    setError('');
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const { error: resetError } = await resetPassword(email);

      if (resetError) {
        Alert.alert('Erro', resetError);
      } else {
        setEmailSent(true);
      }
    } catch (caught) {
      Alert.alert('Erro', 'Erro inesperado ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) {
      setError('');
    }
  };

  if (emailSent) {
    return (
      <AuthScreen
        title="Email enviado"
        subtitle={`Enviamos um link de recuperação para ${email}. Confira a caixa de entrada e o spam.`}
        logoSize="medium"
        footer={
          <TouchableOpacity
            style={[styles.resendButton, { padding: spacing.xs }]}
            onPress={() => setEmailSent(false)}
            accessibilityRole="button"
          >
            <Text style={[typography.label, { color: colors.primary }]}>Enviar novamente</Text>
          </TouchableOpacity>
        }
      >
        <Button title="Voltar ao login" onPress={() => router.push('./login' as any)} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Recuperar senha"
      subtitle="Informe seu email e enviaremos um link para redefinir a senha."
      logoSize="medium"
      onBack={() => router.back()}
      headerTitle="Recuperar senha"
      footer={
        <View style={styles.loginContainer}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>Lembrou da senha? </Text>
          <TouchableOpacity onPress={() => router.push('./login' as any)} accessibilityRole="button">
            <Text style={[typography.label, { color: colors.primary }]}>Faça login</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <InputField
        label="Email"
        value={email}
        onChangeText={handleEmailChange}
        error={error}
        placeholder="seu@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        required
      />

      <Button
        title="Enviar link de recuperação"
        onPress={handleResetPassword}
        loading={loading}
        disabled={loading}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendButton: {
    alignSelf: 'center',
  },
});
