import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, translations, TranslationKeys } from '../constants/translations';

interface LocalizationContextType {
  locale: Language;
  setLocale: (locale: Language) => Promise<void>;
  t: TranslationKeys;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

const STORAGE_KEY = '@app_language';

export const LocalizationProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<Language>('en');

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'id')) {
        setLocaleState(savedLanguage as Language);
      } else {
        // Use device language if available
        const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
        const defaultLocale = deviceLocale === 'id' ? 'id' : 'en';
        setLocaleState(defaultLocale);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
  };

  const setLocale = async (newLocale: Language) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newLocale);
      setLocaleState(newLocale);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const value = {
    locale,
    setLocale,
    t: translations[locale],
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return context;
};
