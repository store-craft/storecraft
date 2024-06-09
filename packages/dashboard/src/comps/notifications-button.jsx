import React, { 
  useCallback, useEffect, useState } from 'react'
import { GradientFillIcon } from './common-button.jsx'
import { IoIosNotifications } from 'react-icons/io/index.js'
import useInterval from '../hooks/useInterval.js'
import ShowIf from './show-if.jsx'
import { MINUTE } from '@/utils/time.js'
import { useCollection } from '@storecraft/sdk-react-hooks'


/**
 * 
 * @typedef {object} InternalBubbleParams
 * @prop {string} [outerClass]
 * @prop {string} [innerClass]
 * 
 * 
 * @typedef {InternalBubbleParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } BubbleParams
 * 
 * 
 * @param {BubbleParams} params
 * 
 */
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


/**
 * 
 * @typedef {object} InternalNotificationButtonParams
 * @prop {boolean} [isOpen=false]
 * @prop {string} [innerClass]
 * 
 * 
 * @typedef {InternalNotificationButtonParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } NotificationButtonParams
 * 
 * 
 * @param {NotificationButtonParams} params
 * 
 */
const NotificationButton = (
  { 
    isOpen=false, onClick, ...rest 
  }
) => {

  const [alert, setAlert] = useState(false)
  const { 
    actions: {
      poll
    } 
  } = useCollection('notifications', { limit: 1 });


  const onInterval = useCallback(
    async () => {
      // const hasChanged =  false;//await sdk.notifications.hasChanged()
      const hasChanged = await poll();
      // console.log('CHANGED ' + hasChanged)
      setAlert(hasChanged)
    }, [poll]
  );

  const {
    stop, start 
  } = useInterval(
    onInterval, MINUTE * 10, false
    // onInterval, MINUTE * 10, false
  );

  useEffect(
    () => {
      if(isOpen) {
        stop()
        setAlert(false)
      }
      else start()
    }, [isOpen, start, stop]
  );
  
  return (
<div className='relative' onClick={onClick}>

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
