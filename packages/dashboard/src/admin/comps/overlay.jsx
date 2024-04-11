import React, { 
  useImperativeHandle, useState, 
  useCallback, useEffect } from 'react'
import Transition from './transition.jsx'
import { useRef } from 'react'


/**
 * Imperative interface for public `ref` and for `useImperativeHandle`
 * 
 * @typedef {object} ImpInterface
 * @property {Function} show
 * @property {Function} hide
 * @property {() => boolean} isShown
 */

export const Overlay = React.forwardRef(
  /**
   * 
   * @typedef {React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
   * } OverlayParams
   * 
   * @param {OverlayParams} params
   * @param {*} ref 
   * 
   */
  (
    { 
      children, ...rest 
    }, ref
  ) => {

  const [vis, setVis] = useState(false)

  useImperativeHandle(
    ref,
    () => ({
      show : ()=>setVis(true),
      hide: ()=>setVis(false),
      isShown: ()=>vis
    }),
    [vis, ref],
  );

  /** @type {React.KeyboardEventHandler} */
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') setVis(false);
    }, []
  );

  const unsub = useRef(() => {})

  /** @type {React.EventHandler<React.MouseEvent>} */
  const onClickOutside = useCallback(
    (e) => {
      e.preventDefault()
      history.back()
      setVis(false)
    }, [history]
  );

  useEffect(
    () => {
      unsub.current && unsub.current()

      /** @type {EventListener} */
      const sub = (e) => {
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
  );
  
  return (
<Transition 
    unMountOnExit={false} 
    show={vis} 
    duration={400} 
    onKeyDown={onKeyDown}
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
