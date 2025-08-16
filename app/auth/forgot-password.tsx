import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft } from 'lucide-react-native';
import Logo from '@/components/ui/Logo';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
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
      const { error } = await resetPassword(email);
      
      if (error) {
        Alert.alert('Erro', error);
      } else {
        setEmailSent(true);
      }
    } catch (error) {
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Logo size="large" />
          </View>

          <View style={styles.successContainer}>
            <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
              Enviamos um link de recuperação de senha para {email}.
              Verifique sua caixa de entrada e siga as instruções.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Voltar ao login"
              onPress={() => router.push('./login' as any)}
            />
            
            <TouchableOpacity 
              style={styles.resendButton}
              onPress={() => setEmailSent(false)}
            >
              <Text style={[styles.resendText, { color: colors.primary }]}>
                Enviar novamente
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Logo size="medium" />
          </View>

          <View style={styles.formContainer}>
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

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                Lembrou da senha?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('./login' as any)}>
                <Text style={[styles.loginLink, { color: colors.primary }]}>
                  Faça login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
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
  },
  loginText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  loginLink: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  successContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  successMessage: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 32,
  },
  resendButton: {
    alignSelf: 'center',
    marginTop: 16,
    padding: 8,
  },
  resendText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});
