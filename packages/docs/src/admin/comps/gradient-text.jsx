/**
 * 
 * @param {React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>} params
 * @returns 
 */
export const GradientText = (
  {
    className='bg-gradient-to-r from-kf-600 to-pink-400', ...rest
  }
) => {
  return (
<span 
    {...rest} 
    className={className + ' text-transparent bg-clip-text w-fit p-0.5'}
    />
  )
}