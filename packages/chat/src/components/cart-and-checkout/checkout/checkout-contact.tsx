import { useCart, useCheckout } from "@storecraft/sdk-react-hooks";
import { useCallback, useRef } from "react"
import { MdClose } from "react-icons/md";
import { CheckoutProps } from ".";
import { IoMdContact } from "react-icons/io";
import { Button } from "../../common/button";
import { 
  CheckoutContactContact, CheckoutContactImperativeInterface 
} from "./checkout-contact-contact";
import { 
  CheckoutAddressimperativeInterface, CheckoutContactAddress 
} from "./checkout-contact-address";
import { HookedOrderSummary } from "./order-summary";

export const CheckoutContact = (
  {
    checkout, ...rest
  } : CheckoutProps
) => {
  const {
    suggested: {
      setAddress,
      setContact
    }
  } = useCheckout();

  const onSubmit: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.preventDefault();
      
      const address_result = ref_address.current?.getAddress();
      const contact_result = ref_contact.current?.getContact();
      const isValid = contact_result?.isValid 
        && address_result?.isValid;

      if(!isValid) {
        // show error
        return;
      }

      setAddress(
        address_result?.address
      );
      setContact(
        contact_result?.contact
      );

      checkout?.next();

    }, [checkout]
  );

  const ref_address = useRef<CheckoutAddressimperativeInterface>(null);
  const ref_contact = useRef<CheckoutContactImperativeInterface>(null);

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
            className='w-full flex flex-col gap-5 p-2 '
          >
            <CheckoutContactContact
              ref={ref_contact}
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
        
        <HookedOrderSummary
          className='w-full h-fit --p-2'
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
          onClick={checkout?.exit}
        />    
        <div className="flex flex-row gap-2 items-center">
          <IoMdContact className='text-2xl' />
          <span 
            className='font-thin text-xl uppercase 
              italic tracking-wide'
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

