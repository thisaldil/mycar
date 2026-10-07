import { forwardRef } from 'react';
import { Input } from './Input';

/** Native date input — accessible, keyboard friendly and uses the OS picker on mobile. Value format: yyyy-MM-dd. */
export const DatePicker = forwardRef(function DatePicker(props, ref) {
  return <Input ref={ref} type="date" inputClassName="pr-2" {...props} />;
});