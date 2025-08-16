import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
  required?: boolean;
}

export default function InputField({
  label,
  error,
  isPassword = false,
  required = false,
  value,
  onChangeText,
  ...props
}: InputFieldProps) {
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {label}
        {required && <Text style={[styles.required, { color: colors.error }]}> *</Text>}
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: error ? colors.error : colors.border,
              color: colors.text,
            },
            isPassword && styles.passwordInput,
          ]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor={colors.textSecondary}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginBottom: 6,
  },
  required: {
    fontFamily: 'Inter-Medium',
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  error: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginTop: 4,
  },
});
