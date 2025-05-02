
export type CardParams = {
  header: string;
  classNameRibbon?: string;
  main_content: React.ReactNode | undefined;
  footer: React.ReactNode | undefined;
} & React.ComponentProps<'div'>;


export const Card = (
  {
    header, main_content, footer, classNameRibbon, ...rest
  } : CardParams
) => {

  return (
<div {...rest}>
  <div 
    className='rounded-xl w-full h-full dark:bg-gray-800/50 
    bg-slate-50 border 
      border-gray-400/20 dark:border-gray-400/10 
      relative overflow-clip flex flex-col justify-between p-5 gap-3 pb-2'
      >
    <div className={'absolute -top-0 left-2  ' + '--translate-x-8 --translate-y-12 '}>
      <div 
        className='w-1 h-[100px]  -rotate-90  origin-center absolute
          bg-pink-500/80 shadow-[0px_0px_10px] 
          shadow-pink-500/50 dark:shadow-pink-500/90' />                  
      <div 
        className='w-[3px] h-[300px]  --rotate-45  origin-center absolute
          bg-kf-500/80 shadow-[0px_0px_0px] dark:shadow-[0px_0px_20px] 
          shadow-kf-500/50 dark:shadow-kf-500/90' />                  
    </div>        
    <div className=''>
      <div children={header} 
          className='text-lg font-bold text-gray-800 dark:text-gray-300' />
      <div children={main_content} 
          className='text-base font-normal text-gray-800/50 dark:text-gray-300/50 pt-3' />
    </div>                  
    <div children={footer} 
          className='w-full' />
  </div>

</div>    
  )
}