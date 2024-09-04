/**
 * @param {React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>} params
 */
export const CommonGradientText = (
  {
    className='', ...rest
  }
) => {
  return (
  <GradientText 
    className={className + ' bg-gradient-to-br from-gray-800 dark:from-white dark:to-kf-600/30'} 
    {...rest} />
  )
}

/**
 * @param {React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>} params
 */
export const GradientText = (
  {
    className='bg-gradient-to-br from-gray-800 dark:from-white dark:to-kf-600/30', ...rest
  }
) => {
  return (
<span 
    {...rest} 
    className={className + ' text-transparent bg-clip-text w-fit p-0.5'}
    />
  )
}
