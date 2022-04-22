import React from 'react';
import {TranslateProvider} from '@/components/TranslateProvider';
import 'antd/dist/antd.dark.min.css';
import {T} from '@/components/Translate';
import {LanguageSwitcher} from '@/components/LanguageSwitcher';
import {A} from '@/components/A';
import {B} from '@/components/B';

export const App = () => (
  <TranslateProvider>
    <h1><T z="test"/></h1>
    <A/>
    <B/>
    <LanguageSwitcher/>
  </TranslateProvider>
);
