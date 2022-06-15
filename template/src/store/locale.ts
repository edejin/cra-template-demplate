import {applyMiddleware, logMiddleware, StoreInterface} from '@/utils/zustand';
import {syncMiddlewareCreator} from '@/utils/syncMiddleware';

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

const store: StoreInterface<Store> = (set) => ({
  locale: defaultLocale,
  setLocale: (locale: Locale) => set(() => ({locale}))
});

export const useLocaleStore = applyMiddleware<Store>(store, [
  syncMiddlewareCreator({
    name: 'locale',
    syncDynamically: true
  }),
  logMiddleware
]);
