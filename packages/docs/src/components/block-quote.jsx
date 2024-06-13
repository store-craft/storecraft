
/**
 * @param {React.DetailedHTMLProps<React.BlockquoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>} params
 */
const BlockQuote = (
  { 
    children, ...rest 
  }
) => {

  return(
<blockquote 
    className='flex flex-row items-center bg-gray-200 
                p-2 border-l-8 
              border-pink-500
              dark:border-pink-500/50
              dark:bg-gray-200/10
               overflow-x-auto' 
    children={children}
    {...rest}/>
  )
}

export default BlockQuote