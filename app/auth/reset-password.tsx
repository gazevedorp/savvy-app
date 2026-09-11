import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';
import AuthScreen from '@/components/ui/AuthScreen';

export default function ResetPasswordScreen() {
  const { colors, spacing, typography } = useTheme();
  const { session, passwordRecovery, updatePassword } = useAuth();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        Alert.alert('Erro', error);
      } else {
        Alert.alert('Senha atualizada', 'Sua nova senha já está ativa.', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') },
        ]);
      }
    } catch (caught) {
      Alert.alert('Erro', 'Erro inesperado ao atualizar a senha');
    } finally {
      setLoading(false);
    }
  };

  if (passwordRecovery && !session) {
    return (
      <AuthScreen title="Validando link" subtitle="Estamos confirmando seu pedido de recuperação." logoSize="medium">
        <View style={[styles.loadingBox, { paddingVertical: spacing.xl }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </AuthScreen>
    );
  }

  if (!passwordRecovery || !session) {
    return (
      <AuthScreen
        title="Link inválido"
        subtitle="Este link de recuperação expirou ou já foi usado. Solicite um novo email."
        logoSize="medium"
        footer={
          <View style={styles.loginContainer}>
            <TouchableOpacity onPress={() => router.replace('./login' as any)} accessibilityRole="button">
              <Text style={[typography.label, { color: colors.primary }]}>Voltar ao login</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <Button title="Pedir novo link" onPress={() => router.replace('./forgot-password' as any)} />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Nova senha"
      subtitle="Escolha uma senha com pelo menos 6 caracteres."
      logoSize="medium"
    >
      <InputField
        label="Nova senha"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
        }}
        error={errors.password}
        placeholder="Sua nova senha"
        isPassword
        required
      />

      <InputField
        label="Confirmar senha"
        value={confirmPassword}
        onChangeText={(value) => {
          setConfirmPassword(value);
          if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
        }}
        error={errors.confirmPassword}
        placeholder="Confirme a nova senha"
        isPassword
        required
      />

      <Button
        title="Salvar senha"
        onPress={handleUpdatePassword}
        loading={loading}
        disabled={loading}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    alignItems: 'center',
  },
  loadingBox: {
    alignItems: 'center',
  },
});
