import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en/translation.json';
import de from './locales/de/translation.json';
import tr from './locales/tr/translation.json';


i18n
  .use(LanguageDetector)
  .use(initReactI18next) 
  .init({
    resources: {
      en: { translation: en },
      de: { translation: de },
      tr: { translation: tr }
    },
    lng: 'de',
    fallbackLng: 'de',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;
