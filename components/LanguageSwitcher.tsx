import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'no', label: 'Norsk' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'sv', label: 'Svenska' },
  { code: 'da', label: 'Dansk' },
  { code: 'fi', label: 'Suomi' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
  { code: 'ar', label: 'العربية' },
  { code: 'hi', label: 'हिन्दी' },
];

export const LanguageSwitcher: React.FC<{ className?: string; navPill?: boolean }> = ({ className, navPill }) => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find(l => l.code === i18n.language?.slice(0, 2)) ?? LANGUAGES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className ?? ''}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={navPill
          ? 'flex items-center justify-center w-10 h-10 bg-white/80 backdrop-blur-md rounded-full border border-slate-100 shadow-lg text-slate-500 hover:text-slate-900 transition-colors'
          : 'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors'
        }
        aria-label="Change language"
      >
        <Globe size={16} />
        {!navPill && <span>{current.code.toUpperCase()}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 max-h-72 overflow-y-auto">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                lang.code === current.code
                  ? 'bg-slate-50 text-slate-900 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
