import { useEffect, useRef, useState } from "react";

/**
 * This hook will give a `div` reference and will decide based
 * on scrolling if a `delta` area was going up or down more than 
 * `delta` threshold.
 * 
 * This can be used to `open` or `close` a switch, which can be
 * used for many things.
 * 
 * @param {number} [scroll_delta=100] 
 * @param {boolean} [default_open=true] 
 * 
 */
export const useScrollDelta = (scroll_delta  = 100, default_open = true) => {
  /** @type {React.LegacyRef<HTMLDivElement>} */
  const ref_scroll_element = useRef();
  /** 
   * @type {React.LegacyRef<
   *  { 
   *    state?: 0 | 1,
   *    latestPos?: number,
   *    latestTurn?: number,
   *  }
   * >} 
   */
  const state = useRef({})

  const [open, setOpen] = useState(default_open);

  useEffect(
    () => {
      ref_scroll_element.current.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    }, []
  );

  useEffect(
    () => {
      const DOWN = 0
      const UP = 1
      const D = 100

      state.current.state = DOWN
      state.current.latestPos = undefined//main_ref.current.scrollTop
      state.current.latestTurn = undefined//main_ref.current.scrollTop
      ref_scroll_element.current.onscroll = function(e) {
        var currentScrollPos = ref_scroll_element.current.scrollTop;
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
        ref_scroll_element.current && 
        (ref_scroll_element.current.onscroll = undefined);
      }
    }, []
  );

  return {
    ref_scroll_element,
    open
  }
}
