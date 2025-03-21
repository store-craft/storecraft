

/**
 * 
 * @typedef {object} InternalCapsuleParams
 * @prop {string} [className]
 * @prop {string | ((v: string) => string)} [bgColor]
 * @prop {string} value
 * @prop {string | ((v: string) => string)} [label]
 * 
 * @typedef {InternalCapsuleParams &
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } CapsuleParams
 * 
 * @param {CapsuleParams} param
 * 
 */
export const LabelCapsule = (
  { 
    value, className='', label=value,
    bgColor='bg-pink-400', ...rest 
  }
) => {

  const bg_color = (typeof bgColor === 'function') ? 
                    bgColor(value): bgColor
  const lbl = (typeof label === 'function') ? label(value) : 
              (typeof label==='string' ? label :
              (typeof value==='string' ? value : 'missing')) 

  return (
<div className={`font-medium cursor-pointer text-white w-fit 
               py-0 border shelf-border-color-blend px-2 rounded-full whitespace-nowrap 
               hover:scale-105 transition-transform inline-block
               ${className} ${bg_color}`} 
               children={lbl} {...rest} />
  )
}
