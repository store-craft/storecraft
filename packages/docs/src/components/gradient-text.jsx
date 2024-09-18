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
    children, className='bg-gradient-to-br from-gray-800 dark:from-white dark:to-kf-600/30', ...rest
  }
) => {
  return (
<span 
    {...rest} 
    // dangerouslySetInnerHTML={{__html:children}}
    children={children}
    className={className + ' text-transparent bg-clip-text w-fit p-0.5'}
    />
  )
}
