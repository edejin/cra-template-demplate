import React, {useCallback, useEffect} from 'react';
import {IntlProvider} from 'react-intl';
import {log} from '@/utils';
import {ConfigProvider} from 'antd';
import {StyleSheetManager} from 'styled-components';
import rtlcss from 'stylis-rtlcss';
import enGB from 'antd/lib/locale/en_GB';
import arEG from 'antd/lib/locale/ar_EG';
import {Locale, useLocaleStore} from '@/store/locale';
import {GlobalStyle} from './GlobalStyles';

const getAntLocale = (v: Locale) => {
  switch (v) {
    case Locale.AR:
      return arEG;
    default:
    case Locale.EN:
      return enGB;
  }
};

const direction = (locale: Locale) => [Locale.AR].includes(locale) ? 'rtl' : 'ltr';

export const TranslateProvider: React.FC = ({children}: React.PropsWithChildren<{}>) => {
  const {
    locale,
    messages
  } = useLocaleStore();

  const errorHandler = useCallback((data) => {
    const {code, descriptor: {id}} = data;
    if (Object.keys(messages).length) {
      if (code === 'MISSING_TRANSLATION') {
        log(`Cannot find translate "${id}" in "${locale}"`);
      } else {
        log(data);
      }
    }
  }, [locale, messages]);

  useEffect(() => {
    document.documentElement.dir = direction(locale);
  }, [locale]);

  return (
    <StyleSheetManager {...(direction(locale) === 'rtl' ? {stylisPlugins: [rtlcss]} : {})}>
      <>
        <GlobalStyle/>
        <ConfigProvider locale={getAntLocale(locale)} direction={direction(locale)}>
          <IntlProvider locale={locale} messages={messages} onError={errorHandler}>
            <>
              {children}
            </>
          </IntlProvider>
        </ConfigProvider>
      </>
    </StyleSheetManager>
  );
};
