
const BlockQuote = (
  { 
    children, ...rest 
  } : React.ComponentProps<'q'>
) => {

  return(
<blockquote 
    className='
      flex flex-row items-center bg-gray-200/20 
      p-2 border-l-8 
      rounded-md
      border 
      border-gray-400/10
    border-l-pink-500
    dark:border-l-pink-500/80
    dark:bg-gray-200/5
      overflow-x-auto' 
    children={children}
    {...rest}/>
  )
}

export default BlockQuote