"use client";

import React, { createContext, useState } from "react";
import { Language, type LanguageType } from "@/types/language";

type LanguageContextValue = {
  language: LanguageType;
  setLanguage: (language: LanguageType) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  language: Language.jpJP,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setLanguage: () => {},
});

export function LanguageProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [language, setLanguage] = useState<LanguageType>(Language.jpJP);
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return React.useContext(LanguageContext);
}
