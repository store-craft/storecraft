
/**
 * 
 * @param {object} p
 * @param {any} p.show
 * @param {any} p.children
 */
const ShowIf = ({show, children}) => {
  if(Boolean(show)) return (children)
  return null
}

import React, { useMemo } from 'react'

export const ShowSwitch = ({ index=0, children, ...rest }) => {
  if(index >= React.Children.count(children))
    return (null)

  const arr = useMemo(
    () => React.Children.toArray(children),
    [children]
  ) 

  return (
    <div {...rest}>
      {
        arr[index]
      }
    </div>
  )
}
  
export const ShowBinarySwitch = 
  ({ toggle=true, children, ...rest }) => {
    
  return (
    <ShowSwitch index={toggle ? 0 : 1} 
            children={children} {...rest}/>
  )
}
  
export default ShowIf
