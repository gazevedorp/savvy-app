import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/ui/Logo';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';
import { AuthFormData } from '@/types';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { signUp } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.phone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Telefone deve estar no formato (11) 99999-9999';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await signUp(formData);
      
      if (error) {
        Alert.alert('Erro', error);
      } else {
        Alert.alert(
          'Sucesso',
          'Conta criada com sucesso! Verifique seu email para confirmar.',
          [{ text: 'OK', onPress: () => router.replace('./login' as any) }]
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro inesperado ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatPhone = (text: string) => {
    // Remove all non-numeric characters
    const numeric = text.replace(/\D/g, '');
    
    // Apply formatting
    if (numeric.length <= 2) {
      return `(${numeric}`;
    } else if (numeric.length <= 6) {
      return `(${numeric.slice(0, 2)}) ${numeric.slice(2)}`;
    } else if (numeric.length <= 10) {
      return `(${numeric.slice(0, 2)}) ${numeric.slice(2, 6)}-${numeric.slice(6)}`;
    } else {
      return `(${numeric.slice(0, 2)}) ${numeric.slice(2, 7)}-${numeric.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhone(text);
    handleInputChange('phone', formatted);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Logo size="large" />
          </View>

          <View style={styles.formContainer}>
            <InputField
              label="Nome completo"
              value={formData.fullName || ''}
              onChangeText={(value) => handleInputChange('fullName', value)}
              error={errors.fullName}
              placeholder="Seu nome completo"
              autoCapitalize="words"
              required
            />

            <InputField
              label="Telefone"
              value={formData.phone || ''}
              onChangeText={handlePhoneChange}
              error={errors.phone}
              placeholder="(11) 99999-9999"
              keyboardType="phone-pad"
            />

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

            <InputField
              label="Confirmar senha"
              value={formData.confirmPassword || ''}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              error={errors.confirmPassword}
              placeholder="Confirme sua senha"
              isPassword
              required
            />

            <Button
              title="Criar conta"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
            />

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                Já tem uma conta?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('./login' as any)}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>
                  Faça login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 48,
  },
  formContainer: {
    flex: 1,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  loginText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  loginLink: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});
