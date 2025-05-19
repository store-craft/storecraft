import { useCart, useCheckout } from "@storecraft/sdk-react-hooks";
import { useCallback } from "react"
import { MdClose } from "react-icons/md";
import { CheckoutProps } from ".";
import { IoMdContact } from "react-icons/io";
import { Button } from "../common/button";
import { Input } from "../common/input";
import { CountrySelect } from "../common/country-select";

export const CheckoutContactContact = (
  {
    checkout, ...rest
  } : CheckoutProps
) => {
  const {
  } = useCheckout();


  return(
    <div {...rest}>
      <div 
        className='w-full h-full flex flex-col 
          chat-text chat-bg gap-3'>
        
        <p 
          children='Contact' 
          className='w-full text-lg 
            font-medium tracking-wider'
        />

        <Input 
          className='w-full'
          input={{
            title: 'Email',
            inputClassName: 'border h-12'
          }}
        />
      </div>
    </div>
  )
}
