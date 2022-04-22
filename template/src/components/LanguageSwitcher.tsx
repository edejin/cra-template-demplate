import React from 'react';
import {Locale, useLocaleStore} from '@/store/locale';
import {T} from './Translate';
import styled from 'styled-components';

const Wrapper = styled.div`
  border-right: 3px solid red;
  /*rtl:ignore*/
  padding-left: 10px;
`;

export const LanguageSwitcher = () => {
  const {
    locale,
    setLocale
  } = useLocaleStore();

  return (
    <Wrapper onClick={() => setLocale(locale === Locale.EN ? Locale.AR : Locale.EN)}>
      <T z="Change language"/>
    </Wrapper>
  );
};