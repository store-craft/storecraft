import { GradStroke } from '@/components/grad-stroke.jsx';
import Header from '@/components/header.jsx';
import useDarkMode from '@/hooks/useDarkMode.js';
import docs from '@/utils/docs-config.js'
import { SideBarSmall } from '@/components/side-bar.jsx';
import useToggle from '@/hooks/useToggle.js';
import { Hero } from '@/components/landing-hero.jsx';
import { LandingCards } from '@/components/landing-cards.jsx';
import {CodeBlock} from '@/components/code-block.jsx';
import { code, code_payment, NPX } from '@/components/landing-more.jsx';
import { Segment } from '@/components/landing-segment.jsx';
import { Bling } from '@/components/common.jsx';
import { CommonGradientText } from '@/components/gradient-text.jsx';
import { IoTerminal } from "react-icons/io5";


export default () => {
  const { darkMode, toggle } = useDarkMode()
  const [menu, toggleMenu] = useToggle(false);

  return (
    <div className={'w-screen h-screen relative ' + (darkMode ? 'dark' : '')}>
      <GradStroke className='w-full h-[550px] absolute right-10 top-0 
                    opacity-20 dark:opacity-30 z-50 pointer-events-none' />

      <div className='w-full h-full transition-colors overflow-y-auto
                      bg-slate-200 dark:bg-gray-900 relative
                      text-gray-800 dark:text-gray-300
                      px-3 md:px-10'>

        <Header 
            className='
                    bg-white/10 dark:bg-transparent backdrop-blur-sm 
                      shadow-sm  flex-shrink-0 
                      w-full z-40 ' 
            slug={undefined} 
            show_docs_decoration={false}
            show_start_here={true}
            onMenuClick={toggleMenu} 
            />

        <div className='--w-full block  h-fit 
                     relative text-[17px] max-w-[1300px] mx-auto
                      decoration-from-font 
                      subpixel-antialiased z-10 pb-40
                      text-slate-600 dark:text-slate-300'>
          <div className='w-full relative flex flex-col gap-5 md:gap-10 
                  overflow-y-auto '>

            {/* hero */}
            <div className='h-fit relative'>
              <Hero />
              <Bling rounded='rounded-lg' 
                  className='absolute bottom-0 lg:top-4 right-0 
                          z-50 text-xs sm:text-base w-fit h-fit' >
                <NPX />
              </Bling>
            </div>


            {/* landing cards */}
            <LandingCards />


            {/* code sample 1 */}
            <Segment className='w-full'>
              <CommonGradientText 
                  className='text-5xl sm:text-7xl w-fit max-w-[705px] text-center md:text-left ' 
                  children={<div>Craft the <u className='underline'>perfect</u> commerce as code application'</div>} />
              <CodeBlock children={code} showLinesNumbers={false} 
                      outerClassName='w-full md:w-fit flex-shrink md:flex-shrink-0' />
            </Segment>

            
            {/* code sample 2 */}
            <Segment className='w-full' reverse={true}>
              <CommonGradientText 
                className='text-5xl sm:text-7xl w-fit text-center md:text-right max-w-[705px]' 
                children='Use your favorite Payment Gateways'/>
              <CodeBlock children={code_payment} showLinesNumbers={false} 
                    outerClassName='w-full md:w-fit --flex-shrink-0' />
            </Segment>
            

            {/* dashboard */}
            <div className='flex flex-col w-full gap-10 items-center justify-between '>
              <CommonGradientText 
                        className='text-5xl w-fit --font-mono max-w-[705px] text-center md:text-left ' 
                        children='Official Dashboard' />
              <Bling stroke='border-[6px]' 
                    className='w-fit mx-auto       shadow-[0px_0px_6px] shadow-pink-500/90
'
                    rounded='rounded-2xl'
                    from='from-pink-500 dark:from-pink-500/90'
                    to='to-kf-500 dark:to-kf-500/90'>
                <img src='/landing/main.webp' 
                      className='border border-gray-600 object-contain 
                              mx-auto rounded-2xl w-full max-w-[1000px]' />
              </Bling>
            </div>


            {/* npx create */}
            <Segment className='w-full'>
              <div className='flex flex-col'>
                <div className='flex flex-row flex-wrap items-center gap-3'>
                  <IoTerminal className='text-5xl'/> 
                  <span children='npx' className='text-5xl w-fit font-mono' />
                </div>
                <CommonGradientText 
                      className='text-5xl w-fit font-mono max-w-[705px] text-center md:text-left ' 
                      children='storecraft create' />
              </div>
              <Bling stroke='border-[6px]' 
                    className='w-fit mx-auto'
                    from='from-pink-500 dark:from-pink-500/90'
                    to='to-kf-500 dark:to-kf-500/90'>
                <img src='/cli.gif' 
                    className='border border-gray-600 object-contain mx-auto rounded-md' />
              </Bling>
            </Segment>


            {/* detailed opan-api docs */}
            <div className='flex flex-col w-full gap-10 items-center justify-between '>
              <CommonGradientText 
                  className='text-5xl w-fit --font-mono max-w-[705px] text-center md:text-left ' 
                  children='Detailed OpenAPI docs' />
              <Bling stroke='border-[6px]' 
                    className='w-fit mx-auto shadow-[0px_0px_6px] shadow-pink-500/90
'
                    rounded='rounded-2xl'
                    from='from-pink-500 dark:from-pink-500/90'
                    to='to-kf-500 dark:to-kf-500/90'>
                <img src='/landing/reference_api.webp' 
                      className='border border-gray-600 w-full max-w-[1000px] object-contain 
                              mx-auto rounded-2xl' />
              </Bling>
            </div>
          </div> 

        </div>
        
        <span children={`All rights reserved to storecraft.app (${new Date().getFullYear()})`}
              className='w-full h-fit p-10 flex flex-row justify-center' />

        {/* <div className='bg-red-400 z-50 fixed w-10 h-10 inset-0' /> */}
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
