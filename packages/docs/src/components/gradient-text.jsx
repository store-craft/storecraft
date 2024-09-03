/**
 * 
 * @param {React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>} params
 * @returns 
 */
export const GradientText = (
  {
    className='', ...rest
  }
) => {
  return (
<span 
    {...rest} 
    className={className + ' bg-gradient-to-br from-gray-800 dark:from-white dark:to-kf-600/30 text-transparent bg-clip-text w-fit p-0.5'}
    />
  )
}
