
/**
* Background container with gradient
*/
export type BlingParams = {
  className?: string;
  rounded?: string;
  children?: any;
  stroke?: string;
  from?: string;
  to?: string;
} & React.ComponentProps<'div'>;


/**
 * Background container with gradient
 */
export const Bling = ( 
  { 
    className, rounded='rounded-md', 
    children, stroke='border', 
    from='from-pink-500 dark:from-pink-500', 
    to='to-kf-500 dark:to-kf-500', ...rest 
  } : BlingParams
) => {

  return (
    <div 
      className={`bg-gradient-to-r 
      ${from} ${to} ${stroke} 
      ${rounded} ${className}`} 
      {...rest}
      style={
        {
          'backgroundClip': 'border-box',
          'borderColor': 'transparent',
          'backgroundOrigin': 'border-box'
        }
      }
      children={children}
    />
  )

}
