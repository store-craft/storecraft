import { 
  AiFillGithub, AiOutlineMenu 
} from 'react-icons/ai'
import Link from 'next/link.js'
import pkg from '../../package.json' with { type: 'json' }
import { Connect } from './connect'
import { LogoGradient, LogoText } from './logo-text'
import { FaTerminal } from 'react-icons/fa'
import { GradientText } from './gradient-text'
import ShowIf from './show-if'

export const Logo2 = (
  { 
    ...rest 
  } : React.ComponentProps<'div'>
) => {

  return (
<Link 
  href='/admin' 
  draggable='false' 
  className='h-full'>

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
      <p 
        children='shelf//CMS' 
        className='w-fit  text-xl 
          text-transparent font-mono tracking-wide
          bg-clip-text bg-gradient-to-r from-pink-500 to-kf-500 
          font-normal' />
      <p 
        children={`v${pkg.version}`} 
        className='tracking-wider text-sm text-gray-500 
          dark:text-gray-300 font-light
          font-mono' />
    </div>                                  
  </div>
</Link>                  
  )
}

export type SlugParams = {
  slug?: string;
} & React.ComponentProps<'div'>;

export type HeaderParams = {
  slug?: string;
  className: string;
  show_docs_decoration?: boolean;
  show_start_here?: boolean;
  onMenuClick: Function;
} & React.ComponentProps<'div'>;

const Slug = (
  {
    slug, ...rest
  } : SlugParams
) => {

  if(!slug)
    return null;

  return (
<div {...rest} >
  <div className='w-fit flex flex-row flex-wrap items-center 
                  text-base font-extrabold italic'
                  >
    <span 
      children={slug?.split('/').at(0) + '/'} 
      className='text-base text-gray-700 dark:text-gray-300 tracking-widest' 
      style={{lineHeight:'14px'}}/>
    <span 
      children={slug?.split('/').at(1)} 
      className='text-base text-gray-700/50 tracking-widest dark:text-gray-300/50 ' 
      style={{lineHeight:'14px'}}/>
  </div>
</div>    
  )
}

const Header = (
  { 
    slug, onMenuClick, show_docs_decoration=true, 
    show_start_here=false, ...rest
  } : HeaderParams
) => {


  return (
<div {...rest}>
  <div 
    className='flex flex-col h-fit  w-full 
      gap-2 border-b border-gray-400/20'>
    <div 
      className='flex flex-row border-b border-gray-400/20 
        justify-between items-center py-3 md:py-5 --bg-red-600  w-full'>

      <div className='flex hiddenflex-row w-fit h-fit items-center gap-3'>
        <Link href='/'>
          <div className='w- flex flex-row px-1 items-center gap-1 relative'>
            <img src='/favicon.svg' className='w-7 h-7' />
            <LogoGradient className='h-6' />
            {
              show_docs_decoration &&
              <span 
                children={'Docs'} 
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

      <div 
        className='h-fit w-fit flex flex-row 
          items-center gap-3 text-2xl'>

        <ShowIf show={show_start_here}>
          <Link href='/docs/start-here/what/'>
            <div 
              className='flex flex-row items-center gap-0 text-base 
                sm:text-xl font-bold h-fit'>
              <FaTerminal />
              <GradientText 
                className='bg-gradient-to-r from-black dark:from-white  
                to-pink-500 dark:to-pink-500' 
                children='start_here_' />
            </div>
          </Link>
        </ShowIf>

        <Connect className='hidden md:flex flex-row gap-3'/>
      </div>

    </div>

    {/* Lower part of the header for small screens */}
    <div 
      className='w-full flex md:hidden flex-row justify-between 
        p-2 '>
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
</div>    
  )
}

export default Header