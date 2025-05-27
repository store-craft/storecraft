
export const PriceTag = (props: {children: number | string}) => {
  return (
    <span 
      children={props?.children} 
      className='rounded-full text-lime-600 dark:text-lime-400 font-mono \
        font-bold w-fit py-0 px-1 border chat-border-overlay \
        bg-slate-50 dark:bg-lime-900 ' />
  )
}
