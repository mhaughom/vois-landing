import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

const SUPPORTED_LANGS = ['en', 'no', 'sv', 'da', 'fi', 'de', 'fr', 'es', 'pt', 'it', 'nl', 'ja', 'ko', 'zh', 'hi', 'ar'];

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    defaultNS: 'common',
    supportedLngs: SUPPORTED_LANGS,
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged',
    },
    detection: {
      order: ['localStorage', 'querystring', 'navigator'],
      caches: ['localStorage'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'i18nextLng',
    },
  });

// Geo-IP language detection: runs once on first visit when no stored preference exists
if (typeof window !== 'undefined' && !localStorage.getItem('i18nextLng')) {
  fetch('/api/geo')
    .then(r => r.json())
    .then(({ lang }) => {
      if (lang && SUPPORTED_LANGS.includes(lang) && lang !== i18n.language) {
        i18n.changeLanguage(lang);
      }
    })
    .catch(() => { /* geo detection failed, keep browser default */ });
}

export default i18n;
