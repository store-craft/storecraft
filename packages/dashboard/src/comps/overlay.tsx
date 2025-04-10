import React, { 
  useImperativeHandle, useState, 
  useCallback, useEffect } from 'react'
import Transition from './transition'
import { useRef } from 'react'

export type OverlayParams = React.ComponentProps<'div'>;

/**
 * Imperative interface for public `ref` and for `useImperativeHandle`
 */
export type ImpInterface = {
  show: Function;
  hide: Function;
  isShown: () => boolean;
};

export const Overlay = React.forwardRef(
  (
    { 
      children, ...rest 
    }: OverlayParams, ref
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

  const onClickOutside: React.EventHandler<React.MouseEvent> = useCallback(
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
        e.stopPropagation();
        e.preventDefault();

        setVis(false);
      }

      unsub.current = () => {
        window.removeEventListener('popstate', sub)
      }

      if(vis) {
        history.pushState(
          null, 
          document.title, 
          location.href
        );
        window.addEventListener(
          'popstate',
          sub
        );
      } 

      return unsub.current;
    }, [vis, window]
  );
  
  return (
<Transition 
  dash={
    {
      unMountOnExit:true,
      show: vis,
      duration: 400,
      enter: 'transition-all duration-300 ease-in-out',
      enterFrom: 'opacity-0', 
      enterTo: 'opacity-100',
      leave: 'transition-all duration-300',
      leaveFrom: 'opacity-100',
      leaveTo: 'opacity-0' 
    }
  }
  onKeyDown={onKeyDown}
  className={
    `z-[100] w-full h-full 
    bg-teal-900/20 dark:bg-teal-900/10 backdrop-blur-sm fixed inset-0 
      flex flex-row justify-center items-center`
  }
  onClick={onClickOutside}
  children={children}/>
  )
})
