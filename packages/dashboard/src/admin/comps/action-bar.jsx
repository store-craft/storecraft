import React, { useMemo, useState } from 'react'
import { AiOutlineMenuFold } from 'react-icons/ai/index.js'
import { MdLogout } from 'react-icons/md/index.js'
import { useUser } from '@/shelf-cms-react-hooks/index.js'
import { GradientFillIcon } from './common-button.jsx'
import useToggle from '../hooks/useToggle.js'
import ShowIf from './show-if.jsx'
import Notifications from './notifications.jsx'
import NotificationButton from './notifications-button.jsx'
import DarkMode from './dark-mode.jsx'


/**
 * @typedef {object} InternalActionBarParams
 * @prop {boolean} [menuOpen]
 * @prop {string} [className]
 * @prop {React.MouseEventHandler} [onMenuClick]
 * 
 * @typedef {InternalActionBarParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
 * } ActionBarParams
 * 
 * @param {ActionBarParams} param0 
 * @returns 
 */
const ActionBar = (
  { 
    menuOpen, className='w-full', onMenuClick, ...rest 
  }
) => {
  
  const [notify_open, toggle_notify] = useToggle(false);
  const {
    user, isAuthenticated, 
    actions: {
      signin, signup, signout
    }
  } = useUser();
  
  const user_name = useMemo(
    () => user?.firstname ? (', ' + user?.firstname) : '',
    [user]
  );
  // console.log(notify_open)
  
  return (
<nav className={className} {...rest}>
  <div className='relative w-full flex flex-row h-full justify-between items-center '>
    <AiOutlineMenuFold 
        className={`text-kf-400 text-4xl top-4 right-4
                      cursor-pointer --md:hidden hover-text-pink-600 
                      rounded-full transition-all duration-300 
                      hover:bg-pink-400 hover:text-white 
                      p-1.5 hover:p-1 
                      ${menuOpen ? 'rotate-0' : 'rotate-180'}`}
        onClick={onMenuClick} />
    <div>
      <span children={`Hi`}/>
      <span children={user_name} 
            className='font-semibold '/>
    </div>        
    <div className='flex flex-row gap-3 items-center'>
      <GradientFillIcon 
          Icon={MdLogout} 
          onClick={signout}
          className='text-2xl cursor-pointer' />   
      <NotificationButton 
          isOpen={notify_open}
          onClick={() => toggle_notify()}
          /> 
      <DarkMode />

    </div>
    <ShowIf show={notify_open}>
      <Notifications />
    </ShowIf>
  </div>
</nav>
  )
}

export default ActionBar