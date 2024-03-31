// import matter from 'gray-matter'
// import SideBar from './side-bar'
import SideBar from './side-bar-v2.jsx'
import Header from './header.jsx'
import Copyright from './copyright.jsx'
import useToggle from '../hooks/useToggle.js'
import useDarkMode from '../hooks/useDarkMode.js'
import { useEffect } from 'react'
import { useRef } from 'react'

const GradStroke =
 ({ direction='bg-gradient-to-tr', 
    from='from-transparent', via='via-kf-300', to='to-transparent', 
    from_stop='from-50%', to_stop='to-55%', 
    blur='blur-xl', ...rest }) => {

  return (
<div {...rest} >
  <div className={
    `w-full h-full
    ${direction} ${from} ${via} ${to}
    ${from_stop} ${to_stop} 
    ${blur}
    `
    } />
</div>    

  )
}

const Layout = 
  ({ className, data, header_prefix, github_link }) => {

  let { slug, content, document, frontMatter } = data
  let { name, groups } = document
  const { title, description } = frontMatter
  const [menu, toggleMenu] = useToggle(false)
  const { darkMode } = useDarkMode()

  console.log(data);

  const main_ref = useRef()
  useEffect(
    () => {
      main_ref.current.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    }, [slug]
  )

  return (
  <div className={`${className} ${darkMode ? 'dark' : ''}`}>
    <div className={`relative w-full h-screen flex flex-col 
                     font-open_sans overflow-clip
                     transition-colors
                     bg-transparent dark:bg-gray-900
                     text-gray-800 dark:text-gray-300`
                     }>

      {/* <GradStroke className='w-1/2 h-[500px] absolute left-0 top-0 opacity-80' /> */}

      <Header className=' 
                        absolute inset-0
                        bg-white/70 dark:bg-transparent backdrop-blur-sm
                        shadow-sm  max-w-[1040px] flex-shrink-0 
                         w-full h-[70px] z-50 ' 
              slug={slug} prefix={header_prefix}
              onMenuClick={toggleMenu} 
              github_link={github_link} />

      <main className='flex flex-row justify-center w-full overflow-auto --flex-1 
                       '>
        <SideBar className='hidden md:block w-60 h-full overflow-y-auto 
                            flex-shrink-0 px-3 pt-[80px]'
                  selectedSlug={slug}
                  groups={groups} name={name} />

        <div className='relative overflow-auto w-full --mx-auto max-w-[800px] 
                        h-full --bg-green-400'
            ref={main_ref}>
          
          <GradStroke className='w-3/4 h-[250px] absolute left-0 top-0 opacity-80' />
          <GradStroke className=' w-[200px] h-[200px] absolute right-10 top-10 opacity-80'
                      via='via-kf-400' blur='blur-lg' />
          <GradStroke className='w-[450px] h-[150px] absolute right-20 top-0 opacity-80'
                      via='via-pink-400' />

          <div className='w-full block px-5 md:px-5 h-fit pb-20 mdx --bg-green-400
                          text-gray-700 decoration-from-font --font-inter 
                          text-base font-normal dark:text-gray-200
                          pt-[70px]'
               style={{
                'font-size': '1rem',
                'line-height': '1.75rem',
               }}
               children={content} />
          <Copyright />               
        </div>
      </main>
      { 
        <SideBar className={`absolute left-0 top-[70px] block md:hidden w-full 
                             h-[calc(100vh-70px)] overflow-y-auto 
                             bg-white dark:bg-gray-900
                             pt-1 px-3 transition-transform duration-300
                             ${menu ? 'translate-x-0' : 'translate-x-full'}`}
                 onClickMenuItem={toggleMenu}
                 selectedSlug={slug}
                 groups={groups} 
                 name={name} />

      }
    </div>
  </div>
  )
}

export default Layout
