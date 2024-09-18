import { useCallback } from 'react'

/**
 * @typedef {object} InnerCapsuleParams
 * @prop {string} label
 * @prop {boolean} selected
 * 
 * 
 * @typedef {InnerCapsuleParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } CapsuleParams
 * 
 * 
 * @param {CapsuleParams} params
 * 
 */
const Capsule = (
  {
    label, selected, ...rest
  }
) => {

  const bg = selected ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-300/10';
  const text = selected ? 'text-white' : 'text-gray-500 dark:text-gray-400';
  
  return (
<div className={`py-1 px-2 rounded-xl --shelf-border-color border dark:border-white/10 border-black/10
               cursor-pointer ${bg} ${text} `}
      children={label} {...rest} />
  )
}


/**
 * 
 * @typedef {object} TimeFrameParams
 * @prop {number} span
 * @prop {(span: number) => void} onChange
 * 
 * 
 * @param {TimeFrameParams} params
 * 
 */
const TimeFrame = (
  { 
    span, onChange 
  }
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
