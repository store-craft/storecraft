import React, { useMemo } from 'react'

const ShowIf = (
  {
    show, children
  }: {
    show: any,
    children: React.ReactNode
  }
) => {

  if(Boolean(show)) return (children)
  return null
}

export const ShowSwitch = (
  { 
    index=0, children, ...rest 
  } : {
    index?: number,
  } & React.ComponentProps<'div'>
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
  }: {
    toggle?: boolean,
  } & React.ComponentProps<'div'> & {
    children: React.ReactNode
  }
) => {
    
  return (
    <ShowSwitch index={toggle ? 0 : 1} 
            children={children} {...rest}/>
  )
}
  
export default ShowIf
