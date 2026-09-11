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
  leftIcon?: React.ReactNode;
}

export default function InputField({
  label,
  error,
  isPassword = false,
  required = false,
  leftIcon,
  value,
  onChangeText,
  multiline,
  style,
  ...props
}: InputFieldProps) {
  const { colors, spacing, radius, typography } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.xxs + 2 }]}>
        {label}
        {required ? <Text style={{ color: colors.error }}> *</Text> : null}
      </Text>

      <View>
        {leftIcon ? (
          <View style={[styles.leftIcon, { left: spacing.md }]}>{leftIcon}</View>
        ) : null}
        <TextInput
          style={[
            styles.input,
            typography.label,
            {
              backgroundColor: colors.card,
              borderColor: error ? colors.error : colors.border,
              color: colors.text,
              borderRadius: radius.md,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              paddingLeft: leftIcon ? spacing.xl + spacing.md : spacing.md,
              fontFamily: 'Inter-Regular',
              minHeight: multiline ? 96 : 48,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            isPassword && styles.passwordInput,
            style,
          ]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor={colors.textSecondary}
          multiline={multiline}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            style={[styles.eyeButton, { right: spacing.sm }]}
            onPress={() => setShowPassword(!showPassword)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text style={[typography.caption, { color: colors.error, marginTop: spacing.xxs }]}>
          {error}
        </Text>
      ) : null}
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
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    padding: 4,
  },
  leftIcon: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
});
