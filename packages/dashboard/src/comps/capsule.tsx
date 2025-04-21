import { withDiv } from "./types";

export type CapsuleParams = withDiv<{
  className?: string;
  bgColor?: string | ((v: string) => string);
  value: string;
  label?: string | ((v: string) => string);
}>;

export const LabelCapsule = (
  { 
    value, className='', label=value,
    bgColor='bg-pink-400', ...rest 
  }: CapsuleParams
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
