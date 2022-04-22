import create from 'zustand';
import enWords from '@/assets/translates/en.json'
import arWords from '@/assets/translates/ar.json'

export enum Locale {
  EN = 'en',
  AR = 'ar'
}

const defaultLocale = Locale.EN;
const defaultMessages = enWords;

interface Store {
  locale: Locale;
  messages: Record<string, any>;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<Store>((set, get) => ({
  locale: defaultLocale,
  messages: defaultMessages,
  setLocale: (locale: Locale) => {
    let messages = {};
    switch (locale) {
      case Locale.AR:
        messages = arWords;
        break
      default:
      case Locale.EN:
        messages = enWords;
        break;
    }
    set(state => ({locale, messages}))
  }
}));
