import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FaBloggerB, FaOpencart } from 'react-icons/fa/index.js'
import { AiOutlineUser, AiFillTag } from 'react-icons/ai/index.js'
import { TbDiscount2 } from 'react-icons/tb/index.js'
import { BiImages, BiGame } from 'react-icons/bi/index.js'
import { 
  MdPayment, MdOutlineCollectionsBookmark, 
  MdOutlineGamepad, MdOutlineLocalShipping, 
  MdStorefront } from 'react-icons/md/index.js'
import SideMenu from './comps/side-menu.jsx'
import ActionBar from './comps/action-bar.jsx'
import { Bling } from './comps/common-ui.jsx'
import { Outlet } from 'react-router-dom'
import useDarkMode from './hooks/useDarkMode.js'

const menu = {
  info: {
    name: 'Shelf',
    icon: <BiGame className='inline' />
  },
  groups: [
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
        extra : { active: 'bg-pink-600', hover: 'hover:bg-amber-200' } 
      },
      { 
        name: 'Payment Gateways', icon: <MdPayment/>, 
        extra : { active: 'bg-pink-600', hover: 'hover:bg-amber-200' } 
      },
      { 
        name: 'Discounts', icon: <TbDiscount2 className='--text-lg'/>, 
        extra : { active: 'bg-pink-600', hover: 'hover:bg-teal-200' } 
      },
      { 
        name: 'Shipping Methods', icon: <MdOutlineLocalShipping className='--text-lg'/>, 
        extra : { active: 'bg-pink-600', hover: 'hover:bg-teal-200' } 
      },
    ]
  },
  {
    name: 'apps',
    items : [
      { 
        name: 'Gallery', icon: <BiImages className='--scale-125'/>, 
        extra : { active: 'bg-yellow-400', hover: 'hover:bg-teal-200' } 
      },
      { 
        name: 'Blog', icon: <FaBloggerB/>, 
        extra : { active: 'bg-orange-400', hover: 'hover:bg-teal-200' } 
      },
      // { name: 'Email', icon: <AiOutlineMail/> },
      // { name: 'Reports', icon: <HiOutlineDocumentReport/> },
    ]
  }, 
  ]
}

const Layout = ({ children, className, ...rest }) => {
  const [menuOpen, setMenuOpen] = useState(true)
  const onMenuClick = useCallback(
    () => {
      setMenuOpen(v => !v)
    }, []
  )
  const onCloseClick = useCallback(
    () => {
      setMenuOpen(false)
    }, []
  )

  const main_ref = useRef()
  useEffect(
    () => {
      main_ref.current.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    }, []
  )

  const { darkMode } = useDarkMode()

  //
  const [open, setOpen] = useState(true)
  const state = useRef({})

  useEffect(
    () => {
      const DOWN = 0
      const UP = 1
      const D = 100

      state.current.state = DOWN
      state.current.latestPos = undefined//main_ref.current.scrollTop
      state.current.latestTurn = undefined//main_ref.current.scrollTop
      main_ref.current.onscroll = function(e) {
        var currentScrollPos = main_ref.current.scrollTop;
        const s = state.current
        if(s.latestPos===undefined)
          s.latestPos=currentScrollPos
        if(s.latestTurn===undefined)
          s.latestTurn=currentScrollPos

        if(currentScrollPos==0) {
          setOpen(true)
          return
        }
        const goes_down = currentScrollPos - s.latestPos > 0

        if(goes_down) {
          if(s.state!=DOWN) {
            s.latestTurn = currentScrollPos
            s.state=DOWN
            // console.log(s)
          }
          if(currentScrollPos - s.latestTurn>=D)
            setOpen(false)
        } else {
          if(s.state!=UP) {
            s.latestTurn = currentScrollPos
            s.state=UP
            // console.log(s)

          }
          if(currentScrollPos - s.latestTurn<=-D)
            setOpen(true)

        }
        s.latestPos=currentScrollPos
      }
      return () => {
        main_ref.current && (main_ref.current.onscroll = undefined)
      }
    }, []
  )

  const open_class = open ? 'translate-y-0' : '-translate-y-full'

  // console.log(darkMode)
  return (
<div className={`${darkMode ? 'dark' : ''}`}
      data-color-mode={darkMode ? 'dark' : 'light'}>
  <div className={`relative flex flex-row font-admin 
                  shelf-body-bg
                  w-full sm:h-full ${className}
                  `} {...rest}
                  style={{height: '100dvh'}}>

    <div className={`fixed left-0 top-0 w-screen h-full 
                  bg-teal-900/10 z-50 
                    transition-all
                    
                    md:hidden
                  ${menuOpen ? 'block backdrop-blur-sm' : 'hidden backdrop-blur-0'}`} 
                  onClick={onCloseClick}/>

    {/* side menu   */}
    <div className={`absolute left-0 top-0 md:relative flex flex-shrink-0 
                      w-fit h-full overflow-x-clip overflow-hidden 
                      z-50 
                      md:transition-max-width md:duration-500 ease-in-out
                      ${menuOpen ? 'max-w-[72rem]' : 'max-w-0 '}`}>

      <Bling className='my-3 ml-3 shadow-sm' 
            rounded='rounded-tr-3xl rounded-tl-md rounded-br-3xl' 
            stroke='pr-px pt-1 pb-4' 
            from='from-kf-400 dark:from-kf-500' 
            to='to-pink-400 dark:to-pink-500'>
        <SideMenu menu={menu} 
                  onCloseClick={onCloseClick} 
                  className='bg-gradient-to-r 
                           from-slate-100 to-white 
                           dark:from-slate-800 dark:to-slate-800
                            shadow-md 
                            shadow-gray-800 h-full rounded-tr-3xl 
                            rounded-br-3xl' />
      </Bling>
    </div>

    {/* main content */}
    <div className='relative flex-1 h-full flex flex-col mx-0 sm:mx-3 md:mx-6 overflow-auto'>

      <ActionBar 
          className={`w-full 
                      shelf-action-bar
                      h-12 backdrop-blur-sm
                      absolute left-0 top-0 z-40 
                      border-b dark:border-b-slate-700 
                      --md:border-none 
                      px-3
                      transition-transform 
                      duration-500 ${open_class}`} 
          onMenuClick={onMenuClick} 
          menuOpen={menuOpen} />

      <div ref={main_ref} 
          className='relative w-full 
                    h-full pt-16 pb-5 overflow-y-auto scrollbar-none '>
        <div className='bg-gradient-to-tl from-kf-50/50 to-slate-50/10
                        dark:from-transparent/0 dark:to-transparent/0   
                          px-3 sm:px-5 lg:px-10 py-3 sm:py-5 lg:py-8 
                          rounded-3xl text-sm font-medium --text-gray-500 
                          border dark:border-slate-700 w-full h-fit min-h-full overflow-x-auto'>
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