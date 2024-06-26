import SideBar, { SideBarSmall } from './side-bar.jsx'
import Header from './header.jsx'
import Copyright from './copyright.jsx'
import useToggle from '../hooks/useToggle.js'
import useDarkMode from '../hooks/useDarkMode.js'
import { useEffect } from 'react'
import { useRef } from 'react'
import { GradStroke } from './grad-stroke.jsx'
import TOC from './toc.jsx'

/**
 * @typedef {object} LayoutParams
 * @prop {import('../../pages/[[...slug]].js').PostPageProps["data"] & 
 *  { content_hydrated: JSX.Element }
 * } data
 * @prop {string} [className]
 * @prop {string} [header_prefix]
 * @prop {string} [github_link]
 * 
 * @param {LayoutParams} params
 */
const Layout = (
  { 
    className, data, header_prefix, github_link 
  }
) => {

  let { slug, content_hydrated, headings, document, frontMatter } = data;
  let { name, groups } = document;
  const { title, description } = frontMatter;
  const [menu, toggleMenu] = useToggle(false);
  const { darkMode } = useDarkMode();

  // console.log(data);

  /** @type {React.LegacyRef<HTMLDivElement>} */
  const main_ref = useRef();

  useEffect(
    () => {
      main_ref.current.scrollTo(
        {
          top: 0,
          left: 0,
          behavior: 'smooth'
        }
      );
    }, [slug]
  );

  return (
  <div className={`${className} ${darkMode ? 'dark' : ''}`}>
    <div className={`relative w-full h-screen flex flex-col 
                     transition-colors overflow-clip
                     bg-white dark:bg-gray-900
                     text-gray-800 dark:text-gray-300`
                    }>

      <Header 
          className='absolute inset-0 px-4
                   bg-white/10 dark:bg-transparent backdrop-blur-sm 
                     shadow-sm md:px-10 flex-shrink-0 
                     w-full z-40 ' 
          slug={slug} 
          prefix={header_prefix}
          onMenuClick={toggleMenu} 
          github_link={github_link} />

      <main className='flex flex-row w-full h-full'>

        <SideBar 
            className='hidden md:block w-72 h-full overflow-auto text-xs
                       flex-shrink-0 px-3 pt-[100px] pb-10 pl-10'
            selectedSlug={slug}
            groups={groups} 
            />

        <div className='flex-1 w-full items-stretch h-full 
                      lg:pr-[19rem] overflow-y-auto'>
          <GradStroke className='w-full h-[550px] absolute right-10 top-0 
                    opacity-20 dark:opacity-30 z-0 pointer-events-none' />
          {/* <GradStroke className=' w-[200px] h-[200px] absolute right-10 top-10 
                      opacity-10 md:opacity-10 md:dark:opacity-0  pointer-events-none'
                      via='via-kf-400' blur='blur-lg' />
          <GradStroke className='w-[650px] h-[150px] absolute right-20 top-0 
                      opacity-10 md:opacity-10 md:dark:opacity-0 pointer-events-none'
                      via='via-pink-400' /> */}

          <div 
              className='relative w-full h-full'
              ref={main_ref}>
            
            <div 
                className='--w-full block px-5 md:px-5 h-fit pb-20
                          pt-[130px] md:pt-[90px] prose prose-base
                          prose-slate text-[17px]
                        text-base max-w-none
                          dark:prose-invert decoration-from-font 
                          subpixel-antialiased z-10 
                          text-slate-600 dark:text-slate-400'
                children={content_hydrated} />
            <Copyright />               
          </div>

          <TOC
              headings={headings} 
              className='pt-[100px] h-full w-[19rem]  --bg-red-300 
                      hidden lg:flex flex-none top-0 right-0 fixed '/>

        </div>

      </main>

      <SideBarSmall 
        groups={groups}
        selectedSlug={slug}
        onClickMenuItem={() => toggleMenu()}
        showMenu={menu}/>

    </div>
  </div>
  )
}



export default Layout
