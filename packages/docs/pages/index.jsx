import { GradStroke } from '@/components/grad-stroke.jsx';
import Header from '@/components/header.jsx';
import { LogoGradient } from '@/components/logo-text.jsx';
import { StorecraftText } from '@/components/logo.jsx';
import useDarkMode from '@/hooks/useDarkMode.js';
import { useRouter } from 'next/navigation.js'
import { useEffect } from 'react'
import docs from '@/utils/docs-config.js'
import { SideBarSmall } from '@/components/side-bar.jsx';
import useToggle from '@/hooks/useToggle.js';
import { Card } from '@/components/landing-card.jsx';
import { Hero } from '@/components/landing-hero.jsx';
import { LandingCards } from '@/components/landing-cards.jsx';


export default () => {
  const { darkMode, toggle } = useDarkMode()
  const [menu, toggleMenu] = useToggle(false);

  return (
    <div className={'w-screen h-screen relative ' + (darkMode ? 'dark' : '')}>
      <div className='w-full h-full transition-colors overflow-y-auto
                      bg-slate-200 dark:bg-gray-900 relative
                      text-gray-800 dark:text-gray-300'>

        <Header 
            className=' px-4
                    bg-white/10 dark:bg-transparent backdrop-blur-sm 
                      shadow-sm md:px-4 flex-shrink-0 
                      w-full z-40 ' 
            slug={undefined} 
            show_docs_decoration={false}
            onMenuClick={toggleMenu} 
            />

        <div 
            className='--w-full block  h-fit 
                      pt-[30px] 
                      --prose-slate text-[17px]
                    --text-base max-w-none
                      --dark:prose-invert decoration-from-font 
                      subpixel-antialiased z-10 
                      text-slate-600 dark:text-slate-300'>
          <div className='flex flex-col gap-0 overflow-y-auto'>
            <Hero />
            <LandingCards />
          </div> 
          <GradStroke className='w-full h-[550px] absolute right-10 top-0 
                        opacity-20 dark:opacity-30 z-0 pointer-events-none' />


        </div>

        {/* <div className='w-10 h-10 bg-red-500 absolute left-0 top-0'/> */}

        <SideBarSmall 
          groups={docs.groups}
          link_prefix='docs'
          selectedSlug={undefined}
          onClickMenuItem={() => toggleMenu()}
          showMenu={menu}/>
      </div>
    </div>
  )
};
