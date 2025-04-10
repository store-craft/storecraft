import AirDatepicker, { type AirDatepickerOptions } from 'air-datepicker'
import 'air-datepicker/air-datepicker.css'
import './air-date-picker-dark.css'
import { useEffect, useRef, useState } from 'react'

export const AirDatePicker = (
  {
    air_datepicker,
    ...rest
  } : {
    air_datepicker?: {
      options?: AirDatepickerOptions;
    }
  } & React.ComponentProps<'div'>
) => {

  const [mounted, setMounted] = useState(false);
  const ref_datepicker = useRef<HTMLInputElement>(undefined);
  useEffect(
    () => {
      const el = ref_datepicker.current;
      if(!el) return;

      const dp = new AirDatepicker(
        el, air_datepicker.options
      );

      setMounted(true);

      return () => {
        dp.destroy();
        setMounted(false);
      }
    }, []
  );

  return (
    <div {...rest}>
      <input className='dark' type='text' ref={ref_datepicker} />
    </div>
  )
}