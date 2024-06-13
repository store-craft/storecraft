

/**
 * Background container with gradient
 * 
 * @typedef {{
 *  className?: string, rounded?: string, 
 *  children?: any, stroke?: string, from?: string, 
 *  to?: string
 * }} InternalBlingParams
 * 
 * @typedef {InternalBlingParams & 
 * React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } BlingParams
 * @param {BlingParams} p 
 * 
 */
export const Bling = ( 
  { 
    className, rounded='rounded-md', 
    children, stroke='border', 
    from='from-pink-500 dark:from-pink-500', 
    to='to-kf-500 dark:to-kf-500', ...rest 
  }
) => {

  return (
<div 
    className={`bg-gradient-to-r 
    ${from} ${to} ${stroke} 
    ${rounded} ${className}`} 
    {...rest}
    style={
      {
        'background-clip': 'border-box',
        'border-color': 'transparent',
        'background-origin': 'border-box'
      }
    }
    children={children}/>
  )

}
