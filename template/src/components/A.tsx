import React, {useEffect} from 'react';
import {T} from '@/components/Translate';
import {useTestStore} from '@/store/test';
import {Button} from 'antd';
import shallow from 'zustand/shallow';
import {log} from '@/utils';
import {FieldTimeOutlined} from '@ant-design/icons';

export const A = () => {
  // Incorrect way:
  // const {removeA, addA, a} = useTestStore();

  // Correct way:
  // const a = useTestStore(store => store.a);
  // const removeA = useTestStore(store => store.removeA);
  // const addA = useTestStore(store => store.addA);

  // Other correct way:
  const [a, addA, removeA, addAWithDelay] = useTestStore((store) => {
    const {a, addA, removeA, addAWithDelay} = store;
    return [a, addA, removeA, addAWithDelay];
  }, shallow);

  useEffect(() => {
    log('Rerender A!!!');
  });
  return (
    <div>
      <T z="text <span>{value}</span>." values={{span: (chunks: any) => <span>{chunks}</span>, value: a}}/>
      <Button onClick={addA}>+</Button>
      <Button onClick={removeA}>-</Button>
      <Button onClick={() => addAWithDelay(3000)}>
        <FieldTimeOutlined/>
      </Button>
    </div>
  );
};