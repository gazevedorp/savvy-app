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
  const { colors, spacing, radius, typography } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={[typography.caption, { color: colors.text, marginBottom: spacing.xxs + 2 }]}>
        {label}
        {required && <Text style={{ color: colors.error }}> *</Text>}
      </Text>

      <View>
        <TextInput
          style={[
            styles.input,
            typography.label,
            {
              backgroundColor: colors.card,
              borderColor: error ? colors.error : colors.border,
              color: colors.text,
              borderRadius: radius.md,
              padding: spacing.sm,
              fontFamily: 'Inter-Regular',
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
            style={[styles.eyeButton, { right: spacing.sm, top: spacing.sm }]}
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
        <Text style={[typography.caption, { color: colors.error, marginTop: spacing.xxs }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeButton: {
    position: 'absolute',
    padding: 4,
  },
});
