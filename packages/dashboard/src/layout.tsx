import React, { useCallback, useState } from 'react'
import { FaBloggerB, FaOpencart } from 'react-icons/fa'
import { AiOutlineUser, AiFillTag, AiOutlineAppstoreAdd } from 'react-icons/ai'
import { TbDiscount2 } from 'react-icons/tb'
import { BiImages, BiGame } from 'react-icons/bi'
import { 
  MdPayment, MdOutlineCollectionsBookmark, 
  MdOutlineGamepad, MdOutlineLocalShipping, 
  MdStorefront 
} from 'react-icons/md'
import SideMenu, { MenuType } from './comps/side-menu'
import ActionBar from './comps/action-bar'
import { Bling } from './comps/common-ui'
import { Outlet } from 'react-router-dom'
import useDarkMode from './hooks/use-dark-mode'
import { useScrollDelta } from '@/hooks/use-scroll-delta'
import { CgTemplate } from "react-icons/cg";
import { createPortal } from './comps/portal-creator'
import { RiRobot2Line } from 'react-icons/ri'

const menu: MenuType = {
  info: {
    name: 'Storecraft',
    icon: <BiGame className='inline' />
  },
  items: [
  {
    name: 'pages',
    items : [
      { 
        name: 'Storefronts', icon: <MdStorefront className=''/>, 
        extra : { active: 'bg-pink-600', hover: 'hover:bg-cyan-400' } 
      },
      { 
        name: 'Customers', icon: <AiOutlineUser className=''/>, 
        extra : { active: 'bg-pink-600', hover: 'hover:bg-cyan-400' } 
      },
      { 
        name: 'Tags', icon: <AiFillTag className=''/>, 
        extra : { active: 'bg-pink-600', hover: 'hover:bg-pink-400' } 
      },
      { 
        name: 'Products', icon: <MdOutlineGamepad className=''/>, 
        extra : { active: 'bg-pink-600', hover: 'hover:bg-teal-400' } 
      },
      { 
        name: 'Collections', icon: <MdOutlineCollectionsBookmark/>,
         extra : { active: 'bg-pink-600', hover: 'hover:bg-kf-400' } 
        },
      { 
        name: 'Orders', icon: <FaOpencart/>, 
        extra : { active: 'bg-pink-600 dark:bg-pink-600/90', hover: 'hover:bg-amber-200' } 
      },
      { 
        name: 'Discounts', icon: <TbDiscount2 className='--text-lg'/>, 
        extra : { active: 'bg-pink-600', hover: 'hover:bg-teal-200' } 
      },
      { 
        name: 'Shipping Methods', icon: <MdOutlineLocalShipping className='--text-lg'/>, 
        extra : { active: 'bg-pink-600', hover: 'hover:bg-teal-200' } 
      },
      { 
        name: 'Blog', slug: 'posts', icon: <FaBloggerB/>, 
        extra : { 
          active: 'bg-orange-400 dark:bg-orange-400/70', hover: 'hover:bg-teal-200',
        } 
      },
      { 
        name: 'Payment Gateways', icon: <MdPayment/>, 
        extra : { active: 'bg-pink-600', hover: 'hover:bg-amber-200' } 
      },
      { 
        name: 'AI Chats', slug: 'chats',
        icon: <RiRobot2Line/>, 
        extra : { active: 'bg-pink-600', hover: 'hover:bg-amber-200' } 
      },
    ]
  },
  {
    name: 'apps',
    items : [
      { 
        name: 'Gallery', icon: <BiImages className='--scale-125'/>, 
        extra : { active: 'bg-yellow-400 dark:bg-yellow-400/80', hover: 'hover:bg-teal-200' } 
      },
      { 
        name: 'Templates', icon: <CgTemplate className='--scale-125'/>, 
        extra : { active: 'bg-red-400 dark:bg-red-400/80', hover: 'hover:bg-teal-200' } 
      },
      { 
        name: 'Extensions', icon: <AiOutlineAppstoreAdd className='--scale-125'/>, 
        extra : { active: 'bg-teal-400 dark:bg-teal-400/80', hover: 'hover:bg-teal-200' } 
      },
      // { name: 'Email', icon: <AiOutlineMail/> },
      // { name: 'Reports', icon: <HiOutlineDocumentReport/> },
    ]
  }, 
  ]
}


export const MainPortal = createPortal();


const Layout = (
  { 
    children=undefined, className, ...rest 
  }: React.ComponentProps<'div'>
) => {

  const { open, ref_scroll_element } = useScrollDelta(100, true);
  const [menuOpen, setMenuOpen] = useState(true);
  const { darkMode } = useDarkMode();

  const onMenuClick = useCallback(
    () => {
      setMenuOpen(v => !v)
    }, []
  );

  const onCloseClick = useCallback(
    () => {
      setMenuOpen(false)
    }, []
  );

  const open_class = open ? 'translate-y-0' : '-translate-y-full';

  return (
<div 
  className={`w-full h-full  ${darkMode ? 'dark' : ''}`}
  data-color-mode={darkMode ? 'dark' : 'light'}>
  <div 
    className={`relative flex flex-row font-inter 
      shelf-body-bg
      w-full h-full sm:h-full ${className}
      `} {...rest}
      // @ts-ignore
      ssstyle={{height: '100dvh'}}>

    <MainPortal.Portal />        
    <div 
      className={`fixed left-0 top-0 w-full h-full bg-teal-900/10 
        z-50 transition-all md:hidden
        ${menuOpen ? 'block backdrop-blur-sm' : 'hidden backdrop-blur-0'}`
      } 
      onClick={onCloseClick}/>

    {/* side menu   */}
    <div 
      className={`absolute left-0 top-0 md:relative flex flex-shrink-0 
        w-fit h-full overflow-x-clip overflow-hidden 
        z-50 
        md:transition-max-width md:duration-500 ease-in-out
        ${menuOpen ? 'max-w-[72rem]' : 'max-w-0 '}`}>

      <Bling 
        className='my-3 ml-3 shadow-sm' 
        rounded='rounded-tr-3xl rounded-tl-md rounded-br-3xl' 
        stroke='border-r pt-1 border-b-[16px]' 
        from='from-kf-400 dark:from-kf-500' 
        to='to-pink-400 dark:to-pink-500'>
        <SideMenu 
          dash={
            {
              menu,
              onCloseClick 
            }
          }
          className='bg-gradient-to-r 
            from-slate-100 to-white 
            dark:from-slate-800 dark:to-slate-800
            shadow-md 
            shadow-gray-800 h-full rounded-tr-3xl 
            rounded-br-3xl' 
        />
      </Bling>
    </div>

    {/* main content */}
    <div 
      className='relative flex-1 h-full flex flex-col 
        mx-0 sm:mx-3 md:mx-6 overflow-auto'>

      <ActionBar 
        className={
          `w-full 
          shelf-action-bar
          h-12 backdrop-blur-sm
          absolute left-0 top-0 z-40 
          border-b dark:border-b-slate-700 
          px-3
          transition-transform 
          duration-500 ${open_class}`
        } 
        onMenuClick={onMenuClick} 
        menuOpen={menuOpen} 
      />

      <div 
        ref={ref_scroll_element} 
        className='relative w-full 
          h-full pt-16 pb-5 overflow-y-auto scrollbar-none '>
        <div 
          className='
          --bg-red-400
            --bg-gradient-to-tl --from-kf-50/50 --to-slate-50/10
            dark:from-transparent/0 dark:to-transparent/0   
            px-3 sm:px-5 lg:px-10 py-3 sm:py-5 lg:py-8 
            rounded-3xl text-sm font-medium 
            border dark:border-slate-700 w-full h-fit 
            min-h-full overflow-x-auto'>
          <Outlet />
          { children }
        </div>                    
      </div>
    </div>
  </div>
</div>
)
}

export default Layout