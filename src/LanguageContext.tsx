import React, { createContext, useContext, useState, useEffect } from 'react';

type Lang = 'KR' | 'EN' | 'JP';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('bananacut_lang') as Lang) || 'KR';
  });

  useEffect(() => {
    localStorage.setItem('bananacut_lang', lang);
    const langMap = { KR: 'ko', EN: 'en', JP: 'ja' };
    document.documentElement.lang = langMap[lang] || 'en';
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
