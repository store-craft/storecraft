import { 
  AiFillGithub, AiOutlineMenu 
} from 'react-icons/ai'
import { HiOutlineLightBulb } from 'react-icons/hi'
import useDarkMode from '../hooks/useDarkMode.js'
import { BsDiscord, BsGithub, BsLinkedin } from 'react-icons/bs'

import Link from 'next/link.js'
import pkg from '../../package.json'
import { Logo, LogoV2, StorecraftText } from './logo.jsx'
import { Connect } from './connect.jsx'
import { LogoGradient, LogoText } from './logo-text.jsx'

/**
 * 
 * @param {React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>} params
 */
export const Logo2 = (
  { 
    ...rest 
  }
) => {

  return (
<Link 
    href='/admin' 
    draggable='false' 
    className='h-full'
    title='SHELF Admin' 
    alt='SHELF Admin'>

  <div 
      className='relative w-full h-full flex flex-row 
                items-start --border
                --bg-white text-xl font-bold 
                 pr-3 overflow-x-clip ' 
      {...rest}>

    <img 
        src='/main/main3.png' 
        className='h-full object-contain rounded-xl bg-teal-400 
                  scale-75 border-kf-600 --shadow-lg opacity-80
                  cursor-pointer' /> 
    <div className='flex flex-col justify-between h-full p-2 '>
      <p children='shelf//CMS' 
      className='w-fit  text-xl 
                text-transparent font-mono tracking-wide
                bg-clip-text bg-gradient-to-r from-pink-500 to-kf-500 
                font-normal' />
      <p children={`v${pkg.version}`} 
        className='tracking-wider text-sm text-gray-500 
                  dark:text-gray-300 font-light
                  font-mono' />
    </div>                                  
  </div>
</Link>                  
  )
}

/**
 * @typedef {object} SlugParams
 * @prop {string} slug
 * 
 * 
 * @param {SlugParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params
 * 
 */
const Slug = (
  {
    slug, ...rest
  }
) => {

  if(!slug)
    return null;

  return (
<div {...rest} >
  <div className='w-fit flex flex-row flex-wrap items-center 
                  text-base font-extrabold italic'
                  >
    <span children={slug?.split('/').at(0) + '/'} 
          className='text-base text-gray-700 dark:text-gray-300 tracking-widest' 
          style={{lineHeight:'14px'}}/>
    <span children={slug?.split('/').at(1)} 
          className='text-base text-gray-700/50 tracking-widest dark:text-gray-300/50 ' 
          style={{lineHeight:'14px'}}/>
  </div>
</div>    
  )
}

/**
 * 
 * @typedef {object} HeaderParams
 * @prop {string} slug
 * @prop {string} className
 * @prop {boolean} [show_docs_decoration=true]
 * @prop {Function} onMenuClick
 * 
 * 
 * @param {HeaderParams} params
 * 
 */
const Header = (
  { 
    slug, onMenuClick, show_docs_decoration=true, className, ...rest
  }
) => {

  const { darkMode, toggle } = useDarkMode()

  return (


<div className={`flex flex-col h-fit  w-full gap-2 border-b border-gray-400/20  ${className}`}>
  <div className={`flex flex-row justify-between items-center py-2  w-full`}>

    <div className='flex flex-row w-fit h-fit items-center gap-3'>
      <Link href='/'>
        <div className='w- flex flex-row items-center gap-1 relative'>
          <LogoV2 className='h-10 w-10 object-contain rounded-xl bg-teal-400 
                        scale-90 border-kf-600 --shadow-lg opacity-80' />                  
          {/* <StorecraftText className='text-[32px] w-[220px]' /> */}
          <LogoGradient className='h-6' />
          {
            show_docs_decoration &&
            <span children={'Docs'} 
                  className='absolute right-1 -bottom-2 text-xs 
                          text-gray-600 dark:text-gray-300 
                            italic -tracking-widest font-extrabold ' />
          }
        </div>
      </Link>

      <Slug 
          slug={slug}
          className='w-fit pb-1 pt-2 px-3
                     border-l border-gray-400/40
                     text-base font-extrabold italic
                     hidden md:block'
      />
    </div>                          

    <div className='h-fit w-fit flex flex-row items-center gap-3 text-2xl'>

      <button className='p-0' onClick={toggle}>
        <HiOutlineLightBulb className='text-2xl -translate-y-0.5 translate-x-1' />
      </button>

      <Connect className='hidden md:flex flex-row gap-3'/>
    </div>

  </div>

  {/* Lower part of the header for small screens */}
  <div className='w-full flex md:hidden flex-row justify-between 
                p-2 border-t dark:border-gray-400/20'>
    <div className='flex flex-row gap-2 items-center'>
      {
        onMenuClick &&
        <AiOutlineMenu 
            className='inline md:hidden text-xl cursor-pointer'
            onClick={e => onMenuClick()} />
      }
      <Slug 
        slug={slug}
        className='w-fit h-fit px-2
                   border-l border-gray-400/40
                   text-base font-extrabold italic'
      />

    </div>
    <Connect className='flex flex-row gap-3' />
  </div>

</div>
  )
}

export default Header