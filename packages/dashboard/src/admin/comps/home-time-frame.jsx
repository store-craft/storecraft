import { useCallback } from 'react'

const data2 = () => {
  return [...Array(100).keys()].map((_, ix) => ({ year: ix, count: (Math.random()*1000) }))
}

const Capsule = ({label, selected, ...rest}) => {

  const bg = selected ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-300/10'
  const text = selected ? 'text-white' : 'text-gray-500 dark:text-gray-400'
  return (
<div className={`p-1 px-2 rounded-xl
               cursor-pointer ${bg} ${text} `}
      children={label} {...rest} />
  )
}

const TimeFrame = ({ span, onChange }) => {
  const onClick = useCallback(
    (v) => {
      onChange && onChange(v)
    }, [onChange]
  )

  return (
<div className='flex flex-row gap-2'>
  {
    [90, 30, 7, 1].map(s => (
      <Capsule key={s} label={`Last ${s} days`} 
               selected={span==s} 
               onClick={() => onClick(s)} />
    ))
  }
</div>    
  )
}

export default TimeFrame
