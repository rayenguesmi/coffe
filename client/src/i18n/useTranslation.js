import { useState, useEffect } from 'react';
import en from './en.json';
import fr from './fr.json';
import ar from './ar.json';

const locales = { en, fr, ar };

export function useTranslation() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'fr');

  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const changeLang = (newLang) => {
    localStorage.setItem('lang', newLang);
    setLang(newLang);
  };

  const t = (key) => locales[lang]?.[key] ?? locales['en']?.[key] ?? key;

  return { t, lang, changeLang };
}
