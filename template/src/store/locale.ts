import {applyMiddleWares, logMiddleware, persistMiddlewareCreator, StoreInterface} from '@/utils/zustand';

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

export const useLocaleStore = applyMiddleWares<Store>(store, [
  persistMiddlewareCreator({
    name: 'locale'
  }),
  logMiddleware
]);
