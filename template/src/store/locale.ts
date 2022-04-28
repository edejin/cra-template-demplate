import create from 'zustand';
import {persist} from 'zustand/middleware';

export enum Locale {
  EN = 'en',
  AR = 'ar'
}

const defaultLocale = Locale.EN;

export const RTLLocales = [Locale.AR];

interface Store {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create(persist<Store>((set) => ({
  locale: defaultLocale,
  setLocale: (locale: Locale) => set(() => ({locale}))
}), {
  name: 'locale'
}));
