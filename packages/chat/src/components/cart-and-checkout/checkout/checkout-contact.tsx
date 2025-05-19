import { useCart, useCheckout } from "@storecraft/sdk-react-hooks";
import { useCallback } from "react"
import { MdClose } from "react-icons/md";
import { CheckoutProps } from ".";
import { IoMdContact } from "react-icons/io";
import { Button } from "../common/button";
import { CheckoutContactContact } from "./checkout-contact-contact";
import { CheckoutContactAddress } from "./checkout-contact-address";

export const CheckoutContact = (
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
          chat-text  chat-bg border-l '>
        {/* Cart Header */}
        <Header 
          className='w-full' 
          checkout={checkout} 
        />

        <div 
          className='w-full flex-1 gap-5 overflow-y-auto'>
            
          {/* content */}
          <div 
            className='w-full flex flex-col gap-5 p-2 '>
            <CheckoutContactContact
              className='w-full' 
          />

          <CheckoutContactAddress 
            className='w-full'
          />

        </div>

        </div>

        {/* Footer */}
        <Button 
          children='Next'
          className='w-full h-fit cursor-pointer ' 
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
        <MdClose 
          className='text-xl cursor-pointer' 
          onClick={checkout?.close}
        />    
        <div className="flex flex-row gap-2 items-center">
          <IoMdContact className='text-2xl' />
          <span 
            className='font-semibold text-xl uppercase 
              italic tracking-tight'
            children='Contact'/>
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

