import React from 'react';
import styled from 'styled-components';
import {Switch} from 'antd';
import {ReactComponent as LightIcon} from '@/assets/icons/light.svg';
import {ReactComponent as DarkIcon} from '@/assets/icons/dark.svg';
import {Theme, useThemeStore} from '@/store/theme';
import {shallow} from 'zustand/shallow';

const Wrapper = styled.div`
  float: right;
  padding: 0 8px;
  font-size: 16px;
  cursor: pointer;
`;

export const ThemeSwitcher = () => {
  const [theme, setTheme] = useThemeStore((store) => {
    const {theme, setTheme} = store;
    return [theme, setTheme];
  }, shallow);

  const changeHandler = (dark: boolean) => {
    setTheme(dark ? Theme.Dark : Theme.Light);
  };

  return (
    <Wrapper>
      <Switch
        checkedChildren={<LightIcon/>}
        unCheckedChildren={<DarkIcon/>}
        checked={theme === Theme.Dark}
        onChange={changeHandler}
      />
    </Wrapper>
  );
};
