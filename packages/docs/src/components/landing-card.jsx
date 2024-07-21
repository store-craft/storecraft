
/**
 * 
 * @typedef {object} CardParams
 * @prop {string} header
 * @prop {React.ReactNode | undefined} content
 * 
 * @param {CardParams & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>} params 
 */
export const Card = (
  {
    header, content,  ...rest
  }
) => {

  return (
<div {...rest}>
  <div className='rounded-xl w-full h-full dark:bg-gray-800/50 
                bg-gray-100/50 border border-pink-700/10 relative overflow-clip
                
                '
      sstyle={{'box-shadow': '0 0 5px #999'}}>
    <div className='w-1 h-[200px] -top-1/2 right-0 -rotate-45 -translate-x-10 translate-y-12  origin-center bg-pink-500/80 absolute  shadow-[0px_0px_20px] shadow-pink-500/50 dark:shadow-pink-500/90' />                  
    <div className='w-1 h-[200px] -top-1/2 right-0 -rotate-45 -translate-x-10 translate-y-10  origin-center bg-kf-600/80 absolute shadow-[0px_0px_20px] shadow-kf-500/50 dark:shadow-kf-500/90' />                  
    {/* <div className='w-1 h-[200px] -top-1/2 right-0 -rotate-45 -translate-x-10 translate-y-11  origin-center bg-teal-600 absolute shadow-lg shadow-yellow-400' />                   */}
    <div className='p-5'>
      <div children={header} 
          className='text-lg font-bold text-gray-800 dark:text-gray-300' />
      <div children={content} 
          className='text-base font-normal text-gray-800/50 dark:text-gray-300/50 pt-3' />
    </div>                  
  </div>

</div>    
  )
}