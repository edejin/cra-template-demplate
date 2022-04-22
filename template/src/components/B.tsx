import React from 'react';
import {T} from '@/components/Translate';
import {useTestStore} from '@/store/test';
import {Button} from 'antd';
import shallow from 'zustand/shallow';

export const B = () => {
  const [b, addB, clearB] = useTestStore((store) => {
    const {b, addB, clearB} = store;
    return [b, addB, clearB];
  }, shallow);
  return (
    <div>
      <p><T z="{value, plural, one {{value} item} other {{value} items}}" values={{value: b}}/></p>
      <Button onClick={addB}>+</Button>
      <Button onClick={clearB}>0</Button>
    </div>
  );
};