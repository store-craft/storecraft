import React, { useMemo } from 'react'

export type ShowIfParams = {
  show: any;
  children: React.ReactNode;
};

export type ShowSwitchParams = {
  index?: number;
} & React.ComponentProps<'div'>;

export type InternalShowBinarySwitchParams = {
  toggle?: any;
};


const ShowIf = (
  {
    show, children
  } : ShowIfParams
) => {

  if(Boolean(show)) return (children)
  return null
}

export const ShowSwitch = (
  { 
    index=0, children, ...rest 
  } : ShowSwitchParams
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
  
export const ShowBinarySwitch = (
  { 
    toggle=true, children, ...rest 
  } : InternalShowBinarySwitchParams & ShowSwitchParams
) => {
    
  return (
    <ShowSwitch index={toggle ? 0 : 1} 
            children={children} {...rest}/>
  )
}
  
export default ShowIf
