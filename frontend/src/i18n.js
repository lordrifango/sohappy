import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import translationFR from './locales/fr.json';
import translationEN from './locales/en.json';

const resources = {
  fr: {
    translation: translationFR
  },
  en: {
    translation: translationEN
  }
};

i18n
  .use(LanguageDetector) // Detect language automatically
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    lng: 'fr', // Default language
    fallbackLng: 'fr', // Fallback language
    
    interpolation: {
      escapeValue: false // React already does escaping
    },
    
    detection: {
      // Options for language detection
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie']
    }
  });

export default i18n;