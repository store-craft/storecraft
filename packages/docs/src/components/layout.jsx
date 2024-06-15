// import matter from 'gray-matter'
// import SideBar from './side-bar'
import SideBar from './side-bar.jsx'
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
                     bg-transparent dark:bg-gray-900
                     text-gray-800 dark:text-gray-300`
                    }>

      {/* <GradStroke className='w-1/2 h-[500px] absolute left-0 top-0 opacity-80' /> */}

      <Header 
          className='absolute inset-0
                   bg-white/70 dark:bg-transparent backdrop-blur-sm 
                     shadow-sm md:px-10 --max-w-[1040px] flex-shrink-0 
                     w-full h-[70px] z-50 ' 
          slug={slug} prefix={header_prefix}
          onMenuClick={toggleMenu} 
          github_link={github_link} />

      <main className='flex flex-row --justify-center w-full overflow-auto'>
        <SideBar 
            className='hidden md:block w-72 h-full overflow-auto 
                       flex-shrink-0 px-3 pt-[100px] pl-10 bg-green-400'
            selectedSlug={slug}
            groups={groups} 
            />

        <div className='flex flex-row flex-1'>

        <div 
            className='relative overflow-y-auto grow --w-full mx-auto --max-w-[800px] 
                       h-full'
            ref={main_ref}>
          
          {/* <GradStroke className='w-full h-[550px] absolute right-10 top-0 opacity-30 z-0' /> */}
          {/* <GradStroke className=' w-[200px] h-[200px] absolute right-10 top-10 opacity-80'
                      via='via-kf-400' blur='blur-lg' /> */}
          {/* <GradStroke className='w-[450px] h-[150px] absolute right-20 top-0 opacity-80'
                      via='via-pink-400' /> */}

          <div 
              className='w-full block px-5 md:px-5 h-fit pb-20 --mdx --bg-green-400
                         pt-[100px] prose text-base dark:prose-invert decoration-from-font 
                         subpixel-antialiased z-10
                        text-slate-600 dark:text-slate-400'
               children={content_hydrated} />
          <Copyright />               
        </div>

        <TOC
            headings={headings} 
            className='pt-[100px] h-full w-72 bg-red-300 hidden lg:flex flex-none --absolute top-0 right-0'/>
        {/* <div className='h-full w-72 bg-red-300 hidden lg:flex flex-none --absolute top-0 right-0' /> */}
        </div>
      </main>

      <SideBar 
          className={`absolute left-0 top-[70px] block md:hidden w-full 
                      h-[calc(100vh-70px)] overflow-y-auto 
                      bg-white dark:bg-gray-900
                      pt-1 px-3 transition-transform duration-300
                      ${menu ? 'translate-x-0' : 'translate-x-full'}`
                    }
          onClickMenuItem={_ => toggleMenu()}
          selectedSlug={slug}
          groups={groups} 
          />

    </div>
  </div>
  )
}

export default Layout
