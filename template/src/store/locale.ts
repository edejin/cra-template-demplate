import create from 'zustand';

export enum Locale {
  EN = 'en',
  AR = 'ar'
}

const defaultLocale = Locale.EN;

interface Store {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<Store>((set, get) => ({
  locale: defaultLocale,
  setLocale: (locale: Locale) => set(state => ({locale}))
}));
