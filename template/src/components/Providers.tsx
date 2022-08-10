import React, { useCallback, useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { log } from '@/utils';
import { ConfigProvider } from 'antd';
import { StyleSheetManager } from 'styled-components';
import rtlcss from 'stylis-rtlcss';
import { Locale, RTLLocales, useLocaleStore } from '@/store/locale';
import { GlobalStyle } from './GlobalStyles';

import enWords from '@/assets/translates/en.json';
import enGB from 'antd/lib/locale/en_GB';

import arWords from '@/assets/translates/ar.json';
import arEG from 'antd/lib/locale/ar_EG';
import {HashRouter} from 'react-router-dom';
import { OnErrorFn } from '@formatjs/intl/src/types';
import { IntlErrorCode } from '@formatjs/intl/src/error';

const vocabulary: Record<Locale, any> = {
  [Locale.EN]: enWords,
  [Locale.AR]: arWords
};

const antVocabulary = {
  [Locale.EN]: enGB,
  [Locale.AR]: arEG
}

const direction = (locale: Locale) => RTLLocales.includes(locale) ? 'rtl' : 'ltr';

interface Props {

}

export const Providers: React.FC<Props> = ({ children }: React.PropsWithChildren<Props>) => {
  const {
    locale
  } = useLocaleStore();

  const errorHandler = useCallback<OnErrorFn>((data) => {
    const { code } = data;
    if (code === IntlErrorCode.MISSING_TRANSLATION) {
      log(`Cannot find translate "${data.descriptor?.id}" in "${locale}"`);
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
            <HashRouter>
              {children}
            </HashRouter>
          </IntlProvider>
        </ConfigProvider>
      </>
    </StyleSheetManager>
  );
};
