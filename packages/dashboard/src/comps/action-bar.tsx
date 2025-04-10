import React, { useCallback, useMemo, useState } from 'react'
import { AiOutlineMenuFold } from 'react-icons/ai'
import { MdLogout } from 'react-icons/md'
import { useAuth } from '@storecraft/sdk-react-hooks'
import { GradientFillIcon } from './common-button'
import ShowIf from './show-if'
import Notifications from './notifications'
import NotificationButton from './notifications-button'
import DarkMode from './dark-mode'
import useOnClickOutside from '@/hooks/use-on-click-outside'
import { QuickSearchButton } from './quick-search-browser'

export type ActionBarParams = {
  menuOpen?: boolean;
  className?: string;
  onMenuClick?: React.MouseEventHandler;
} & React.ComponentProps<'nav'>;

const ActionBar = (
  { 
    menuOpen, className='w-full', onMenuClick, ...rest 
  }: ActionBarParams
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
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.preventDefault();
      e.stopPropagation();

      setOpenNotifications(o => !o);
    }, []
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
      <span children={`Hi `}/>
      <span children={auth?.access_token?.claims?.firstname} 
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