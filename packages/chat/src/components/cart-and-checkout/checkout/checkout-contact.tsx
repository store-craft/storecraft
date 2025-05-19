import { useCart, useCheckout } from "@storecraft/sdk-react-hooks";
import { useCallback, useRef } from "react"
import { MdClose } from "react-icons/md";
import { CheckoutProps } from ".";
import { IoMdContact } from "react-icons/io";
import { Button } from "../common/button";
import { CheckoutContactContact } from "./checkout-contact-contact";
import { CheckoutAddressimperativeInterface, CheckoutContactAddress } from "./checkout-contact-address";

export const CheckoutContact = (
  {
    checkout, ...rest
  } : CheckoutProps
) => {
  const {
    suggested: {
      setAddress
    }
  } = useCheckout();

  const onNext = useCallback(
    () => {
      // perform validation
      if(true) {
        checkout?.next();
      }
    }, [checkout]
  );

  const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      e.preventDefault();
      
      const address_result = ref_address.current?.getAddress();

      if(!address_result?.isValid) {
        // show error
        return;
      }

      setAddress(
        address_result?.address
      );
    }, [checkout]
  );

  const ref_address = useRef<CheckoutAddressimperativeInterface>(null);

  return(
    <div {...rest}>
      <form 
        className='w-full h-full flex flex-col 
          chat-text  chat-bg border-l '
        onSubmit={onSubmit}>
        {/* Cart Header */}
        <Header 
          className='w-full' 
          checkout={checkout} 
        />

        <div 
          className='w-full flex-1 gap-5 overflow-y-auto'>
            
          {/* content */}
          <div 
            className='w-full flex flex-col gap-5 p-2 '
          >
            <CheckoutContactContact
              className='w-full' 
            />
            <CheckoutContactAddress 
              ref={ref_address}
              className='w-full'
            />
          </div>

        </div>

        {/* Footer */}
        <Button 
          type="submit"
          children='Next'
          className='w-full h-fit cursor-pointer ' 
          onClick={onSubmit}
        />

      </form>
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

