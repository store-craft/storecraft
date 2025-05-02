import SideBar, { SideBarSmall } from './side-bar'
import Header from './header'
import Copyright from './copyright'
import useToggle from '../hooks/use-toggle'
import useDarkMode from '../hooks/use-dark-mode'
import { useEffect } from 'react'
import { useRef } from 'react'
import { GradStroke, GradStrokeV2 } from './grad-stroke'
import TOC from './toc'
import { type PostPageProps } from '../../pages/docs/[[...slug]]'
import ClientOnly from './client-only'

export type LayoutParams = {
      data: PostPageProps["data"] & {
      content_hydrated: JSX.Element;
  };
  className?: string;
  header_prefix?: string;
  github_link?: string;
};


const Layout = (
  { 
    className, data, header_prefix, github_link 
  } : LayoutParams
) => {

  let { slug, content_hydrated, headings, document, frontMatter } = data;
  let { name, groups } = document;
  const { title, description } = frontMatter;
  const [menu, toggleMenu] = useToggle(false);
  const { darkMode } = useDarkMode();

  console.log(data);

  const main_ref = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      main_ref.current?.scrollTo(
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
    <div className={
      `relative w-full h-screen flex flex-col 
      transition-colors overflow-clip font-inter
      bg-white dark:bg-gray-900
      text-gray-800 dark:text-gray-300`
    }>

      <Header 
        className='absolute inset-0 px-3
        bg-white/10 dark:bg-transparent backdrop-blur-sm 
          shadow-sm md:px-4 flex-shrink-0 
          w-full h-fit z-40 ' 
        slug={slug} 
        onMenuClick={toggleMenu as Function} 
      />

      <main className='flex flex-row w-full h-full --pt-[80px]'>

      <ClientOnly>
        <SideBar 
          className='hidden md:block w-60 h-full overflow-auto text-xs
            flex-shrink-0 px-3 pt-[80px] pb-10 pl-2
            border-r border-gray-400/20 dark:border-gray-400/10'
          selectedSlug={slug}
          groups={groups} 
        />
      </ClientOnly>

        <div 
          ref={main_ref} 
          className={`flex-1 w-full items-stretch h-full pt-[130px] md:pt-[80px]
            overflow-y-auto ` + (headings?.length ? 'xl:pr-[19rem]' : '')}>

          <GradStrokeV2 
            className='w-full h-[550px] fixed right-0 top-0 
              opacity-20 dark:opacity-10 --z-50 pointer-events-none'
          />

          <div className={`relative w-full ${slug==='rest-api/api' ? 'w-full' : 'max-w-[692px]'} h-fit mx-auto flex flex-col`}>
            <div 
              className={
                `--w-full block ${slug==='rest-api/api' ? 'px-0 md:px-0' : 'px-5 md:px-5'} --h-fit pb-20
                --pt-[130px] --md:pt-[60px] prose prose-base
                prose-slate text-[16px] font-light
                prose-h1:text-3xl prose-h1:font-thin prose-h1:mb-12
                prose-h2:text-xl prose-h2:font-thin
                prose-h3:text-lg prose-h3:font-thin
                prose-code:before:hidden prose-code:after:hidden
                text-base max-w-none h-full
                dark:prose-invert decoration-from-font 
                subpixel-antialiased z-10 
                text-slate-800 dark:text-gray-400`
              }
              children={content_hydrated} 
            />
            <Copyright />               
          </div>

          {
            headings?.length && 
            <TOC
              headings={headings} 
              className='pt-[80px] h-full w-[250px]  --bg-red-300 
                hidden xl:flex flex-none top-0 right-0 fixed 
                border-l border-gray-400/20 dark:border-gray-400/10'
            />
          }

        </div>

      </main>

      <ClientOnly>
        <SideBarSmall 
          groups={groups}
          selectedSlug={slug}
          onClickMenuItem={() => toggleMenu()}
          showMenu={menu}/>
      </ClientOnly>

    </div>
  </div>
  )
}


export default Layout;
