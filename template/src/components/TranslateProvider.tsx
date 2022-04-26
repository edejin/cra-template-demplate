import React, { useCallback, useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { log } from '@/utils';
import { ConfigProvider } from 'antd';
import { StyleSheetManager } from 'styled-components';
import rtlcss from 'stylis-rtlcss';
import { Locale, useLocaleStore } from '@/store/locale';
import { GlobalStyle } from './GlobalStyles';

import enWords from '@/assets/translates/en.json';
import enGB from 'antd/lib/locale/en_GB';

import arWords from '@/assets/translates/ar.json';
import arEG from 'antd/lib/locale/ar_EG';

const vocabulary: Record<Locale, any> = {
  [Locale.EN]: enWords,
  [Locale.AR]: arWords
};

const antVocabulary = {
  [Locale.EN]: enGB,
  [Locale.AR]: arEG
}

const direction = (locale: Locale) => [Locale.AR].includes(locale) ? 'rtl' : 'ltr';

export const TranslateProvider: React.FC = ({ children }: React.PropsWithChildren<{}>) => {
  const {
    locale
  } = useLocaleStore();

  const errorHandler = useCallback((data) => {
    const { code, descriptor: { id } } = data;
    if (code === 'MISSING_TRANSLATION') {
      log(`Cannot find translate "${id}" in "${locale}"`);
    } else {
      log(data);
    }
  }, [locale]);

  useEffect(() => {
    document.documentElement.dir = direction(locale);
  }, [locale]);

  return (
    <StyleSheetManager {...(direction(locale) === 'rtl' ? { stylisPlugins: [rtlcss] } : {})}>
      <>
        <GlobalStyle />
        <ConfigProvider locale={antVocabulary[locale]} direction={direction(locale)}>
          <IntlProvider locale={locale} messages={vocabulary[locale]} onError={errorHandler}>
            <>
              {children}
            </>
          </IntlProvider>
        </ConfigProvider>
      </>
    </StyleSheetManager>
  );
};
