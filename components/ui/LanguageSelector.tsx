import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import LanguageConfirmationModal from '../modals/LanguageConfirmationModal';
import * as Updates from 'expo-updates';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
  ];

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    setModalVisible(true);
  };

  const confirmLanguageChange = async () => {
    await i18n.changeLanguage(selectedLanguage);
    setModalVisible(false);
    if (!__DEV__) {
      await Updates.reloadAsync();
    }
  };

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
          onPress={() => handleLanguageChange(lang.code)}
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
      <LanguageConfirmationModal
        visible={modalVisible}
        onConfirm={confirmLanguageChange}
        onCancel={() => setModalVisible(false)}
      />
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
