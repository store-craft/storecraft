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
import {CodeBlock} from '@/components/code-block.jsx';
import { code, code_payment, MainCard, NPX } from '@/components/landing-more.jsx';
import { Segment, SegmentHeader } from '@/components/landing-segment.jsx';
import { Bling } from '@/components/common.jsx';
import { GradientText } from '@/components/gradient-text.jsx';



export default () => {
  const { darkMode, toggle } = useDarkMode()
  const [menu, toggleMenu] = useToggle(false);

  return (
    <div className={'w-screen h-screen relative ' + (darkMode ? 'dark' : '')}>
      <GradStroke className='w-full h-[550px] absolute right-10 top-0 
                    opacity-20 dark:opacity-30 z-50 pointer-events-none' />

      <div className='w-full h-full transition-colors overflow-y-auto
                      bg-slate-200 dark:bg-gray-900 relative
                      text-gray-800 dark:text-gray-300'>

        <Header 
            className='px-5 sm:px-10
                    bg-white/10 dark:bg-transparent backdrop-blur-sm 
                      shadow-sm  flex-shrink-0 
                      w-full z-40 ' 
            slug={undefined} 
            show_docs_decoration={false}
            onMenuClick={toggleMenu} 
            />

        <div 
            className='--w-full block  h-fit 
                      --pt-[30px] relative
                      --prose-slate text-[17px]
                    --text-base max-w-none
                      --dark:prose-invert decoration-from-font 
                      subpixel-antialiased z-10 
                      text-slate-600 dark:text-slate-300'>
          <div className='w-full relative flex flex-col gap-5 md:gap-10 overflow-y-auto p-5 sm:p-10'>
            <div className='h-fit relative'>
              <Hero />
              <NPX className='absolute top-0 sm:top-4 right-0 z-50 text-xs sm:text-base' />
              {/* <MainCard className='absolute top-4 right-4 z-50 w-1/4 h-fit' >
                <p children='Storecraft is an ecommerce application as code technology, that can use any compute, database and storage engine so you can craft the perfect ecommerce store'/>
              </MainCard> */}
            </div>
            <LandingCards />
            <Segment className='w-full md:w-fit '>
              <GradientText className='text-7xl' children='Craft the perfect commerce as code application' />
              <CodeBlock children={code} showLinesNumbers={false} 
                      outerClassName='w-full md:w-fit flex-shrink-0' />
            </Segment>
            <Segment className='w-full md:w-fit '>
              <CodeBlock children={code_payment} showLinesNumbers={false} 
                    outerClassName='w-full md:w-fit --flex-shrink-0' />
              <GradientText className='text-7xl' children='Use your favorite Payment Gateways'/>
            </Segment>
            {/* <img src='/ray-so-export.png' 
            className='w-1/3 --absolute --h-full z-50 top-0 right-0'/> */}
            <p children='npx storecraft create' 
                className='text-4xl w-fit font-mono border-b border-dashed'/>
            <Bling stroke='border-[32px]' 
                  className='w-fit mx-auto'
                  from='from-pink-500 dark:from-pink-500/90'
                  to='to-kf-500 dark:to-kf-500/90'>
            <img src='/cli.gif' 
                className='border border-gray-600 object-contain h-[400px] mx-auto rounded-md' />

            </Bling>
          </div> 

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
