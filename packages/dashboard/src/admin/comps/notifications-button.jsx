import React, { 
  useCallback, useEffect, useState } from 'react'
import { getSDK } from '@/admin-sdk/index.js'
import { GradientFillIcon } from './common-button.jsx'
import { IoIosNotifications } from 'react-icons/io/index.js'
import useInterval from '../hooks/useInterval.js'
import ShowIf from './show-if.jsx'
import { MINUTE } from '@/admin/utils/time.js'

const Bubble = (
  { 
    outerClass='bg-white animate-bounce', 
    innerClass='bg-red-500', ...rest 
  }
) => {

  return (
<div {...rest} >
  <div className={`w-full h-full rounded-full p-0.5 ${outerClass}`}>
    <div className={`w-full h-full rounded-full ${innerClass}`}/>
  </div>    
</div>    
  )
}

const NotificationButton = 
  ({ isOpen=false, ...rest }) => {
  
  const [alert, setAlert] = useState(false)
  
  const onInterval = useCallback(
    async () => {
      const hasChanged = await getSDK().notifications.hasChanged()
      console.log('CHANGED ' + hasChanged)
      setAlert(hasChanged)
    }, [getSDK()]
  )

  const {
    stop, start 
  } = useInterval(
    onInterval, MINUTE*10, false
  )

  useEffect(
    () => {
      if(isOpen) {
        stop()
        setAlert(false)
      }
      else start()
    }, [isOpen, start, stop]
  )
  
  return (
<div className='relative'>

  <GradientFillIcon 
      Icon={IoIosNotifications} 
      className='h-6 w-6 cursor-pointer'
      {...rest} />    

  <ShowIf show={alert}>
    <Bubble className='absolute w-3 h-3 top-px right-0' />
  </ShowIf>
</div>    
  )
}

export default NotificationButton
