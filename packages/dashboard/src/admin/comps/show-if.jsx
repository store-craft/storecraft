
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

/**
 * @typedef {object} internalShowSwitchParams
 * @prop {number} [index=0]
 * @prop {import('react').ReactNode} children
 * 
 * @typedef {internalShowSwitchParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } ShowSwitchParams
 * 
 * @param {ShowSwitchParams} param
 */
export const ShowSwitch = ({ index=0, children, ...rest }) => {
  if(index >= React.Children.count(children))
    return (null)

  const arr = useMemo(
    () => React.Children.toArray(children),
    [children]
  ); 

  return (
    <div {...rest}>
      {
        arr[index]
      }
    </div>
  )
}
  
/**
 * @typedef {object} InternalShowBinarySwitchParams
 * @prop {any} [toggle=true]
 * 
 * @param {InternalShowBinarySwitchParams & ShowSwitchParams} param0 
 * 
 * @returns 
 */
export const ShowBinarySwitch = (
  { 
    toggle=true, children, ...rest 
  }
) => {
    
  return (
    <ShowSwitch index={toggle ? 0 : 1} 
            children={children} {...rest}/>
  )
}
  
export default ShowIf
