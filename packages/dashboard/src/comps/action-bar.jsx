import React, { useCallback, useMemo, useState } from 'react'
import { AiOutlineMenuFold } from 'react-icons/ai/index.js'
import { MdLogout } from 'react-icons/md/index.js'
import { useAuth } from '@storecraft/sdk-react-hooks'
import { GradientFillIcon } from './common-button.jsx'
import ShowIf from './show-if.jsx'
import Notifications from './notifications.jsx'
import NotificationButton from './notifications-button.jsx'
import DarkMode from './dark-mode.jsx'
import useOnClickOutside from '../hooks/useOnClickOutside.js'
import { QuickSearchButton } from './quick-search-browser.jsx'


/**
 * 
 * @typedef {object} InternalActionBarParams
 * @prop {boolean} [menuOpen]
 * @prop {string} [className]
 * @prop {React.MouseEventHandler} [onMenuClick]
 * 
 * 
 * @typedef {InternalActionBarParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
 * } ActionBarParams
 * 
 * 
 * @param {ActionBarParams} params
 * 
 */
const ActionBar = (
  { 
    menuOpen, className='w-full', onMenuClick, ...rest 
  }
) => {
  
  const [openNotifications, setOpenNotifications] = useState(false);
  const {
    auth, isAuthenticated, 
    actions: { 
      signout
    }
  } = useAuth();
  
  const ref_element = useOnClickOutside(
    () => {
      // setDisableEventListener(false);
      setOpenNotifications(false);
    }
  );

  const onClickNotifications = useCallback(
    /**
     * @param {React.MouseEvent<HTMLDivElement, MouseEvent>} e 
     */
    e => {
      e.preventDefault();
      e.stopPropagation();

      setOpenNotifications(o => !o);
    }, []
  );

  const user_name = useMemo(
    () => auth?.firstname ? (', ' + auth?.firstname) : '',
    [auth]
  );

  // console.log(openNotifications)
  
  return (
<nav className={className} {...rest}>
  <div className='relative w-full flex flex-row h-full justify-between items-center '>
    <AiOutlineMenuFold 
        className={
          `text-kf-500 dark:text-kf-400/70 text-4xl top-4 right-4
            cursor-pointer --md:hidden hover-text-pink-600 
            rounded-full transition-all duration-300 
            hover:bg-pink-400 
            hover:text-white dark:hover:text-white 
            p-1.5 hover:p-1 
            ${menuOpen ? 'rotate-0' : 'rotate-180'}`
        }
        onClick={onMenuClick} />
    <div>
      <span children={`Hi`}/>
      <span children={user_name} 
            className='font-semibold '/>
    </div>        
    <div className='flex flex-row gap-3 items-center'>
      <QuickSearchButton />
      <GradientFillIcon 
          Icon={MdLogout} 
          onClick={signout}
          className='text-2xl cursor-pointer' />   
      <NotificationButton 
          isOpen={openNotifications}
          onClick={onClickNotifications}
          /> 
      <DarkMode />

    </div>
    <ShowIf show={openNotifications}>
      <Notifications ref={ref_element} />
    </ShowIf>
  </div>
</nav>
  )
}

export default ActionBar