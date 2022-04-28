import React from 'react';
import {Providers} from '@/components/Providers';
import 'antd/dist/antd.dark.min.css';
import {LayoutWrapper} from '@/components/LayoutWrapper';
import {Router} from '@/Router';

export const App = () => (
  <Providers>
    <LayoutWrapper>
      <Router/>
    </LayoutWrapper>
  </Providers>
);
