import { useState } from "react"

/**
 * 
 * @typedef {object} DrawerParams
 * @prop {React.ReactNode} [button]
 * @prop {boolean} [isOpen=true]
 * 
 * 
 * @param {DrawerParams & 
 *  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
 * } params
 * 
 */
const Drawer = (
  { 
    children, isOpen=true, button='press', ...rest 
  }
) => {

  const [open, setopen] = useState(isOpen);

  return (
<div {...rest}>
  {
    button && 
    <div 
        className='h-fit w-full cursor-pointer'
        onClick={() => setopen(v => !v)}
        children={button}/>
  }
  <div 
      children={children} 
      className={`--bg-red-200 transition-max-height duration-100
                  ${isOpen ? 'max-h-[10rem]' : 'max-h-0'}
                  overflow-hidden
                  `
                }/>
</div>    
  )
}

export default Drawer