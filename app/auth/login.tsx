import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';
import AuthScreen from '@/components/ui/AuthScreen';

export default function LoginScreen() {
  const { colors, typography } = useTheme();
  const { signIn } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await signIn(formData.email, formData.password);

      if (error) {
        Alert.alert('Erro', error);
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <AuthScreen
      title="Entrar"
      subtitle="Acesse seus links, músicas e filmes salvos."
      footer={
        <View style={styles.signupContainer}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>Não tem uma conta? </Text>
          <TouchableOpacity onPress={() => router.push('./register' as any)} accessibilityRole="button">
            <Text style={[typography.label, { color: colors.primary }]}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      }
    >
      <InputField
        label="Email"
        value={formData.email}
        onChangeText={(value) => handleInputChange('email', value)}
        error={errors.email}
        placeholder="seu@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        required
      />

      <InputField
        label="Senha"
        value={formData.password}
        onChangeText={(value) => handleInputChange('password', value)}
        error={errors.password}
        placeholder="Sua senha"
        isPassword
        required
      />

      <TouchableOpacity
        style={styles.forgotPassword}
        onPress={() => router.push('./forgot-password' as any)}
        accessibilityRole="button"
      >
        <Text style={[typography.label, { color: colors.primary }]}>Esqueceu a senha?</Text>
      </TouchableOpacity>

      <Button title="Entrar" onPress={handleLogin} loading={loading} disabled={loading} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
});
