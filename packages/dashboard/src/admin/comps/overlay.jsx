import React, { 
  useImperativeHandle, useState, 
  useCallback, useEffect } from 'react'
import Transition from './transition.jsx'
import { useRef } from 'react'

export const Overlay = React.forwardRef(({ children, ...rest }, ref) => {
  const [vis, setVis] = useState(false)

  useImperativeHandle(
    ref,
    () => ({
      show : ()=>setVis(true),
      hide: ()=>setVis(false),
      isShown: ()=>vis
    }),
    [vis, ref],
  )

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') setVis(false)
  }, [])

  const unsub = useRef(() => {})

  const onClickOutside = useCallback(
    e => {
      e.preventDefault()
      history.back()
      setVis(false)
    }, [history]
  )

  useEffect(
    () => {
      unsub.current && unsub.current()

      const sub = e => {
        e.stopPropagation()
        e.preventDefault()
        setVis(false)
      }

      unsub.current = () => {
        window.removeEventListener('popstate', sub)
      }

      if(vis) {
        history.pushState(
          null, 
          document.title, 
          location.href
        )
        window.addEventListener(
          'popstate',
          sub
        )
      } 
      return unsub.current
    }, [vis, window]
  )
  
  return (
<Transition unMountOnExit={false} show={vis} 
            duration={400} onKeyDown={onKeyDown}
    enter='transition-all duration-300 ease-in-out' 
    enterFrom='opacity-0' enterTo='opacity-100' 
    leave='transition-all duration-300' 
    leaveFrom='opacity-100' leaveTo='opacity-0' 
    className={`z-50 w-screen h-screen 
              bg-teal-900/20 dark:bg-teal-900/10 backdrop-blur-sm fixed inset-0 
              flex flex-row justify-center items-center
             `}
    onClick={onClickOutside}>
  { 
    children 
  }
</Transition>    
    )
})
