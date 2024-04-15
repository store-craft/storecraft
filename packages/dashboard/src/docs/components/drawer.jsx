import { useState } from "react"


const Drawer = ({ children, isOpen=true, button='press', ...rest }) => {
  const [open, setopen] = useState(isOpen)

  return (
<div {...rest}>
  <div className='h-fit w-full cursor-pointer'
       onClick={() => setopen(v => !v)}>
    {
      button
    }
  </div>
  <div children={children} 
        className={`--bg-red-200 transition-max-height duration-500
                    ${open ? 'max-h-[40rem]' : 'max-h-0'}
                    overflow-hidden
                    `
  }               />
</div>    
  )
}

export default Drawer