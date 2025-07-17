import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en/translation.json';
import pt from '../locales/pt/translation.json';
import { getLocales } from 'expo-localization';

const deviceLanguage = getLocales()[0].languageCode;

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: deviceLanguage,
  fallbackLng: 'en',
  resources: {
    en: {
      translation: en,
    },
    pt: {
      translation: pt,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
