import React, { useCallback, useMemo, useState } from "react";
import useInterval from "../hooks/useInterval.js";

/**
 * Lazy ass `carousel`
 * 
 * @typedef {object} InnerCarouselParams
 * @prop {number} [millis=3000]
 * 
 * @param {InnerCarouselParams &
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params
 * 
 */
const LazyCarousel = (
  { 
    millis=3000, children, ...rest
  }
) => {

  const [c, setC] = useState(-1)
  const children_ = useMemo(
    () => children ? React.Children.toArray(children) : [],
    [children]
  );

  const count = children_.length

  const cb = useCallback(
    () => setC(cc => (cc+1)%count),
    [count]
  );

  const key_prev = (c-1 + count)%count;
  const key_next = (c + count)%count;

  useInterval(
    cb, millis
  );

  return (
<div {...rest} >
  <div className='relative w-full h-full'>
    <div className='absolute left-0 top-0 w-full h-full animate-fadeout' 
      key={key_prev}
      style={{'animation-fill-mode': 'forwards'}}>
      {children_[key_prev]}
    </div>
    <div className='absolute left-0 top-0 w-full h-full animate-fadein' 
          key={key_next}
          style={{'animation-fill-mode': 'forwards'}}>
      {children_[key_next]}
    </div>
  </div>
</div>    
  )
}


export default LazyCarousel;