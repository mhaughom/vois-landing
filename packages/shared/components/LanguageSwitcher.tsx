import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const dropdownVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

const staggerItems = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const itemVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.12 } },
};

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'no', label: 'Norsk', flag: '🇳🇴' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'da', label: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', label: 'Suomi', flag: '🇫🇮' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
];

export const LanguageSwitcher: React.FC<{ className?: string; navPill?: boolean }> = ({ className, navPill }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const leaveTimeout = useRef<number | null>(null);

  const current = LANGUAGES.find(l => l.code === i18n.language?.slice(0, 2)) ?? LANGUAGES[0];

  const handleMouseEnter = useCallback(() => {
    if (leaveTimeout.current) {
      clearTimeout(leaveTimeout.current);
      leaveTimeout.current = null;
    }
    setOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    leaveTimeout.current = window.setTimeout(() => {
      setOpen(false);
    }, 200);
  }, []);

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div
      className={`relative ${className ?? ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={navPill
          ? 'flex items-center justify-center bg-white/80 backdrop-blur-md rounded-full border border-slate-100 shadow-lg text-slate-500 hover:text-slate-900 transition-colors cursor-default pl-1.5 pr-1.5 py-1'
          : 'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-default'
        }
        aria-label="Change language"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-slate-50/80 transition-colors">
          <Globe size={16} />
        </div>
        {!navPill && <span>{current.code.toUpperCase()}</span>}
      </div>

      <AnimatePresence>
        {open && (
          <div
            className="absolute right-0 top-full pt-3 z-50"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white backdrop-blur-2xl rounded-2xl border border-slate-200/80 overflow-hidden pointer-events-auto"
              style={{
                width: '200px',
                boxShadow: '0 20px 60px -15px rgba(0,0,0,0.15), 0 8px 20px -8px rgba(0,0,0,0.08)',
              }}
            >
              <div className="h-[2px] bg-gradient-to-r from-blue-400/0 via-blue-400/60 to-blue-400/0" />
              <motion.div
                variants={staggerItems}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-y-0.5 p-2 max-h-72 overflow-y-auto"
              >
                {LANGUAGES.map(lang => (
                  <motion.button
                    key={lang.code}
                    variants={itemVariant}
                    onClick={() => handleSelect(lang.code)}
                    className={`group flex items-center gap-2.5 rounded-xl transition-all duration-150 px-3 py-2 w-full text-left ${
                      lang.code === current.code
                        ? 'bg-slate-50/80 text-slate-900'
                        : 'text-slate-600 hover:bg-slate-50/80 hover:text-slate-900'
                    }`}
                  >
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className={`text-[13px] ${lang.code === current.code ? 'font-medium' : ''}`}>
                      {lang.label}
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
