import { useEffect, useRef, useState } from 'react'

/**
 * 
 * @typedef {object} InnerTransitionParams
 * @prop {boolean} show
 * @prop {boolean} unMountOnExit
 * @prop {number} duration
 * @prop {string} enter class-names for `event`
 * @prop {string} enterFrom class-names for `event`
 * @prop {string} enterTo class-names for `event`
 * @prop {string} leave class-names for `event`
 * @prop {string} leaveFrom class-names for `event`
 * @prop {string} leaveTo class-names for `event`
 * 
 * 
 * 
 * @param {InnerTransitionParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params
 * 
 */
const Transition = ( 
  { 
    show, duration, unMountOnExit, 
    enter, enterFrom, enterTo, 
    leave, leaveFrom, leaveTo, 
    children, className, ...rest 
  }
) => {

  // animation state is binary
  const [_show, setShow] = useState(false)
  const [cls, setC] = useState('hidden')

  /** @type {React.MutableRefObject<{ timer?: any }>} */
  const animation = useRef({})

  // console.log({
  //   _show, show, cls
  // })

  useEffect(() => {
    // clear current animation if any
    if(animation.current.timer)
      clearTimeout(animation.current.timer)

    if(!show) {
      if(_show) {
        // create a new timer/animation
        setC(`${leave} ${leaveFrom}`)
        setTimeout(() => setC(`${leave} ${leaveTo}`), 0)

        animation.current.timer = setTimeout(
          () => {
            setShow(false)
            setC(c => `${c} hidden`)
          }, 
          duration
        )
      } else {
        setC('hidden')
      }

    } else {
      setC(`${enter} block ${enterFrom}`)
      setShow(true)
      setTimeout(
        () => setC(`${enter} block ${enterTo}`), 
        0
      )

    }
  
    return () => clearTimeout(animation.current.timer)
  }, [show, duration])
  
  const final_show = (_show) || !unMountOnExit

  return (    
<>
{ 
  final_show && (
    <div 
        children={children} 
        className={`${cls} ${className}`} 
        {...rest} />
  ) 
}
</>
  )
}

export default Transition