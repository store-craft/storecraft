import React, { useMemo } from 'react'

/**
 * 
 * @typedef {object} ShowIfParams
 * @prop {any} show
 * @prop {import('react').ReactNode} children
 * 
 * 
 * @param {ShowIfParams} params
 */
const ShowIf = (
  {
    show, children
  }
) => {

  if(Boolean(show)) return (children)
  return null
}

/**
 * @typedef {object} internalShowSwitchParams
 * @prop {number} [index=0]
 * 
 * @typedef {internalShowSwitchParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } ShowSwitchParams
 * 
 * @param {ShowSwitchParams} param
 */
export const ShowSwitch = (
  { 
    index=0, children, ...rest 
  }
) => {

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
 * @param {InternalShowBinarySwitchParams & ShowSwitchParams} params 
 * 
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
