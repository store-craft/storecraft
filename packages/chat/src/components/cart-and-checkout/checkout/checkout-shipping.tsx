import { useCart, useCheckout } from "@storecraft/sdk-react-hooks";
import { useCallback } from "react"
import { MdOutlineArrowBack, MdOutlineLocalShipping } from "react-icons/md";
import { CheckoutProps } from ".";
import { Button } from "../common/button";

export const CheckoutShipping = (
  {
    checkout, ...rest
  } : CheckoutProps
) => {
  const {
  } = useCheckout();

  const onNext = useCallback(
    () => {
      // perform validation
      if(true) {
        checkout?.next();
      }
    }, [checkout]
  );

  return(
    <div {...rest}>
      <div 
        className='w-full h-full flex flex-col 
          chat-text  chat-bg border-l'>

        {/* Cart Header */}
        <Header 
          className='w-full' 
          checkout={checkout} 
        />

        {/* Footer */}
        <Button 
          children='Next'
          className='w-full h-fit ' 
          onClick={onNext}
        />

      </div>
    </div>
  )
}

const Header = (
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
            className='font-semibold text-xl uppercase 
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

const Footer = (
  {
    checkout, ...rest
  } : CheckoutProps
) => {
  const { quickSubTotal } = useCart();

  return (
    <div {...rest}>
      <div 
        className='w-full p-2 border-t'>
        <div 
          className='flex flex-row w-full justify-between 
            items-center --border-b py-2 font-semibold'>
          <span 
            className='font-bold text-xl --tracking-wide uppercase italic'
            children='Sub-Total'/>
          <span 
            children={quickSubTotal ?? 0} 
            className='font-normal font-mono
              text-base' 
          />
        </div>
      </div>
    </div>
  )
}