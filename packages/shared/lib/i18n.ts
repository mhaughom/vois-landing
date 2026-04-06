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

// Geo-IP detection: fetches location on every visit, saves to visitor profile.
// Language is only auto-set on first visit (no stored preference).
if (typeof window !== 'undefined') {
  fetch('/api/geo')
    .then(r => r.json())
    .then(({ country, region, city, latitude, longitude, lang }) => {
      // Save geo to visitor profile (every visit — location may change)
      if (country) {
        import('./visitorProfile').then(({ setVisitorGeo }) => {
          setVisitorGeo({ country, region, city, latitude, longitude });
        });
      }
      // Auto-set language only on first visit
      if (!localStorage.getItem('i18nextLng') && lang && SUPPORTED_LANGS.includes(lang) && lang !== i18n.language) {
        i18n.changeLanguage(lang);
      }
    })
    .catch(() => { /* geo detection failed */ });
}

export default i18n;
