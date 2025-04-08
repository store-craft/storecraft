import { useCallback } from 'react'

export type CapsuleParams = {
  label: string;
  selected: boolean;
} & React.ComponentProps<'div'>;

export type TimeFrameParams = {
    span: number;
    onChange: (span: number) => void;
};

const Capsule = (
  {
    label, selected, ...rest
  }: CapsuleParams
) => {

  const bg = selected ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-300/10';
  const text = selected ? 'text-white' : 'text-gray-500 dark:text-gray-400';
  
  return (
    <div 
      className={`py-1 px-2 rounded-xl --shelf-border-color border dark:border-white/10 border-black/10
                  cursor-pointer ${bg} ${text} `}
      children={label} {...rest} 
    />
  )
}


const TimeFrame = (
  { 
    span, onChange 
  }: TimeFrameParams
) => {

  const onClick = useCallback(
    /**
     * @param {number} v the span 
     */
    (v) => {
      onChange && onChange(v)
    }, [onChange]
  );

  return (
<div className='flex flex-row gap-2'>
  {
    [90, 30, 7, 1].map(
      (s) => (
        <Capsule 
            key={s} 
            label={`Last ${s} days`} 
            selected={span==s} 
            onClick={() => onClick(s)} />
      )
    )
  }
</div>    
  )
}

export default TimeFrame
