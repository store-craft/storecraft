import { useCart } from "@storecraft/sdk-react-hooks";
import { MdOutlineArrowBack, MdOutlineLocalShipping } from "react-icons/md";
import { CheckoutProps } from ".";

export const Header = (
  {
    checkout, ...rest
  } : CheckoutProps
) => {

  return (
    <div {...rest}>
      <div 
        className='flex flex-row w-full justify-between 
          items-center border-b p-2 font-semibold'>
        <MdOutlineArrowBack 
          className='text-xl cursor-pointer' 
          onClick={checkout?.back}
        />    
        <div className="flex flex-row gap-2 items-center">
          <MdOutlineLocalShipping className='text-2xl' />
          <span 
            className='font-thin text-xl uppercase 
              italic tracking-tight'
            children='Shipping'/>
        </div>
        <span 
          className='font-medium text-base 
            font-mono' 
          children={``} 
        />
      </div>    
    </div>
  )
}
