import { 
  AiFillGithub, AiOutlineMenu 
} from 'react-icons/ai/index.js'
import { HiOutlineLightBulb } from 'react-icons/hi/index.js'
import useDarkMode from '../hooks/useDarkMode.js'
import { BsDiscord, BsGithub, BsLinkedin } from 'react-icons/bs/index.js'

import Link from 'next/link.js'
import pkg from '../../package.json'

/**
 * 
 * @param {React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>} params
 */
export const Logo = (
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
 * 
 * @typedef {object} HeaderParams
 * @prop {string} slug
 * @prop {string} prefix
 * @prop {string} github_link
 * @prop {string} className
 * @prop {Function} onMenuClick
 * 
 * 
 * @param {HeaderParams} params
 * 
 */
const Header = (
  { 
    slug, prefix, github_link, onMenuClick, className, ...rest
  }
) => {

  const { darkMode, toggle } = useDarkMode()

  return (

<header className={`flex flex-row justify-between items-center 
                    w-full --max-w-[1100px] mx-auto px-3 ${className}`}>
  <div className='flex flex-row h-full gap-0'>
    <Logo />

    <div className='w-fit hidden sm:flex flex-col items-start
                    justify-between pb-1 pt-2
                    border-l dark:border-gray-400 h-full px-3
                    font-old text-base font-bold'>
      <span children={`Docs`} 
            className='text-xl text-gray-500 dark:text-gray-300 font-semibold' />
      <span children={slug} 
            className='text-base text-gray-400 tracking-widest font-semibold whitespace-nowrap' />
    </div>
  </div>                          

  <div className='h-fit w-fit flex flex-row items-center gap-3
                  text-2xl'>

    <button className='p-0' onClick={toggle}>
      <HiOutlineLightBulb className='text-2xl -translate-y-0.5 translate-x-1' />
    </button>

    <a href='https://discord.gg/zd2dvpFr' 
       title='Join our Discord'
       alt='Join our Discord'
        target='_blank' rel='noopener noreferrer'>
      <BsDiscord className='text-2xl --animate-pulse'/>
    </a>
    <a href='https://github.com/shelf-cms' 
       title='Fork us on Github'
       alt='Fork us on Github'
       target='_blank' rel='noopener noreferrer'>
      <BsGithub className='text-xl'/>
    </a>
    <a href='https://linkedin.com/company/shelf-cms/'
       title='Catch us at Linkedin'
       alt='Catch us at Linkedin'
       target='_blank' rel='noopener noreferrer'>
      <BsLinkedin className='text-xl'/>
    </a>
    {
      onMenuClick &&
      <AiOutlineMenu className='inline md:hidden cursor-pointer 
                              '
                      onClick={e => onMenuClick()} />
    }
  </div>

</header>
  )
}

export default Header