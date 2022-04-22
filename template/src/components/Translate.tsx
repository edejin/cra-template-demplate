import React from 'react';
import {FormattedMessage} from 'react-intl';

interface Props {
  z: string;
  values?: Record<string, any>;
}

export const T: React.FC<Props> = ({z, values}: Props) => (
  <FormattedMessage id={z} values={values}/>
);