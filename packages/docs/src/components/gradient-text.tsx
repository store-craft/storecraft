
export const CommonGradientText = (
  {
    className='', ...rest
  } : React.ComponentProps<typeof GradientText>
) => {
  return (
  <GradientText 
    className={
      className + 
      ' bg-gradient-to-br from-gray-800 to-kf-500/100 dark:from-white dark:to-kf-600/30'
    } 
    {...rest} 
  />
  )
}

export const GradientText = (
  {
    children, 
    className='bg-gradient-to-br from-gray-800 dark:from-white dark:to-kf-600/30', 
    ...rest
  } : React.ComponentProps<'span'>
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
