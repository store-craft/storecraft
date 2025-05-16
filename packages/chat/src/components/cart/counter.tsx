import { 
  useCallback, useState, 
  useImperativeHandle, 
  forwardRef 
} from 'react'
import { FaMinus, FaPlus } from 'react-icons/fa6'


const clamp = (v: number, min: number, max: number) => 
  Math.min(max, Math.max(v, min));
         

export type CounterImperativeInterface = {
  getCount: () => number
}

export type CounterProps = {
  counter?: {
    value?: number
    minVal?: number
    maxVal?: number
    onChange?: (v: number) => void
  }
} & React.ComponentProps<'div'>;

export type CounterRef = CounterImperativeInterface &
  React.Ref<CounterImperativeInterface>

export const Counter = forwardRef((
  { 
    counter: {
      value=1, minVal=1, maxVal=1 , 
      onChange=undefined
    }, 
    ...rest 
  }: CounterProps, ref
) => {

  const [count, setCount] = useState(
    clamp(value, minVal, maxVal)
  );

  const set = useCallback(
    (delta: number) => {
      const v = Math.min(
        Math.max(count + delta, minVal), 
        maxVal ?? (count + delta + 1)
      );
      setCount(v);
      onChange?.(v);
    }, [count, onChange, minVal, maxVal]
  );

  const cb_up = useCallback(
    () => {
      set(1);
    }, [set]
  );

  const cb_down = useCallback(
    () => {
      set(-1);
    }, [set]
  );

  useImperativeHandle(
    ref, 
    () => ({
      getCount : () => count
    }), [count]
  );

  return (
    <div {...rest} >
      <div 
        className='flex flex-row justify-between 
          items-center w-fit border rounded-xl '>
        <FaMinus 
          className='w-3 h-3  mx-2 
            cursor-pointer' 
          onClick={cb_down} />
        <span 
          className='select-none text-sm' 
          children={count} />
        <FaPlus 
          className='w-3 h-3  mx-2
            cursor-pointer' 
          onClick={cb_up}/>
      </div>    
    </div>
  )
})
