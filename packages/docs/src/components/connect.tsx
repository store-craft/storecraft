import useDarkMode from '@/hooks/use-dark-mode'
import { BsDiscord, BsGithub, BsLinkedin } from 'react-icons/bs'
import { HiOutlineLightBulb } from 'react-icons/hi'

export const Connect = (
  {
    ...rest
  } : React.ComponentProps<'div'>
) => {

  const { darkMode, toggle } = useDarkMode();

  return (
    <div {...rest}>
      <div className='flex flex-row items-center gap-3'>
        <button 
          className='p-0 cursor-pointer' 
          onClick={toggle}>
          <HiOutlineLightBulb 
            className='text-xl -translate-y-0.5 translate-x-1' />
        </button>      
        <a href='' 
            title='Join our Discord'
            // @ts-ignore
            alt='Join our Discord'
            className='relative'
              target='_blank' rel='noopener noreferrer'>
            <BsDiscord className='text-xl --animate-pulse'/>
            <span children='soon' 
                className='rounded-md px-1 bg-gradient-to-br border 
                    border-pink-500/50 from-white to-white
                    dark:border-pink-500/50 dark:from-pink-500/50 dark:to-black 
                    w-fit h-fit scale-75 --rotate-45 origin-top-left font-semibold
                    text-xs absolute font-mono -left-1 top-full' />
        </a>
        <a href='https://github.com/store-craft/storecraft' 
          title='Fork us on Github'
          // @ts-ignore
          alt='Fork us on Github'
          target='_blank' rel='noopener noreferrer'>
          <BsGithub className='text-xl'/>
        </a>
        <a href='https://linkedin.com/company/store-craft/'
          title='Catch us at Linkedin'
          // @ts-ignore
          alt='Catch us at Linkedin'
          target='_blank' rel='noopener noreferrer'>
          <BsLinkedin className='text-base'/>
        </a>
      </div>
    </div>
  )
}