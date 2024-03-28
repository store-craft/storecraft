
export const LabelCapsule = ({ value, className='', label=value,
                               bgColor='bg-pink-400', ...rest }) => {
  const bg_color = (typeof bgColor === 'function') ? 
                    bgColor(value): bgColor
  const lbl = (typeof label === 'function') ? label(value) : 
              (typeof label==='string' ? label :
              (typeof value==='string' ? value : 'missing')) 

  return (
<div className={`font-medium cursor-pointer text-white w-fit 
               p-1 px-2 rounded-full whitespace-nowrap 
               hover:scale-105 transition-transform inline-block
               ${className} ${bg_color}`} 
               children={lbl} {...rest} />
  )
}
