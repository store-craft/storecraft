import { GradStroke } from '@/components/grad-stroke.jsx';
import Header from '@/components/header.jsx';
import { LogoGradient } from '@/components/logo-text.jsx';
import { StorecraftText } from '@/components/logo.jsx';
import useDarkMode from '@/hooks/useDarkMode.js';
import { useRouter } from 'next/navigation.js'
import { useEffect } from 'react'

export default () => {
  const { darkMode, toggle } = useDarkMode()

  return (
    <div className={'w-screen h-screen ' + (darkMode ? 'dark' : '')}>
      <div className='w-full h-full transition-colors overflow-clip
                      bg-white dark:bg-gray-900
                      text-gray-800 dark:text-gray-300'>

        <Header 
            className='absolute inset-0 px-4
                    bg-white/10 dark:bg-transparent backdrop-blur-sm 
                      shadow-sm md:px-10 flex-shrink-0 
                      w-full z-40 ' 
            slug={'slug'} 
            prefix={'header_prefix'}
            onMenuClick={'toggleMenu'} 
            github_link={'github_link'} />

        <div 
            className='--w-full block px-5 md:px-5 h-fit pb-20
                      pt-[130px] md:pt-[90px] 
                      --prose-slate text-[17px]
                    --text-base max-w-none
                      --dark:prose-invert decoration-from-font 
                      subpixel-antialiased z-10 
                      text-slate-600 dark:text-slate-300'
        >
          <div className='flex flex-col gap-0'>
            <LogoGradient className='w-[500px]' />
            <p children={`Next Generation 
            Commerce As Code 
            Platform`}
               className='text-6xl font-medium whitespace-pre-line' />
          </div>
          <GradStroke className='w-full h-[550px] absolute right-10 top-0 
                        opacity-20 dark:opacity-30 z-0 pointer-events-none' />


        </div>
      </div>
    </div>
  )
};
