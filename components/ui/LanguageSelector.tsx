import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const { colors } = useTheme();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
  ];

  return (
    <View style={styles.container}>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.button,
            {
              backgroundColor: i18n.language === lang.code ? colors.primary : colors.background,
              borderColor: colors.border,
            },
          ]}
          onPress={() => i18n.changeLanguage(lang.code)}
        >
          <Text
            style={{
              color: i18n.language === lang.code ? '#FFFFFF' : colors.text,
            }}
          >
            {lang.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  button: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
});

export default LanguageSelector;
