import React, { useState } from "react"

export type DrawerParams = {
  button?: React.ReactNode;
  isOpen?: boolean;
} & React.ComponentProps<'div'>

const Drawer = (
  { 
    children, isOpen=true, button='press', ...rest 
  } : DrawerParams
) => {

  const [open, setopen] = useState(isOpen);

  return (
<div {...rest}>
  {
    button && 
    <div 
      className='h-fit w-full cursor-pointer'
      onClick={() => setopen(v => !v)}
      children={button}
    />
  }
  <div 
    children={children} 
    className={`--bg-red-200 transition-[max-height] duration-0
                ${isOpen ? 'max-h-[40rem]' : 'max-h-0'}
                overflow-hidden
                `
              }
  />
</div>    
  )
}

export default Drawer