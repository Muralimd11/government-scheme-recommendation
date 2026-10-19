import React, { createContext, useContext, useState } from "react";
import { Language, translations, DYNAMIC_TERMS_TA } from "../translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  tText: (text?: string) => string;
  tTerm: (term?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Local memory cache for dynamic translations
const clientTranslationCache: Record<string, string> = {};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("preferred_lang") as Language) || "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("preferred_lang", lang);
  };

  const t = (key: keyof typeof translations.en): string => {
    return translations[language]?.[key] || translations.en[key] || (key as string);
  };

  const tTerm = (term?: string): string => {
    if (!term) return "";
    if (language === "en") return term;
    return DYNAMIC_TERMS_TA[term] || term;
  };

  const tText = (text?: string): string => {
    if (!text) return "";
    if (language === "en") return text;

    const trimmed = text.trim();
    if (DYNAMIC_TERMS_TA[trimmed]) return DYNAMIC_TERMS_TA[trimmed];
    if (clientTranslationCache[trimmed]) return clientTranslationCache[trimmed];

    // If already contains Tamil unicode characters, return directly
    if (/[\u0B80-\u0BFF]/.test(trimmed)) {
      return trimmed;
    }

    return trimmed;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tText, tTerm }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
